<?php

namespace App\Chat;

/**
 * Outcome of WebFetchClient::fetch(): either the body plus the final URL after
 * redirects, or a terse failure string meant for the model to read.
 */
class WebFetchResult
{
    private function __construct(
        public readonly ?string $body,
        public readonly ?string $finalUrl,
        public readonly ?string $error,
    ) {}

    public static function success(string $body, string $finalUrl): self
    {
        return new self($body, $finalUrl, null);
    }

    public static function failure(string $error): self
    {
        return new self(null, null, $error);
    }

    public function failed(): bool
    {
        return $this->error !== null;
    }
}
