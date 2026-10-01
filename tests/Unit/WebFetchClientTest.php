<?php

namespace Tests\Unit;

use App\Chat\WebFetchClient;
use App\Chat\WebFetchHopResponse;
use Closure;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionMethod;
use Tests\TestCase;

class WebFetchClientTest extends TestCase
{
    public static function blockedAddressProvider(): array
    {
        return [
            'loopback v4' => ['127.0.0.1'],
            'loopback v4 high edge' => ['127.255.255.255'],
            'private 10/8' => ['10.1.2.3'],
            'private 172.16/12 low edge' => ['172.16.0.1'],
            'private 172.16/12 high edge' => ['172.31.255.255'],
            'private 192.168/16' => ['192.168.1.1'],
            'link-local v4' => ['169.254.169.254'],
            'cgnat low edge' => ['100.64.0.1'],
            'cgnat tailnet style' => ['100.78.246.86'],
            'cgnat high edge' => ['100.127.255.255'],
            'unspecified v4' => ['0.0.0.0'],
            'unspecified v4 high' => ['0.255.255.255'],
            'v6 loopback' => ['::1'],
            'v6 unspecified' => ['::'],
            'unique-local fc00::/7' => ['fc00::1'],
            'unique-local fd (ULA)' => ['fd12:3456:789a::1'],
            'link-local v6' => ['fe80::1'],
            'nat64 loopback' => ['64:ff9b::7f00:1'],
            'nat64 prefix edge' => ['64:ff9b::'],
            'nat64 private 10/8' => ['64:ff9b::a00:5'],
            'nat64 local-use loopback' => ['64:ff9b:1::7f00:1'],
            '6to4 loopback' => ['2002:7f00:1::'],
            '6to4 private 10/8' => ['2002:a00:5::'],
            'teredo' => ['2001:0:4136:e378:8000:63bf:3fff:fdd2'],
            'v4-mapped loopback' => ['::ffff:127.0.0.1'],
            'v4-mapped private' => ['::ffff:10.0.0.5'],
            'v4-mapped hex form' => ['::ffff:7f00:1'],
            'v4-compatible loopback' => ['::127.0.0.1'],
            'unparseable input fails closed' => ['example.com'],
        ];
    }

    #[DataProvider('blockedAddressProvider')]
    public function test_blocks_private_and_reserved_ranges(string $address): void
    {
        $this->assertTrue(WebFetchClient::isBlockedAddress($address));
    }

    public static function allowedAddressProvider(): array
    {
        return [
            'public v4' => ['93.184.216.34'],
            'public v4 dns' => ['8.8.8.8'],
            'below cgnat' => ['100.63.255.255'],
            'above cgnat' => ['100.128.0.0'],
            'below 172.16/12' => ['172.15.255.255'],
            'above 172.16/12' => ['172.32.0.1'],
            'public v6' => ['2606:4700::'],
            'public v6 google dns' => ['2001:4860:4860::8888'],
            'nat64 public v4' => ['64:ff9b::5db8:d822'],
            'nat64 local-use public v4' => ['64:ff9b:1::5db8:d822'],
            '6to4 public v4' => ['2002:5db8:d822::'],
            'v4-mapped public v4' => ['::ffff:93.184.216.34'],
        ];
    }

    #[DataProvider('allowedAddressProvider')]
    public function test_allows_public_addresses(string $address): void
    {
        $this->assertFalse(WebFetchClient::isBlockedAddress($address));
    }

