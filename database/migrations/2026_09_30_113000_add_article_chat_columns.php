<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Ai\Migrations\AiMigration;

return new class extends AiMigration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $conversationsTable = config('ai.conversations.tables.conversations', 'agent_conversations');
        $messagesTable = config('ai.conversations.tables.messages', 'agent_conversation_messages');

        Schema::table($conversationsTable, function (Blueprint $table) {
            $table->unsignedBigInteger('article_id')->nullable();
            $table->string('provider')->nullable();
            $table->string('model')->nullable();

            $table->index('article_id');
            $table->foreign('article_id')->references('id')->on('articles')->cascadeOnDelete();
            $table->unique(['participant_type', 'participant_id', 'article_id']);
        });

        // SQLite cannot add a FK to an existing table, so rebuild it with the
        // package's exact columns and indexes plus the FK, copying rows across.
        // Indexes are only added once the old table (which still owns their
        // names) is dropped.
        Schema::rename($messagesTable, $messagesTable.'_old');

        Schema::create($messagesTable, function (Blueprint $table) use ($conversationsTable) {
            $table->string('id', 36)->primary();
            $table->string('conversation_id', 36);
            $table->string('participant_type')->nullable();
            $table->unsignedBigInteger('participant_id')->nullable();
            $table->string('agent');
            $table->string('role', 25);
            $table->text('content');
            $table->text('attachments');
            $table->longText('steps');
            $table->text('usage');
            $table->text('meta');
            $table->string('status', 25);
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on($conversationsTable)->cascadeOnDelete();
        });

        $columns = ['id', 'conversation_id', 'participant_type', 'participant_id', 'agent', 'role', 'content', 'attachments', 'steps', 'usage', 'meta', 'status', 'created_at', 'updated_at'];

        DB::table($messagesTable)->insertUsing($columns, DB::table($messagesTable.'_old')->select($columns));

        Schema::drop($messagesTable.'_old');

        Schema::table($messagesTable, function (Blueprint $table) {
            $table->index('conversation_id');
            $table->index(['conversation_id', 'participant_type', 'participant_id', 'updated_at'], 'conversation_index');
            $table->index(['participant_type', 'participant_id', 'agent'], 'participant_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $conversationsTable = config('ai.conversations.tables.conversations', 'agent_conversations');
        $messagesTable = config('ai.conversations.tables.messages', 'agent_conversation_messages');

        // Reverse the messages rebuild first: the FK we are removing points at
        // agent_conversations, so it must go before the conversations changes.
        Schema::rename($messagesTable, $messagesTable.'_old');

        Schema::create($messagesTable, function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('conversation_id', 36);
            $table->string('participant_type')->nullable();
            $table->unsignedBigInteger('participant_id')->nullable();
            $table->string('agent');
            $table->string('role', 25);
            $table->text('content');
            $table->text('attachments');
            $table->longText('steps');
            $table->text('usage');
            $table->text('meta');
            $table->string('status', 25);
            $table->timestamps();
        });

        $columns = ['id', 'conversation_id', 'participant_type', 'participant_id', 'agent', 'role', 'content', 'attachments', 'steps', 'usage', 'meta', 'status', 'created_at', 'updated_at'];

        DB::table($messagesTable)->insertUsing($columns, DB::table($messagesTable.'_old')->select($columns));

        Schema::drop($messagesTable.'_old');

        Schema::table($messagesTable, function (Blueprint $table) {
            $table->index('conversation_id');
            $table->index(['conversation_id', 'participant_type', 'participant_id', 'updated_at'], 'conversation_index');
            $table->index(['participant_type', 'participant_id', 'agent'], 'participant_index');
        });

        Schema::table($conversationsTable, function (Blueprint $table) {
            $table->dropUnique(['participant_type', 'participant_id', 'article_id']);
            $table->dropForeign(['article_id']);
            // SQLite refuses to drop a column still referenced by an index.
            $table->dropIndex(['article_id']);
            $table->dropColumn('article_id', 'provider', 'model');
        });
    }
};
