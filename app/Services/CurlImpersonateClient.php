<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Process;

class CurlImpersonateClient
{
    private const MARKER = '__CURL_META__';

    public function configured(): bool
    {
        $binary = config('services.curl_impersonate.binary');

        return is_string($binary) && $binary !== '' && is_executable($binary);
    }

    /**
     * @param  array<int, string>  $resolve  CURLOPT_RESOLVE style host:port:addr pins, one per validated address
     */
    public function fetch(
        string $url,
        array $resolve = [],
        bool $followRedirects = false,
        int $maxBytes = 0,
        int $connectTimeout = 5,
        int $totalTimeout = 15,
        int $processTimeout = 25,
    ): CurlImpersonateResult {
        $binary = (string) config('services.curl_impersonate.binary');

        $command = [
            $binary, '-s', '-S', '--noproxy', '*',
            '--connect-timeout', (string) $connectTimeout,
            '--max-time', (string) $totalTimeout,
        ];

        if ($followRedirects) {
            $command[] = '-L';
        }

        if ($maxBytes > 0) {
            $command[] = '--max-filesize';
            $command[] = (string) $maxBytes;
        }

        foreach ($resolve as $entry) {
            $command[] = '--resolve';
            $command[] = $entry;
        }

        $command[] = '-w';
        $command[] = "\n".self::MARKER.'%{http_code}\t%{content_type}\t%{redirect_url}\t%{size_download}';
        $command[] = $url;

        $result = Process::timeout($processTimeout)->run($command);

        $exitCode = $result->exitCode();

        if ($exitCode !== 0) {
            $error = $exitCode === CURLE_FILESIZE_EXCEEDED
                ? sprintf('Response exceeds the %.1f MB size cap.', $maxBytes / 1024 / 1024)
                : sprintf(
                    'curl-impersonate exit %s%s',
                    $exitCode ?? 'null',
                    trim($result->errorOutput()) !== '' ? ': '.trim($result->errorOutput()) : ''
                );

            return new CurlImpersonateResult(0, null, null, 0, '', $error);
        }

        $output = $result->output();
        $pos = strrpos($output, "\n".self::MARKER);

        if ($pos === false) {
            return new CurlImpersonateResult(0, null, null, 0, '', 'curl-impersonate produced no status marker.');
        }

        $body = substr($output, 0, $pos);
        [$status, $contentType, $redirectUrl, $sizeDownload] = array_pad(
            explode("\t", substr($output, $pos + strlen("\n".self::MARKER))),
            4,
            ''
        );

        return new CurlImpersonateResult(
            (int) $status,
            $contentType !== '' ? $contentType : null,
            $redirectUrl !== '' ? $redirectUrl : null,
            (int) $sizeDownload,
            $body,
        );
    }
}
