<?php

namespace App\Chat;

use App\Services\CurlImpersonateClient;
use Closure;
use GuzzleHttp\Psr7\Exception\MalformedUriException;
use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Psr7\UriResolver;
use Psr\Http\Message\UriInterface;

/**
 * SSRF-hardened fetch client behind the web_fetch chat tool.
 *
 * Redirects are followed manually so every hop re-runs scheme validation, DNS
 * resolution and address validation; the validated addresses are pinned via
 * CURLOPT_RESOLVE so the connection cannot race to an address that was never
 * checked.
 */
class WebFetchClient
{
    /** Total request budget: the initial request counts as the first hop. */
    public const MAX_HOPS = 3;

    public const CONNECT_TIMEOUT = 5;

    public const TOTAL_TIMEOUT = 10;

    public const MAX_BYTES = 2 * 1024 * 1024;

    public const MAX_HEADER_BYTES = 64 * 1024;

    /** 100.64.0.0/10 is the tailnet this deployment itself runs on. */
    private const BLOCKED_V4 = [
        '0.0.0.0/8',
        '10.0.0.0/8',
        '100.64.0.0/10',
        '127.0.0.0/8',
        '169.254.0.0/16',
        '172.16.0.0/12',
        '192.168.0.0/16',
    ];

    private const BLOCKED_V6 = [
        'fc00::/7',
        'fe80::/10',
        // Teredo obfuscates the embedded IPv4 destination (bits are inverted), so it stays blocked wholesale.
        '2001::/32',
    ];

    private readonly Closure $transport;

    private readonly Closure $resolver;

    private readonly Closure $impersonateTransport;

    /**
     * @param  null|Closure(string $url, array<int, string> $resolve, int $maxBytes): WebFetchHopResponse  $transport
     * @param  null|Closure(string $host): array<int, string>  $resolver
     * @param  null|Closure(string $url, array<int, string> $resolve, int $maxBytes): WebFetchHopResponse  $impersonateTransport
     */
    public function __construct(
        ?Closure $transport = null,
        ?Closure $resolver = null,
        private readonly CurlImpersonateClient $impersonate = new CurlImpersonateClient,
        ?Closure $impersonateTransport = null,
    ) {
        $this->transport = $transport ?? $this->defaultTransport();
        $this->resolver = $resolver ?? $this->defaultResolver();
        $this->impersonateTransport = $impersonateTransport ?? $this->defaultImpersonateTransport();
    }

    public function fetch(string $url): WebFetchResult
    {
        try {
            [$body, $finalUrl] = $this->fetchBody($url);

            return WebFetchResult::success($body, $finalUrl);
        } catch (WebFetchException $e) {
            return WebFetchResult::failure($e->getMessage());
        }
    }

    /**
     * Loopback, private, link-local, CGNAT (tailnet), unspecified and the IPv6
     * equivalents. Anything unparseable fails closed. IPv4-mapped
     * (::ffff:0:0/96) and IPv4-compatible (::/96, which also covers "::" and
     * "::1") addresses carry an embedded IPv4 address some stacks connect to
     * as IPv4, so the embedded address is validated too. The same applies to
     * NAT64 (64:ff9b::/96 and the local-use 64:ff9b:1::/48, where the IPv4
     * destination is the last 32 bits) and 6to4 (2002::/16, where it is bytes
     * 2..5): the embedded destination is validated rather than the whole
     * prefix being rejected. Teredo (2001::/32) is blocked wholesale.
     */
    public static function isBlockedAddress(string $address): bool
    {
        $packed = @inet_pton($address);

        if ($packed === false) {
            return true;
        }

        if (strlen($packed) === 4) {
            return self::matchesAnyRange($packed, self::BLOCKED_V4);
        }

        $prefix = substr($packed, 0, 12);

        if ($prefix === str_repeat("\0", 10)."\xff\xff" || $prefix === str_repeat("\0", 12)) {
            return self::matchesAnyRange(substr($packed, 12), self::BLOCKED_V4);
        }

        if (self::matchesAnyRange($packed, ['64:ff9b::/96', '64:ff9b:1::/48'])) {
            return self::matchesAnyRange(substr($packed, 12, 4), self::BLOCKED_V4);
        }

        if (self::matchesAnyRange($packed, ['2002::/16'])) {
            return self::matchesAnyRange(substr($packed, 2, 4), self::BLOCKED_V4);
        }

        return self::matchesAnyRange($packed, self::BLOCKED_V6);
    }

