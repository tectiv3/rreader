<?php

namespace Tests\Unit;

use App\Chat\WebFetchClient;
use App\Chat\WebFetchHopResponse;
use PHPUnit\Framework\Attributes\DataProvider;
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
        $client->fetch('http://example.com:8080/page');

        $this->assertSame([
            ['https://example.com/page', ['example.com:443:93.184.216.34', 'example.com:443:2606:4700::']],
            ['http://example.com:8080/page', ['example.com:8080:93.184.216.34', 'example.com:8080:2606:4700::']],
        ], $captured);
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

        $blocked = $client->fetch('http://127.0.0.1:8080/');
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

    public function test_accepts_a_chain_of_exactly_five_hops(): void
    {
        $requested = 0;
        $client = new WebFetchClient(
            transport: function (string $url, array $resolve, int $maxBytes) use (&$requested): WebFetchHopResponse {
                $requested++;

                return $requested === 5
                    ? new WebFetchHopResponse(200, [], 'final body')
                    : new WebFetchHopResponse(302, ['Location: https://example.com/hop-'.$requested], '');
            },
            resolver: fn (string $host): array => ['93.184.216.34'],
        );

        $result = $client->fetch('https://example.com/start');

        $this->assertFalse($result->failed());
        $this->assertSame('final body', $result->body);
        $this->assertSame(5, $requested);
    }

    public function test_rejects_chains_longer_than_five_hops(): void
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

        $this->assertSame('Too many redirects (more than 5 hops).', $result->error);
        $this->assertSame(5, $requested);
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
}
