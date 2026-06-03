<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GameMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatchController extends Controller
{
    public function index(Request $request)
    {
        $query = GameMatch::with(['player1:id,name,username', 'player2:id,name,username', 'challenge:id,game,bet_amount'])
            ->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('player1', fn($b) => $b->where('username', 'like', "%{$q}%"))
                  ->orWhereHas('player2', fn($b) => $b->where('username', 'like', "%{$q}%"));
        }

        $matches = $query->paginate(20)->through(fn($m) => [
            'id'         => $m->id,
            'player1'    => $m->player1 ? ['id' => $m->player1->id, 'username' => $m->player1->username] : null,
            'player2'    => $m->player2 ? ['id' => $m->player2->id, 'username' => $m->player2->username] : null,
            'game'       => $m->challenge->game ?? '—',
            'bet_amount' => $m->challenge->bet_amount ?? 0,
            'status'     => $m->status,
            'started_at' => $m->started_at?->format('d/m/Y H:i'),
            'ended_at'   => $m->ended_at?->format('d/m/Y H:i'),
            'created_at' => $m->created_at->format('d/m/Y'),
        ]);

        return Inertia::render('Admin/Matchs', [
            'matches' => $matches,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function cancel(int $id)
    {
        $match = GameMatch::findOrFail($id);

        if ($match->status === 'termine') {
            return back()->with('flash', ['error' => 'Ce match est déjà terminé.']);
        }

        $match->update(['status' => 'annule', 'ended_at' => now()]);

        return back()->with('flash', ['success' => 'Match annulé.']);
    }
}
