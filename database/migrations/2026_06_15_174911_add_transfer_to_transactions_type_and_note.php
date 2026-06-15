<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajoute 'transfer' dans l'ENUM type
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('depot','retrait','match_gain','match_perte','remboursement','bonus_bienvenue','transfer') NOT NULL");

        // Ajoute la colonne note pour stocker "À : @username" ou "De : @username"
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('note')->nullable()->after('reject_reason');
        });
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('depot','retrait','match_gain','match_perte','remboursement','bonus_bienvenue') NOT NULL");

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('note');
        });
    }
};
