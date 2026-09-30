<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Laravel\Ai\Models\ConversationMessage;

/**
 * The package message model — no behaviour added, just the property
 * annotations the package class lacks.
 *
 * @property string $id
 * @property string $conversation_id
 * @property string $role
 * @property string|null $content
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class AgentConversationMessage extends ConversationMessage {}