    public function test_returns_the_body_and_final_url(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(200, ['Content-Type: text/html'], '<html><body>hello</body></html>'),
        ]);

        $result = $client->fetch('https://example.com/page');

        $this->assertFalse($result->failed());
        $this->assertSame('<html><body>hello</body></html>', $result->body);
        $this->assertSame('https://example.com/page', $result->finalUrl);
    }

    public function test_rejects_non_http_schemes_before_any_request(): void
    {
        $requestedUrls = [];
        $client = $this->client([], requestedUrls: $requestedUrls);

        foreach (['ftp://example.com/file', 'file:///etc/passwd', 'javascript:alert(1)', 'example.com/no-scheme'] as $url) {
            $result = $client->fetch($url);

            $this->assertTrue($result->failed(), $url);
            $this->assertNotNull($result->error);
            $this->assertStringStartsWith('Scheme ', $result->error, $url);
        }

        $this->assertSame([], $requestedUrls);
    }

    public function test_rejects_urls_without_a_host(): void
    {
        $client = $this->client([]);

        $result = $client->fetch('http:/path-only');

        $this->assertTrue($result->failed());
        $this->assertSame('URL rejected: no host.', $result->error);
    }

    public function test_rejects_unparseable_urls(): void
    {
        $client = $this->client([]);

        $result = $client->fetch('https:///missing-host');

        $this->assertSame('URL rejected: could not be parsed.', $result->error);
    }

    public function test_rejects_unparseable_redirect_locations(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(302, ['Location: http://[::1'], ''),
        ]);

        $result = $client->fetch('https://example.com/a');

        $this->assertSame('URL rejected: could not be parsed.', $result->error);
    }

    public function test_pins_all_validated_addresses_per_hop(): void
    {
        $captured = [];
        $client = new WebFetchClient(
            transport: function (string $url, array $resolve, int $maxBytes) use (&$captured): WebFetchHopResponse {
                $captured[] = [$url, $resolve];

                return new WebFetchHopResponse(200, [], '');
            },
            resolver: fn (string $host): array => ['93.184.216.34', '2606:4700::'],
        );

        $client->fetch('https://example.com/page');
        $client->fetch('http://example.com:80/page');

        $this->assertSame([
            ['https://example.com/page', ['example.com:443:93.184.216.34', 'example.com:443:[2606:4700::]']],
            ['http://example.com/page', ['example.com:80:93.184.216.34', 'example.com:80:[2606:4700::]']],
        ], $captured);
    }

    public function test_normalizes_and_validates_bracketed_ipv6_literal_hosts(): void
    {
        $resolverCalled = false;
        $client = new WebFetchClient(
            transport: fn (string $url, array $resolve, int $maxBytes): WebFetchHopResponse => new WebFetchHopResponse(200, [], ''),
            resolver: function (string $host) use (&$resolverCalled): array {
                $resolverCalled = true;

                return ['93.184.216.34'];
            },
        );

        $blocked = $client->fetch('http://[::1]/');

        $this->assertTrue($blocked->failed());
        $this->assertSame('Blocked address: ::1 is in a private or reserved range.', $blocked->error);

        $this->assertFalse($client->fetch('https://[2606:4700::]/')->failed());
        $this->assertFalse($resolverCalled);
    }

    public function test_rejects_ports_other_than_80_and_443(): void
    {
        $requestedUrls = [];
        $client = $this->client([], requestedUrls: $requestedUrls);

        foreach (['http://example.com:22/', 'https://example.com:8080/', 'http://example.com:0/'] as $url) {
            $result = $client->fetch($url);

            $this->assertTrue($result->failed(), $url);
            $this->assertStringStartsWith('Port ', $result->error, $url);
        }

        $this->assertSame([], $requestedUrls);
    }

    public function test_rejects_redirects_to_disallowed_ports(): void
    {
        $requestedUrls = [];
        $client = $this->client([
            new WebFetchHopResponse(302, ['Location: http://example.com:22/admin'], ''),
        ], requestedUrls: $requestedUrls);

        $result = $client->fetch('https://example.com/start');

        $this->assertSame('Port 22 rejected: only ports 80 and 443 can be fetched.', $result->error);
        $this->assertSame(['https://example.com/start'], $requestedUrls);
    }

    public function test_allows_explicit_ports_80_and_443(): void
    {
        $captured = [];
        $client = new WebFetchClient(
            transport: function (string $url, array $resolve, int $maxBytes) use (&$captured): WebFetchHopResponse {
                $captured[] = [$url, $resolve];

                return new WebFetchHopResponse(200, [], '');
            },
            resolver: fn (string $host): array => ['93.184.216.34'],
        );

        $this->assertFalse($client->fetch('http://example.com:443/')->failed());
        $this->assertFalse($client->fetch('https://example.com:80/')->failed());

        $this->assertSame([
            ['http://example.com:443/', ['example.com:443:93.184.216.34']],
            ['https://example.com:80/', ['example.com:80:93.184.216.34']],
        ], $captured);
    }

    public function test_hardened_budget_constants(): void
    {
        $this->assertSame(3, WebFetchClient::MAX_HOPS);
        $this->assertSame(5, WebFetchClient::CONNECT_TIMEOUT);
        $this->assertSame(10, WebFetchClient::TOTAL_TIMEOUT);
    }

    public function test_ip_literal_hosts_are_validated_without_dns(): void
    {
        $resolverCalled = false;
        $client = new WebFetchClient(
            transport: fn (string $url, array $resolve, int $maxBytes): WebFetchHopResponse => new WebFetchHopResponse(200, [], ''),
            resolver: function (string $host) use (&$resolverCalled): array {
                $resolverCalled = true;

                return ['93.184.216.34'];
            },
        );

        $this->assertFalse($client->fetch('https://93.184.216.34/')->failed());

        $blocked = $client->fetch('http://127.0.0.1/');
        $this->assertTrue($blocked->failed());
        $this->assertSame('Blocked address: 127.0.0.1 is in a private or reserved range.', $blocked->error);

        $this->assertFalse($resolverCalled);
    }

    public function test_rejects_when_any_resolved_address_is_blocked(): void
    {
        $client = new WebFetchClient(
            transport: fn (string $url, array $resolve, int $maxBytes): WebFetchHopResponse => new WebFetchHopResponse(200, [], ''),
            resolver: fn (string $host): array => ['93.184.216.34', '10.0.0.8'],
        );

        $result = $client->fetch('https://dual-stack.example.com/x');

        $this->assertTrue($result->failed());
        $this->assertSame('Blocked address: "dual-stack.example.com" resolves to 10.0.0.8, which is in a private or reserved range.', $result->error);
    }

    public function test_reports_unresolvable_hosts(): void
    {
        $client = new WebFetchClient(
            transport: fn (string $url, array $resolve, int $maxBytes): WebFetchHopResponse => new WebFetchHopResponse(200, [], ''),
            resolver: fn (string $host): array => [],
        );

        $result = $client->fetch('https://nonexistent.example.com/');

        $this->assertSame('Could not resolve host "nonexistent.example.com".', $result->error);
    }

    public function test_follows_relative_and_scheme_relative_locations(): void
    {
        $requestedUrls = [];
        $client = $this->client([
            new WebFetchHopResponse(302, ['Location: //static.example.org/article'], ''),
            new WebFetchHopResponse(302, ['Location: page2'], ''),
            new WebFetchHopResponse(200, [], '<html><body>final</body></html>'),
        ], requestedUrls: $requestedUrls);

        $result = $client->fetch('https://example.com/articles/1');

        $this->assertFalse($result->failed());
        $this->assertSame('https://static.example.org/page2', $result->finalUrl);
        $this->assertSame('<html><body>final</body></html>', $result->body);
        $this->assertSame([
            'https://example.com/articles/1',
            'https://static.example.org/article',
            'https://static.example.org/page2',
        ], $requestedUrls);
    }

    public function test_revalidates_every_redirect_hop(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(302, ['Location: http://internal.example/panel'], ''),
        ], resolveMap: ['internal.example' => ['192.168.0.10']]);

        $result = $client->fetch('https://example.com/public');

        $this->assertTrue($result->failed());
        $this->assertSame('Blocked address: "internal.example" resolves to 192.168.0.10, which is in a private or reserved range.', $result->error);
    }

    public function test_rejects_redirects_to_blocked_ip_literals(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(301, ['Location: http://10.0.0.5/admin'], ''),
        ]);

        $result = $client->fetch('https://example.com/a');

        $this->assertSame('Blocked address: 10.0.0.5 is in a private or reserved range.', $result->error);
    }

    public function test_rejects_redirects_to_non_http_schemes(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(302, ['Location: file:///etc/passwd'], ''),
        ]);

        $result = $client->fetch('https://example.com/a');

        $this->assertSame('Scheme "file" rejected: only http and https URLs can be fetched.', $result->error);
    }

    public function test_accepts_a_chain_of_exactly_three_hops(): void
    {
        $requested = 0;
        $client = new WebFetchClient(
            transport: function (string $url, array $resolve, int $maxBytes) use (&$requested): WebFetchHopResponse {
                $requested++;

                return $requested === 3
                    ? new WebFetchHopResponse(200, [], 'final body')
                    : new WebFetchHopResponse(302, ['Location: https://example.com/hop-'.$requested], '');
            },
            resolver: fn (string $host): array => ['93.184.216.34'],
        );

        $result = $client->fetch('https://example.com/start');

        $this->assertFalse($result->failed());
        $this->assertSame('final body', $result->body);
        $this->assertSame(3, $requested);
    }

    public function test_rejects_chains_longer_than_three_hops(): void
    {
        $requested = 0;
        $client = new WebFetchClient(
            transport: function (string $url, array $resolve, int $maxBytes) use (&$requested): WebFetchHopResponse {
                $requested++;

                return new WebFetchHopResponse(302, ['Location: https://example.com/hop-'.$requested], '');
            },
            resolver: fn (string $host): array => ['93.184.216.34'],
        );

        $result = $client->fetch('https://example.com/start');

        $this->assertSame('Too many redirects (more than 3 hops).', $result->error);
        $this->assertSame(3, $requested);
    }

    public function test_enforces_the_size_cap_on_declared_content_length(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(200, ['Content-Length: 99999999'], ''),
        ]);

        $result = $client->fetch('https://example.com/huge');

        $this->assertSame('Response exceeds the 2.0 MB size cap (Content-Length: 99999999).', $result->error);
    }

    public function test_enforces_the_size_cap_on_the_body_itself(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(200, [], str_repeat('x', WebFetchClient::MAX_BYTES + 1)),
        ]);

        $result = $client->fetch('https://example.com/huge');

        $this->assertSame('Response exceeds the 2.0 MB size cap.', $result->error);
    }

    public function test_surfaces_transport_errors_like_timeouts(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(0, [], '', 'cURL error 28: Operation timed out after 15001 milliseconds'),
        ]);

        $result = $client->fetch('https://slow.example.com/');

        $this->assertSame('cURL error 28: Operation timed out after 15001 milliseconds', $result->error);
    }

    public function test_reports_http_error_statuses(): void
    {
        $client = $this->client([
            new WebFetchHopResponse(404, [], 'not found'),
        ]);

        $result = $client->fetch('https://example.com/missing');

        $this->assertSame('HTTP 404 from https://example.com/missing.', $result->error);
    }

    public function test_uses_the_impersonate_transport_when_configured(): void
    {
        config(['services.curl_impersonate.binary' => PHP_BINARY]);

        $inProcessCalled = false;
        $captured = [];

        $client = new WebFetchClient(
            transport: function (string $url, array $resolve, int $maxBytes) use (&$inProcessCalled): WebFetchHopResponse {
                $inProcessCalled = true;

                return new WebFetchHopResponse(200, [], 'in-process');
            },
            resolver: fn (string $host): array => ['93.184.216.34'],
            impersonateTransport: function (string $url, array $resolve, int $maxBytes) use (&$captured): WebFetchHopResponse {
                $captured = [$url, $resolve, $maxBytes];

                return new WebFetchHopResponse(200, [], 'impersonated');
            },
        );

        $result = $client->fetch('https://example.com/page');

        $this->assertFalse($result->failed());
        $this->assertSame('impersonated', $result->body);
        $this->assertFalse($inProcessCalled);
        $this->assertSame([
            'https://example.com/page',
            ['example.com:443:93.184.216.34'],
            WebFetchClient::MAX_BYTES,
        ], $captured);
    }

    public function test_ssrf_validation_precedes_impersonate_transport_selection(): void
    {
        config(['services.curl_impersonate.binary' => PHP_BINARY]);

        $impersonateCalled = false;

        $client = new WebFetchClient(
            transport: fn (string $url, array $resolve, int $maxBytes): WebFetchHopResponse => new WebFetchHopResponse(200, [], ''),
            resolver: fn (string $host): array => ['10.0.0.8'],
            impersonateTransport: function (string $url, array $resolve, int $maxBytes) use (&$impersonateCalled): WebFetchHopResponse {
                $impersonateCalled = true;

                return new WebFetchHopResponse(200, [], '');
            },
        );

        $result = $client->fetch('https://internal.example/x');

        $this->assertTrue($result->failed());
        $this->assertSame('Blocked address: "internal.example" resolves to 10.0.0.8, which is in a private or reserved range.', $result->error);
        $this->assertFalse($impersonateCalled);
    }

    public function test_default_impersonate_transport_synthesizes_redirects_and_content_length(): void
    {
        config(['services.curl_impersonate.binary' => PHP_BINARY]);

        $outputs = [
            "\n__CURL_META__302\ttext/html\thttps://example.com/next\t0",
            "final body\n__CURL_META__200\ttext/html\t\t10",
        ];
        $call = 0;

        Process::fake(function (PendingProcess $process) use (&$outputs, &$call): mixed {
            return Process::result($outputs[$call++]);
        });

        $client = new WebFetchClient(
            resolver: fn (string $host): array => ['93.184.216.34'],
        );

        $result = $client->fetch('https://example.com/start');

        $this->assertFalse($result->failed());
        $this->assertSame('final body', $result->body);
        $this->assertSame('https://example.com/next', $result->finalUrl);
    }

    public function test_default_transport_rejects_oversized_response_headers(): void
    {
        $server = $this->startOneShotServer(
            "HTTP/1.1 200 OK\r\n"
            .str_repeat('X-Fill: '.str_repeat('a', 100)."\r\n", 700)
            ."Content-Length: 0\r\nConnection: close\r\n\r\n",
        );

        if ($server === null) {
            $this->markTestSkipped('pcntl or stream_socket_server unavailable for the raw HTTP fixture.');
        }

        try {
            $response = ($this->defaultTransport())('http://127.0.0.1:'.$server['port'].'/', [], WebFetchClient::MAX_BYTES);

            $this->assertNotNull($response->error);
            $this->assertStringContainsString('Response headers exceed the 64 KB cap', $response->error);
        } finally {
            $this->reapChild($server['pid']);
        }
    }

    public function test_default_transport_ignores_proxy_environment_variables(): void
    {
        $server = $this->startOneShotServer(
            "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok",
        );

        if ($server === null) {
            $this->markTestSkipped('pcntl or stream_socket_server unavailable for the raw HTTP fixture.');
        }

        $proxyVariables = ['http_proxy', 'https_proxy', 'all_proxy'];
        $saved = [];

        foreach ($proxyVariables as $variable) {
            $saved[$variable] = getenv($variable);
        }

        try {
            foreach ($proxyVariables as $variable) {
                putenv($variable.'=http://127.0.0.1:1');
                $_ENV[$variable] = 'http://127.0.0.1:1';
            }

            $response = ($this->defaultTransport())('http://127.0.0.1:'.$server['port'].'/', [], WebFetchClient::MAX_BYTES);

            $this->assertNull($response->error);
            $this->assertSame('ok', $response->body);
        } finally {
            foreach ($saved as $variable => $value) {
                if ($value === false) {
                    putenv($variable);
                    unset($_ENV[$variable]);
                } else {
                    putenv($variable.'='.$value);
                    $_ENV[$variable] = $value;
                }
            }

            $this->reapChild($server['pid']);
        }
    }

    /**
     * Client wired to a scripted transport (responses consumed in order) and a
     * resolver fed from a fixed map — no sockets anywhere.
     *
     * @param  array<int, WebFetchHopResponse>  $hops
     * @param  array<string, array<int, string>>  $resolveMap
     */
    private function client(array $hops, array $resolveMap = [], array &$requestedUrls = []): WebFetchClient
    {
        $hops = array_values($hops);
        $requestedUrls = [];

        return new WebFetchClient(
            transport: function (string $url, array $resolve, int $maxBytes) use (&$hops, &$requestedUrls): WebFetchHopResponse {
                $requestedUrls[] = $url;

                if ($hops === []) {
                    $this->fail('Unexpected extra transport call for '.$url);
                }

                return array_shift($hops);
            },
            resolver: fn (string $host): array => $resolveMap[$host] ?? ['93.184.216.34'],
        );
    }

    /**
     * @return Closure(string, array<int, string>, int): WebFetchHopResponse
     */
    private function defaultTransport(): Closure
    {
        $method = new ReflectionMethod(WebFetchClient::class, 'defaultTransport');
        $method->setAccessible(true);

        /** @var Closure(string, array<int, string>, int): WebFetchHopResponse $transport */
        $transport = $method->invoke(new WebFetchClient);

        return $transport;
    }

    /**
     * One-shot raw HTTP server on an ephemeral loopback port. The child serves a
     * single connection then exits, so it never reaches PHPUnit teardown.
     *
     * @return array{port: int, pid: int}|null
     */
    private function startOneShotServer(string $rawResponse): ?array
    {
        if (! function_exists('pcntl_fork')) {
            return null;
        }

        $errno = 0;
        $error = '';
        $server = @stream_socket_server('tcp://127.0.0.1:0', $errno, $error);

        if ($server === false) {
            return null;
        }

        $name = stream_socket_get_name($server, false);
        $separator = $name === false ? false : strrpos($name, ':');

        if ($name === false || $separator === false) {
            fclose($server);

            return null;
        }

        $port = (int) substr($name, $separator + 1);
        $pid = pcntl_fork();

        if ($pid === -1) {
            fclose($server);

            return null;
        }

        if ($pid === 0) {
            $connection = @stream_socket_accept($server, 10);

            if ($connection !== false) {
                $payload = $rawResponse;

                while ($payload !== '') {
                    $written = @fwrite($connection, $payload);

                    if ($written === false || $written === 0) {
                        break;
                    }

                    $payload = substr($payload, $written);
                }

                @fclose($connection);
            }

            @fclose($server);

            exit(0);
        }

        fclose($server);

        return ['port' => $port, 'pid' => $pid];
    }

    private function reapChild(int $pid): void
    {
        $status = 0;

        for ($i = 0; $i < 200; $i++) {
            if (pcntl_waitpid($pid, $status, WNOHANG) !== 0) {
                return;
            }

            usleep(25_000);
        }

        pcntl_waitpid($pid, $status);
    }
}
