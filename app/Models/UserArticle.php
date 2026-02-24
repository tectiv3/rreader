<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $user_id
 * @property int $article_id
 * @property bool $is_read_later
 * @property \Illuminate\Support\Carbon|null $read_at
 */
class UserArticle extends Model
{
    protected $table = 'user_articles';

    protected $fillable = ['user_id', 'article_id', 'is_read_later', 'read_at'];

    protected $appends = ['is_read'];

    protected function casts(): array
    {
        return [
            'is_read_later' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }
}
