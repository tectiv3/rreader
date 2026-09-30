<?php

namespace App\Chat;

use RuntimeException;

/**
 * Carries a terse, model-facing reason why a fetch was refused or failed.
 */
class WebFetchException extends RuntimeException {}
