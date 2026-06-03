<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->withCount([
                'matchesAsPlayer1 as matches_count',
                'matchesAsPlayer2 as matches_p2_count',
            ])
            ->latest();

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($b) use ($q) {
                $b->where('name', 'like', "%{$q}%")
                  ->orWhere('username', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $users = $query->paginate(20)->through(fn($u) => [
            'id'               => $u->id,
            'name'             => $u->name,
            'username'         => $u->username,
            'email'            => $u->email,
            'avatar_path'      => $u->avatar_path,
            'balance_rb'       => $u->balance_rb,
            'reliability_score'=> $u->reliability_score,
            'status'           => $u->status ?? 'actif',
            'matches_count'    => $u->matches_count + $u->matches_p2_count,
            'created_at'       => $u->created_at->format('d/m/Y'),
        ]);

        return Inertia::render('Admin/Users', [
            'users'   => $users,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => ['required', 'in:actif,suspendu,banni'],
        ]);

        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        return back()->with('flash', ['success' => 'Statut mis à jour.']);
    }
}