    /**
     * @return array{string, string} body and final URL
     */
    private function fetchBody(string $url): array
    {
        $uri = self::requireHttpUrl(self::toUri(trim($url)));

        for ($hop = 1; $hop <= self::MAX_HOPS; $hop++) {
            $resolve = $this->resolveAndPin($uri);
            $transport = $this->impersonate->configured() ? $this->impersonateTransport : $this->transport;
            $response = $transport((string) $uri, $resolve, self::MAX_BYTES);

            if ($response->error !== null) {
                throw new WebFetchException($response->error);
            }

            $headers = self::parseHeaders($response->headerLines);

            if (isset($headers['content-length']) && (int) $headers['content-length'] > self::MAX_BYTES) {
                throw new WebFetchException(sprintf('Response exceeds the %s size cap (Content-Length: %s).', self::sizeCapLabel(), $headers['content-length']));
            }

            if (strlen($response->body) > self::MAX_BYTES) {
                throw new WebFetchException(sprintf('Response exceeds the %s size cap.', self::sizeCapLabel()));
            }

            $location = $headers['location'] ?? null;

            if ($location !== null && $response->status >= 300 && $response->status < 400) {
                $uri = self::requireHttpUrl(UriResolver::resolve($uri, self::toUri(trim($location))));

                continue;
            }

            if ($response->status < 200 || $response->status >= 300) {
                throw new WebFetchException(sprintf('HTTP %d from %s.', $response->status, $uri));
            }

            return [$response->body, (string) $uri];
        }

        throw new WebFetchException(sprintf('Too many redirects (more than %d hops).', self::MAX_HOPS));
    }

    private static function toUri(string $url): Uri
    {
        try {
            return new Uri($url);
        } catch (MalformedUriException) {
            throw new WebFetchException('URL rejected: could not be parsed.');
        }
    }

    private static function requireHttpUrl(UriInterface $uri): UriInterface
    {
        $scheme = $uri->getScheme();

        if (! in_array($scheme, ['http', 'https'], true)) {
            throw new WebFetchException(sprintf('Scheme "%s" rejected: only http and https URLs can be fetched.', $scheme === '' ? 'none' : $scheme));
        }

        if ($uri->getHost() === '') {
            throw new WebFetchException('URL rejected: no host.');
        }

        $port = $uri->getPort();

        if ($port !== null && ! in_array($port, [80, 443], true)) {
            throw new WebFetchException(sprintf('Port %d rejected: only ports 80 and 443 can be fetched.', $port));
        }

        return $uri;
    }

    /**
     * Resolve the hop's host and validate every address before connecting.
     *
     * @return array<int, string> CURLOPT_RESOLVE entries pinning the connection to the validated addresses
     */
    private function resolveAndPin(UriInterface $uri): array
    {
        $host = $uri->getHost();

        // Uri::getHost() keeps the brackets around IPv6 literals; strip them so
        // literals run through the same validation as resolved addresses.
        if (str_starts_with($host, '[') && str_ends_with($host, ']')) {
            $host = substr($host, 1, -1);
        }

        $port = $uri->getPort() ?? ($uri->getScheme() === 'https' ? 443 : 80);

        if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
            if (self::isBlockedAddress($host)) {
                throw new WebFetchException(sprintf('Blocked address: %s is in a private or reserved range.', $host));
            }

            return [];
        }

        $addresses = ($this->resolver)($host);

        if ($addresses === []) {
            throw new WebFetchException(sprintf('Could not resolve host "%s".', $host));
        }

        foreach ($addresses as $address) {
            if (self::isBlockedAddress($address)) {
                throw new WebFetchException(sprintf('Blocked address: "%s" resolves to %s, which is in a private or reserved range.', $host, $address));
            }
        }

