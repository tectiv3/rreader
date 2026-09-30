<?php

namespace App\Chat;

/**
 * Resolves the chat providers declared in config/ai.php (fed by the AI_* env vars).
 *
 * A provider is configured when base URL, key and a non-empty model list are all
 * present. The provider order in config/ai.php is the fixed order
 * (lmstudio, opencode) used for default-provider fallthrough.
 */
class ChatProviders
{
    /**
     * All declared providers, including unconfigured ones.
     *
     * @return array<string, array{driver: string, url: ?string, key: ?string, models: list<string>}>
     */
    public function all(): array
    {
        $providers = [];

        foreach ((array) config('ai.providers', []) as $name => $provider) {
            $provider = is_array($provider) ? $provider : [];

            $providers[(string) $name] = [
                'driver' => (string) ($provider['driver'] ?? ''),
                'url' => $provider['url'] ?? null,
                'key' => $provider['key'] ?? null,
                'models' => array_values(array_filter((array) ($provider['models'] ?? []))),
            ];
        }

        return $providers;
    }

    /**
     * The configured provider names, in config declaration order.
     *
     * @return list<string>
     */
    public function configured(): array
    {
        return array_values(array_filter(
            array_keys($this->all()),
            fn (string $name): bool => $this->isConfigured($name),
        ));
    }

    public function isConfigured(string $name): bool
    {
        $provider = $this->all()[$name] ?? null;

        return $provider !== null
            && filled($provider['url'])
            && filled($provider['key'])
            && $provider['models'] !== [];
    }

    /**
     * The default provider: AI_DEFAULT_PROVIDER when it is configured, else the
     * first configured provider, else null (chat disabled).
     */
    public function defaultProvider(): ?string
    {
        $configured = $this->configured();

        $default = config('ai.default');

        if (is_string($default) && in_array($default, $configured, true)) {
            return $default;
        }

        return $configured[0] ?? null;
    }

    public function enabled(): bool
    {
        return $this->configured() !== [];
    }

    /**
     * The env-declared model list for a provider (first entry = its default).
     *
     * @return list<string>
     */
    public function modelsFor(string $name): array
    {
        return $this->all()[$name]['models'] ?? [];
    }

    public function isValid(string $provider, string $model): bool
    {
        return $this->isConfigured($provider)
            && in_array($model, $this->modelsFor($provider), true);
    }
}
