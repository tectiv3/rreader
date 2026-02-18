<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('articles')
            ->whereNotNull('summary')
            ->where('summary', 'LIKE', '%<%')
            ->eachById(function ($article) {
                DB::table('articles')
                    ->where('id', $article->id)
                    ->update(['summary' => strip_tags($article->summary)]);
            });
    }

    public function down(): void
    {
        // Not reversible - original HTML content is not preserved
    }
};
