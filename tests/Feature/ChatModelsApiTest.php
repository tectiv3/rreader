<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatModelsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_env_declared_models_per_configured_provider(): void
    {
        $this->configureProviders();

        $this->actingAs(User::factory()->create())
            ->getJson('/api/chat/models')
            ->assertOk()
            ->assertExactJson([
                'enabled' => true,
                'providers' => [
                    'lmstudio' => ['models' => ['qwen3.8-27b', 'gpt-oss-20b']],
                    'opencode' => ['models' => ['deepseek-v4.1-flash', 'glm-5.3']],
                ],
            ]);
    }

    public function test_reports_disabled_when_no_provider_resolves(): void
    {
        $this->configureProviders(lmstudio: ['key' => null], opencode: ['key' => null]);

        $this->actingAs(User::factory()->create())
            ->getJson('/api/chat/models')
            ->assertOk()
            ->assertExactJson([
                'enabled' => false,
                'providers' => [],
            ]);
    }

    private function configureProviders(
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
