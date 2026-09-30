<?php

declare(strict_types=1);

namespace App\Services;

final readonly class CurlImpersonateResult
{
    public function __construct(
        public int $status,
        public ?string $contentType,
        public ?string $redirectUrl,
        public int $sizeDownload,
        public string $body,
        public ?string $error = null,
    ) {}
}
