<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::firstOrCreate(
            ['email' => 'admin@rivalbet.com'],
            [
                'name'      => 'Super Admin',
                'password'  => 'Admin@1234',
                'role'      => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}
