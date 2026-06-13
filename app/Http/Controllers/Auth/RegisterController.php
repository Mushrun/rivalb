<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendWelcomeEmailJob;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username'       => ['required', 'string', 'min:3', 'max:30', 'unique:users'],
            'email'          => ['required', 'email', 'unique:users'],
            'password'       => ['required', 'confirmed', Password::min(8)],
            'referral_code'      => ['nullable', 'string', 'max:10'],
            'telegram_username'  => ['nullable', 'string', 'max:50'],
        ]);

        $referrer = null;
        if (!empty($validated['referral_code'])) {
            $referrer = User::where('referral_code', strtoupper($validated['referral_code']))->first();
        }

        $user = User::create([
            'name'               => $validated['username'],
            'username'           => $validated['username'],
            'email'              => $validated['email'],
            'password'           => $validated['password'],
            'referred_by'        => $referrer?->id,
            'telegram_username'  => $validated['telegram_username'] ?? null,
        ]);

        $user->assignRole('player');

        // Bonus de bienvenue : 5 USDT offerts à l'inscription
        $user->increment('balance_usdt', 5.00);

        Auth::login($user);

        $request->session()->regenerate();

        SendWelcomeEmailJob::dispatch($user);

        return redirect('/battle');
    }
}
