<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('feeds')
            ->where('feed_url', 'import://feedly')
            ->update([
                'title' => 'Imports',
                'feed_url' => 'special:imports',
                'description' => 'Articles saved by URL',
            ]);
    }

    public function down(): void
    {
        DB::table('feeds')
            ->where('feed_url', 'special:imports')
            ->update([
                'title' => 'Feedly Imports',
                'feed_url' => 'import://feedly',
                'description' => null,
            ]);
    }
};
