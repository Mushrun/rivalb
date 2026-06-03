<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Email ou mot de passe incorrect.',
            ])->onlyInput('email');
        }

        $user = Auth::user();

        if ($user->isBanned()) {
            Auth::logout();
            return back()->withErrors(['email' => 'Ton compte a été banni.'])->onlyInput('email');
        }

        if ($user->isSuspended()) {
            Auth::logout();
            return back()->withErrors(['email' => 'Ton compte est suspendu.'])->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended('/battle');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
