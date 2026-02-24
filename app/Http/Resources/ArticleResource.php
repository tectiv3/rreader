<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public static $wrap = null;

    protected bool $detail = false;

    public function asDetail(): static
    {
        $this->detail = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $article = $this->resource;
        $data = [
            'id' => $article->id,
            'title' => $article->title,
            'feed_id' => $article->feed_id,
            'image_url' => $article->image_url,
            'published_at' => $article->published_at,
            'url' => $article->url,
            'is_read' => (bool) ($article->is_read ?? false),
            'is_read_later' => (bool) ($article->is_read_later ?? false),
            'read_at' => $article->read_at,
            'feed_title' => $article->feed_title ?? $article->feed?->title,
            'feed_favicon_url' => $article->feed_favicon_url ?? $article->feed?->favicon_url,
        ];

        if ($this->detail) {
            $data['content'] = $article->content;
            $data['summary'] = $article->summary;
            $data['author'] = $article->author;
        }

        return $data;
    }
}
