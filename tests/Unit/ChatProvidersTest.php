<?php

namespace Tests\Unit;

use App\Chat\ChatProviders;
use Tests\TestCase;

class ChatProvidersTest extends TestCase
{
    public function test_configured_lists_providers_in_config_order(): void
    {
        $this->useProviders();

        $this->assertSame(['lmstudio', 'opencode'], (new ChatProviders)->configured());
    }

    public function test_provider_missing_url_key_or_models_is_not_configured(): void
    {
        $this->useProviders(lmstudio: ['url' => null]);
        $this->assertSame(['opencode'], (new ChatProviders)->configured());

        $this->useProviders(lmstudio: ['key' => null]);
        $this->assertSame(['opencode'], (new ChatProviders)->configured());

        $this->useProviders(lmstudio: ['models' => []]);
        $this->assertSame(['opencode'], (new ChatProviders)->configured());
    }

    public function test_no_configured_providers_disables_chat(): void
    {
        $this->useProviders(lmstudio: ['key' => null], opencode: ['key' => null]);

        $providers = new ChatProviders;

        $this->assertSame([], $providers->configured());
        $this->assertNull($providers->defaultProvider());
        $this->assertFalse($providers->enabled());
    }

    public function test_all_includes_unconfigured_providers_in_normalized_shape(): void
    {
        $this->useProviders(opencode: ['key' => null, 'models' => ['glm-5.3']]);

        $all = (new ChatProviders)->all();

        $this->assertSame(['lmstudio', 'opencode'], array_keys($all));
        $this->assertSame([
            'driver' => 'openai-compatible',
            'url' => 'https://opencode.ai/zen/v1',
            'key' => null,
            'models' => ['glm-5.3'],
        ], $all['opencode']);
    }

    public function test_default_provider_returns_configured_default(): void
    {
        $this->useProviders(default: 'opencode');

        $this->assertSame('opencode', (new ChatProviders)->defaultProvider());
    }

    public function test_stale_default_falls_through_to_first_configured(): void
    {
        $this->useProviders(lmstudio: ['key' => null], default: 'lmstudio');

        $this->assertSame('opencode', (new ChatProviders)->defaultProvider());
    }

    public function test_null_default_returns_first_configured(): void
    {
        $this->useProviders(default: null);

        $this->assertSame('lmstudio', (new ChatProviders)->defaultProvider());
    }

    public function test_enabled_reflects_any_configured_provider(): void
    {
        $this->useProviders(lmstudio: ['url' => null]);

        $this->assertTrue((new ChatProviders)->enabled());
    }

    public function test_models_for_known_and_unknown_providers(): void
    {
        $this->useProviders();

        $providers = new ChatProviders;

        $this->assertSame(['qwen3.8-27b', 'gpt-oss-20b'], $providers->modelsFor('lmstudio'));
        $this->assertSame(['deepseek-v4.1-flash', 'glm-5.3'], $providers->modelsFor('opencode'));
        $this->assertSame([], $providers->modelsFor('unknown'));
    }

    public function test_is_valid_requires_configured_provider_and_listed_model(): void
    {
        $this->useProviders();

        $providers = new ChatProviders;

        $this->assertTrue($providers->isValid('lmstudio', 'qwen3.8-27b'));
        $this->assertFalse($providers->isValid('lmstudio', 'glm-5.3'));
        $this->assertFalse($providers->isValid('unknown', 'qwen3.8-27b'));

        $this->useProviders(lmstudio: ['key' => null]);
        $this->assertFalse($providers->isValid('lmstudio', 'qwen3.8-27b'));
    }

    private function useProviders(
        array $lmstudio = [],
        array $opencode = [],
        ?string $default = 'lmstudio',
    ): void {
        config([
            'ai.default' => $default,
            'ai.providers' => [
                'lmstudio' => array_merge([
                    'driver' => 'openai',
                    'url' => 'http://100.78.246.86:1234/v1',
                    'key' => 'sk-lm-test',
                    'models' => ['qwen3.8-27b', 'gpt-oss-20b'],
                ], $lmstudio),
                'opencode' => array_merge([
                    'driver' => 'openai-compatible',
                    'url' => 'https://opencode.ai/zen/v1',
                    'key' => 'zen-test',
                    'models' => ['deepseek-v4.1-flash', 'glm-5.3'],
                ], $opencode),
            ],
        ]);
    }
}
