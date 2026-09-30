<?php

namespace App\Chat;

/**
 * Response of a single HTTP hop, produced by the transport seam.
 */
class WebFetchHopResponse
{
    /**
     * @param  array<int, string>  $headerLines  raw "Name: value" lines of this hop
     */
    public function __construct(
        public readonly int $status,
        public readonly array $headerLines,
        public readonly string $body,
        public readonly ?string $error = null,
    ) {}
}
