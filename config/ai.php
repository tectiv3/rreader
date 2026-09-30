<?php

return [

    'default' => env('AI_DEFAULT_PROVIDER', 'lmstudio'),

    'providers' => [

        'lmstudio' => [
            'driver' => 'openai',
            'key' => env('AI_LMSTUDIO_API_KEY'),
            'url' => env('AI_LMSTUDIO_BASE_URL'),
        ],

        'opencode' => [
            // Zen's declared models (deepseek-v4.1-flash, glm-5.3) do not speak the
            // Responses protocol (ModelProtocolUnsupported); the openai-compatible
            // driver speaks chat/completions with full history every step — the
            // spec's planned fallback for this exact failure.
            'driver' => 'openai-compatible',
            'key' => env('AI_OPENCODE_API_KEY'),
            'url' => env('AI_OPENCODE_BASE_URL'),
        ],

    ],

    'conversations' => [
        'generate_title' => false,
    ],

];
