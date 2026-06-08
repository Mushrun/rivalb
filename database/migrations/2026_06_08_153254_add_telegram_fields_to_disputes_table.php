<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('disputes', function (Blueprint $table) {
            $table->string('telegram_message_id')->nullable()->after('video_path');
            $table->unsignedInteger('player1_votes')->default(0)->after('telegram_message_id');
            $table->unsignedInteger('player2_votes')->default(0)->after('player1_votes');
        });
    }

    public function down(): void
    {
        Schema::table('disputes', function (Blueprint $table) {
            $table->dropColumn(['telegram_message_id', 'player1_votes', 'player2_votes']);
        });
    }
};
