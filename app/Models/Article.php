<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
}
