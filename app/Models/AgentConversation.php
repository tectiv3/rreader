<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Ai\Models\Conversation;

/**
 * The package conversation model plus the article-chat follow-up columns.
 *
 * @property string $id
 * @property int|null $article_id
 * @property string|null $provider
 * @property string|null $model
 */
class AgentConversation extends Conversation
{
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
