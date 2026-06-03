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
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['1v1', '3v3'])->default('1v1');
            $table->string('game')->default('Street Fighter 6');
            $table->unsignedBigInteger('bet_amount');
            $table->enum('status', ['ouvert', 'en_cours', 'termine', 'annule'])->default('ouvert');
            $table->json('rules')->nullable();
            $table->enum('visibility', ['public', 'prive'])->default('public');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};
