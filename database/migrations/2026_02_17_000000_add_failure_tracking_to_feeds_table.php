<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feeds', function (Blueprint $table) {
            $table->integer('consecutive_failures')->default(0)->after('last_fetched_at');
            $table->text('last_error')->nullable()->after('consecutive_failures');
            $table->timestamp('last_failed_at')->nullable()->after('last_error');
            $table->timestamp('disabled_at')->nullable()->after('last_failed_at');
        });
    }

    public function down(): void
    {
        Schema::table('feeds', function (Blueprint $table) {
            $table->dropColumn(['consecutive_failures', 'last_error', 'last_failed_at', 'disabled_at']);
        });
    }
};
