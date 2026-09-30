<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\FeedParserService;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class FeedParserServiceTest extends TestCase
{
    public function test_403_fallback_delegates_to_the_shared_impersonate_client(): void
    {
        config(['services.curl_impersonate.binary' => PHP_BINARY]);

        Http::fake(['*' => Http::response('blocked', 403)]);

        $rss = '<?xml version="1.0"?><rss version="2.0"><channel><title>Test Feed</title></channel></rss>';

        Process::fake(fn (): mixed => Process::result($rss."\n__CURL_META__200\tapplication/rss+xml\t\t".strlen($rss)));

        $parsed = app(FeedParserService::class)->discoverAndParse('https://example.com/feed');

        $this->assertSame('Test Feed', $parsed['title']);

        Process::assertRan(function (PendingProcess $process): bool {
            return is_array($process->command) && in_array('--noproxy', $process->command, true);
        });
    }
}
