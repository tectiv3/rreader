<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feed extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'feed_url',
        'site_url',
        'description',
        'favicon_url',
        'last_fetched_at',
        'consecutive_failures',
        'last_error',
        'last_failed_at',
        'disabled_at',
    ];

    protected function casts(): array
    {
        return [
            'last_fetched_at' => 'datetime',
            'last_failed_at' => 'datetime',
            'disabled_at' => 'datetime',
            'consecutive_failures' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function isDisabled(): bool
    {
        return $this->disabled_at !== null;
    }

    public function shouldSkipRefresh(): bool
    {
        $failures = $this->consecutive_failures;

        if ($failures <= 3) {
            return false;
        }

        if ($failures <= 7) {
            return $this->last_failed_at !== null &&
                $this->last_failed_at->gt(now()->subHours(6));
        }

        if ($failures <= 10) {
            return $this->last_failed_at !== null &&
                $this->last_failed_at->gt(now()->subHours(24));
        }

        return true;
    }

    public function recordFailure(string $error): void
    {
        $this->increment('consecutive_failures');
        $this->update([
            'last_error' => $error,
            'last_failed_at' => now(),
            'disabled_at' => $this->consecutive_failures >= 11 ? now() : null,
        ]);
    }

    public function recordSuccess(): void
    {
        $this->update([
            'consecutive_failures' => 0,
            'last_error' => null,
            'last_failed_at' => null,
            'disabled_at' => null,
        ]);
    }
}
