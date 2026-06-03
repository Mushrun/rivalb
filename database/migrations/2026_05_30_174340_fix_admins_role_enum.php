<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE admins SET role = 'moderator' WHERE role = 'moderateur'");

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE admins MODIFY COLUMN role ENUM('super_admin', 'moderator', 'support') NOT NULL DEFAULT 'moderator'");
        }
    }

    public function down(): void
    {
        DB::statement("UPDATE admins SET role = 'moderateur' WHERE role = 'moderator'");

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE admins MODIFY COLUMN role ENUM('super_admin', 'moderateur', 'support') NOT NULL DEFAULT 'moderateur'");
        }
    }
};
