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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['depot', 'retrait', 'match_gain', 'match_perte', 'remboursement']);
            $table->unsignedBigInteger('amount_rb');
            $table->decimal('amount_crypto', 18, 8)->nullable();
            $table->string('wallet_address')->nullable();
            $table->string('tx_hash')->unique()->nullable();
            $table->enum('status', ['en_attente', 'valide', 'refuse'])->default('en_attente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
