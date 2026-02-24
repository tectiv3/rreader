<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property bool $is_read_later
 */
class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'feed_id',
        'guid',
        'title',
        'author',
        'content',
        'summary',
        'url',
        'image_url',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function feed(): BelongsTo
    {
        return $this->belongsTo(Feed::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_articles')
            ->withPivot('is_read_later', 'read_at')
            ->withTimestamps();
    }

    public function scopeWithUserState(Builder $query, int $userId): Builder
    {
        return $query->leftJoin('user_articles', function ($join) use ($userId) {
            $join->on('articles.id', '=', 'user_articles.article_id')
                ->where('user_articles.user_id', '=', $userId);
        });
    }

    public function scopeWithRequiredUserState(Builder $query, int $userId): Builder
    {
        return $query->join('user_articles', function ($join) use ($userId) {
            $join->on('articles.id', '=', 'user_articles.article_id')
                ->where('user_articles.user_id', '=', $userId);
        });
    }

    public function scopeUnreadForUser(Builder $query, int $userId): Builder
    {
        return $query->whereDoesntHave('users', fn ($q) => $q->where('user_id', $userId)->whereNotNull('read_at'));
    }

    public function scopeReadLater(Builder $query): Builder
    {
        return $query->where('user_articles.is_read_later', true);
    }

    public function scopeRecentlyRead(Builder $query): Builder
    {
        return $query->whereNotNull('user_articles.read_at');
    }

    public function scopePublishedAtCursor(Builder $query, string $date, string|int $id): Builder
    {
        return $query->where(function ($q) use ($date, $id) {
            $q->where('articles.published_at', '<', $date)
                ->orWhere(function ($q2) use ($date, $id) {
                    $q2->where('articles.published_at', '=', $date)
                        ->where('articles.id', '<', $id);
                });
        });
    }

    public function scopeReadAtCursor(Builder $query, string $readAt, string|int $id): Builder
    {
        return $query->where(function ($q) use ($readAt, $id) {
            $q->where('user_articles.read_at', '<', $readAt)
                ->orWhere(function ($q2) use ($readAt, $id) {
                    $q2->where('user_articles.read_at', '=', $readAt)
                        ->where('articles.id', '<', $id);
                });
        });
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('summary', 'like', "%{$term}%")
                ->orWhere('content', 'like', "%{$term}%");
        });
    }
}
