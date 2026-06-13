<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('receiver_id')->nullable()->constrained('users')->nullOnDelete()->after('sender_id');
            $table->unsignedBigInteger('match_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['receiver_id']);
            $table->dropColumn('receiver_id');
            $table->unsignedBigInteger('match_id')->nullable(false)->change();
        });
    }
};
