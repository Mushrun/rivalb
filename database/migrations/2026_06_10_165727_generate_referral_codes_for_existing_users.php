<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        User::whereNull('referral_code')->each(function (User $user) {
            do {
                $code = strtoupper(Str::random(8));
            } while (User::where('referral_code', $code)->exists());

            $user->updateQuietly(['referral_code' => $code]);
        });
    }

    public function down(): void {}
};
