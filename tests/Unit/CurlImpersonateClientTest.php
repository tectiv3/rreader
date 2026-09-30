<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\CurlImpersonateClient;
use App\Services\CurlImpersonateResult;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class CurlImpersonateClientTest extends TestCase
{
    private const BINARY = '/opt/curl-impersonate/curl_chrome136';

    public function test_configured_requires_a_non_empty_executable_path(): void
    {
        config(['services.curl_impersonate.binary' => null]);
        $this->assertFalse((new CurlImpersonateClient)->configured());

        config(['services.curl_impersonate.binary' => __FILE__]);
        $this->assertFalse((new CurlImpersonateClient)->configured());

        config(['services.curl_impersonate.binary' => PHP_BINARY]);
        $this->assertTrue((new CurlImpersonateClient)->configured());
    }

    public function test_builds_the_feed_command_with_redirects_and_no_size_cap(): void
    {
        config(['services.curl_impersonate.binary' => self::BINARY]);
        $captured = [];

        Process::fake(function (PendingProcess $process) use (&$captured): mixed {
            $captured = $process->command;

            return Process::result("\n__CURL_META__200\ttext/html\t\t0");
        });

        (new CurlImpersonateClient)->fetch('https://example.com/feed', followRedirects: true, totalTimeout: 15, processTimeout: 25);

        $this->assertSame([
            self::BINARY, '-s', '-S', '--noproxy', '*',
            '--connect-timeout', '5', '--max-time', '15', '-L',
            '-w', "\n__CURL_META__%{http_code}\\t%{content_type}\\t%{redirect_url}\\t%{size_download}",
            'https://example.com/feed',
        ], $captured);
        $this->assertNotContains('--max-filesize', $captured);
        $this->assertNotContains('--resolve', $captured);
    }

    public function test_builds_the_web_fetch_hop_command_with_resolve_and_size_cap(): void
    {
        config(['services.curl_impersonate.binary' => self::BINARY]);
        $captured = [];

        Process::fake(function (PendingProcess $process) use (&$captured): mixed {
            $captured = $process->command;

            return Process::result("\n__CURL_META__200\ttext/html\t\t0");
        });

        (new CurlImpersonateClient)->fetch(
            'https://example.com/page',
            resolve: ['example.com:443:93.184.216.34'],
            followRedirects: false,
            maxBytes: 2097152,
            connectTimeout: 5,
            totalTimeout: 10,
            processTimeout: 15,
        );

        $this->assertNotContains('-L', $captured);
        $this->assertContains('--max-filesize', $captured);
        $this->assertContains('2097152', $captured);
        $this->assertContains('--resolve', $captured);
        $this->assertContains('example.com:443:93.184.216.34', $captured);
        $this->assertContains('--max-time', $captured);
        $this->assertContains('10', $captured);
    }

    public function test_omits_the_size_cap_when_max_bytes_is_zero(): void
    {
        config(['services.curl_impersonate.binary' => self::BINARY]);
        $captured = [];

        Process::fake(function (PendingProcess $process) use (&$captured): mixed {
            $captured = $process->command;

            return Process::result("\n__CURL_META__200\t\t\t0");
        });

        (new CurlImpersonateClient)->fetch('https://example.com/feed', maxBytes: 0);

        $this->assertNotContains('--max-filesize', $captured);
    }

    public function test_parses_the_status_marker_fields(): void
    {
        $result = $this->fetchWithOutput("hello body\n__CURL_META__200\ttext/html\thttps://example.com/next\t42");

        $this->assertSame(200, $result->status);
        $this->assertSame('text/html', $result->contentType);
        $this->assertSame('https://example.com/next', $result->redirectUrl);
        $this->assertSame(42, $result->sizeDownload);
        $this->assertSame('hello body', $result->body);
        $this->assertNull($result->error);
    }

    public function test_parses_empty_optional_fields_as_null(): void
    {
        $result = $this->fetchWithOutput("body\n__CURL_META__204\t\t\t0");

        $this->assertSame(204, $result->status);
        $this->assertNull($result->contentType);
        $this->assertNull($result->redirectUrl);
        $this->assertNull($result->error);
    }

    public function test_http_error_statuses_are_not_transport_errors(): void
    {
        $result = $this->fetchWithOutput("not found\n__CURL_META__404\ttext/html\t\t9");

        $this->assertSame(404, $result->status);
        $this->assertNull($result->error);
    }

    public function test_reports_the_size_cap_on_exit_63(): void
    {
        $result = $this->fetchWithOutput('', 63, '', 2097152);

        $this->assertSame(0, $result->status);
        $this->assertSame('', $result->body);
        $this->assertNotNull($result->error);
        $this->assertStringContainsString('size cap', $result->error);
    }

    public function test_reports_a_missing_status_marker(): void
    {
        $result = $this->fetchWithOutput('no marker');

        $this->assertNotNull($result->error);
        $this->assertSame('', $result->body);
    }

    public function test_reports_a_generic_non_zero_exit_with_stderr(): void
    {
        $result = $this->fetchWithOutput('', 7, 'curl: (7) Failed to connect');

        $this->assertNotNull($result->error);
        $this->assertStringContainsString('7', $result->error);
        $this->assertStringContainsString('Failed to connect', $result->error);
    }

    private function fetchWithOutput(string $output, int $exitCode = 0, string $errorOutput = '', int $maxBytes = 0): CurlImpersonateResult
    {
        config(['services.curl_impersonate.binary' => self::BINARY]);

        Process::fake(fn (): mixed => Process::result($output, $errorOutput, $exitCode));

        return (new CurlImpersonateClient)->fetch('https://example.com/x', maxBytes: $maxBytes);
    }
}