        return array_map(fn (string $address): string => sprintf('%s:%d:%s', $host, $port, self::formatResolveAddress($address)), $addresses);
    }

    /**
     * CURLOPT_RESOLVE documents an IPv6 address bracketed: host:port:[address].
     */
    private static function formatResolveAddress(string $address): string
    {
        $packed = @inet_pton($address);

        return $packed !== false && strlen($packed) === 16 ? '['.$address.']' : $address;
    }

    /**
     * @param  array<int, string>  $headerLines
     * @return array<string, string>
     */
    private static function parseHeaders(array $headerLines): array
    {
        $headers = [];

        foreach ($headerLines as $line) {
            $separator = strpos($line, ':');

            if ($separator === false) {
                continue;
            }

            $headers[strtolower(trim(substr($line, 0, $separator)))] = trim(substr($line, $separator + 1));
        }

        return $headers;
    }

    /**
     * @param  array<int, string>  $ranges
     */
    private static function matchesAnyRange(string $packed, array $ranges): bool
    {
        $bytes = strlen($packed);

        foreach ($ranges as $cidr) {
            [$network, $bits] = explode('/', $cidr);
            $bits = (int) $bits;

            $networkPacked = @inet_pton($network);

            if ($networkPacked === false || strlen($networkPacked) !== $bytes) {
                continue;
            }

            $maskBytes = intdiv($bits, 8);
            $maskBits = $bits % 8;

            if ($maskBytes > 0 && substr($packed, 0, $maskBytes) !== substr($networkPacked, 0, $maskBytes)) {
                continue;
            }

            if ($maskBits > 0) {
                $mask = (0xFF << (8 - $maskBits)) & 0xFF;

                if (((ord($packed[$maskBytes]) ^ ord($networkPacked[$maskBytes])) & $mask) !== 0) {
                    continue;
                }
            }

            return true;
        }

        return false;
    }

    private static function sizeCapLabel(): string
    {
        return sprintf('%.1f MB', self::MAX_BYTES / 1024 / 1024);
    }

    private static function headerCapLabel(): string
    {
        return sprintf('%d KB', intdiv(self::MAX_HEADER_BYTES, 1024));
    }

    /**
     * dns_get_record over gethostbynamel: A+AAAA in one query, so dual-stack
     * hosts are fully validated and pinnable — gethostbynamel is IPv4-only.
     */
    private function defaultResolver(): Closure
    {
        return function (string $host): array {
            $records = dns_get_record($host, DNS_A | DNS_AAAA);
            $addresses = [];

            foreach ($records ?: [] as $record) {
                if ($record['type'] === 'A' && isset($record['ip'])) {
                    $addresses[] = $record['ip'];
                } elseif ($record['type'] === 'AAAA' && isset($record['ipv6'])) {
                    $addresses[] = $record['ipv6'];
                }
            }

            return array_values(array_unique($addresses));
        };
    }

    private function defaultImpersonateTransport(): Closure
    {
        return function (string $url, array $resolve, int $maxBytes): WebFetchHopResponse {
            $result = $this->impersonate->fetch(
                $url,
                resolve: $resolve,
                followRedirects: false,
                maxBytes: $maxBytes,
                connectTimeout: self::CONNECT_TIMEOUT,
                totalTimeout: self::TOTAL_TIMEOUT,
                processTimeout: self::TOTAL_TIMEOUT + 5,
            );

            if ($result->error !== null) {
                return new WebFetchHopResponse($result->status, [], '', $result->error);
            }

            $headerLines = ['Content-Length: '.$result->sizeDownload];

            if ($result->contentType !== null) {
                $headerLines[] = 'Content-Type: '.$result->contentType;
            }

            if ($result->redirectUrl !== null) {
                $headerLines[] = 'Location: '.$result->redirectUrl;
            }

            return new WebFetchHopResponse($result->status, $headerLines, $result->body);
        };
    }

    private function defaultTransport(): Closure
    {
        return function (string $url, array $resolve, int $maxBytes): WebFetchHopResponse {
            $body = '';
            $headerLines = [];
            $received = 0;
            $headerBytes = 0;
            $headersTruncated = false;

            $options = [
                CURLOPT_URL => $url,
                // Redirects are driven by the client loop so every hop is re-validated.
                CURLOPT_FOLLOWLOCATION => false,
                // An environment proxy would resolve the host itself, defeating CURLOPT_RESOLVE.
                CURLOPT_PROXY => '',
                CURLOPT_NOPROXY => '*',
                CURLOPT_CONNECTTIMEOUT => self::CONNECT_TIMEOUT,
                // Hard total cap per hop: chat turns run under set_time_limit(0),
                // so a slow or looping server must not pin an FPM worker.
                CURLOPT_TIMEOUT => self::TOTAL_TIMEOUT,
                CURLOPT_HEADERFUNCTION => function ($handle, string $line) use (&$headerLines, &$headerBytes, &$headersTruncated): int {
                    $headerBytes += strlen($line);

                    if ($headerBytes > self::MAX_HEADER_BYTES) {
                        $headersTruncated = true;

                        return -1; // a length mismatch aborts the transfer at the cap
                    }

                    $headerLines[] = $line;

                    return strlen($line);
                },
                CURLOPT_WRITEFUNCTION => function ($handle, string $chunk) use (&$body, &$received, $maxBytes): int {
                    $received += strlen($chunk);

                    if ($received > $maxBytes) {
                        return -1; // a length mismatch aborts the transfer at the cap
                    }

                    $body .= $chunk;

                    return strlen($chunk);
                },
                // No Accept-Encoding: the size cap must bound real bytes, not a compressed stream.
                CURLOPT_USERAGENT => 'RReader/1.0',
            ];

            if ($resolve !== []) {
                $options[CURLOPT_RESOLVE] = $resolve;
            }

            $handle = curl_init();
            curl_setopt_array($handle, $options);
            curl_exec($handle);

            $errno = curl_errno($handle);
            $error = $errno !== 0 ? sprintf('cURL error %d: %s', $errno, curl_error($handle)) : null;

            if ($headersTruncated) {
                $error = sprintf('Response headers exceed the %s cap.', self::headerCapLabel());
            }

            if ($errno === CURLE_WRITE_ERROR && $received > $maxBytes) {
                $error = sprintf('Response exceeds the %s size cap.', self::sizeCapLabel());
            }

            $response = new WebFetchHopResponse(
                (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE),
                $headerLines,
                $body,
                $error,
            );
            curl_close($handle);

            return $response;
        };
    }
}
