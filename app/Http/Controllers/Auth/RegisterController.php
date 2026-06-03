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
            'username' => ['required', 'string', 'min:3', 'max:30', 'unique:users'],
            'email'    => ['required', 'email', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $validated['username'],
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
        ]);

        $user->assignRole('player');

        Auth::login($user);

        $request->session()->regenerate();

        SendWelcomeEmailJob::dispatch($user);

        return redirect('/battle');
    }
}
