<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained()->cascadeOnDelete();
            $table->foreignId('player1_id')->constrained('users');
            $table->foreignId('player2_id')->constrained('users');
            $table->enum('status', ['en_attente', 'en_cours', 'soumission', 'validation', 'termine', 'litige', 'annule'])->default('en_attente');
            $table->string('room_link')->nullable();
            $table->foreignId('winner_id')->nullable()->constrained('users');
            $table->boolean('player1_ready')->default(false);
            $table->boolean('player2_ready')->default(false);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
