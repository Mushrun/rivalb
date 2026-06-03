<?php

namespace App\Http\Controllers;

use App\Models\GameMatch;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request, int $matchId)
    {
        $user  = Auth::user();
        $match = GameMatch::findOrFail($matchId);

        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            abort(403);
        }

        if ($match->status !== 'termine') {
            return back()->withErrors(['review' => 'Le match n\'est pas encore terminé.']);
        }

        $alreadyReviewed = Review::where('reviewer_id', $user->id)
            ->where('match_id', $matchId)
            ->exists();

        if ($alreadyReviewed) {
            return back()->withErrors(['review' => 'Tu as déjà laissé un avis pour ce match.']);
        }

        $validated = $request->validate([
            'sentiment' => ['required', 'in:positive,negative'],
            'comment'   => ['nullable', 'string', 'max:500'],
        ]);

        $reviewedId = $match->player1_id === $user->id
            ? $match->player2_id
            : $match->player1_id;

        Review::create([
            'reviewer_id' => $user->id,
            'reviewed_id' => $reviewedId,
            'match_id'    => $matchId,
            'sentiment'   => $validated['sentiment'],
            'comment'     => $validated['comment'] ?? null,
        ]);

        return redirect("/match/{$matchId}");
    }
}
