<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Laravel\Ai\Models\Conversation;

/**
 * The package conversation model plus the article-chat follow-up columns.
 *
 * @property string $id
 * @property string $title
 * @property int|null $article_id
 * @property string|null $provider
 * @property string|null $model
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $last_message_at ChatService::hub() withMax() aggregate
 */
class AgentConversation extends Conversation
{
    protected function casts(): array
    {
        return [
            // without the cast, the withMax("messages as last_message_at") alias
            // surfaces as the raw "Y-m-d H:i:s" string instead of a Carbon date
            'last_message_at' => 'datetime',
        ];
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
