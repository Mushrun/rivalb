<?php

namespace App\Http\Controllers;

use App\Jobs\ValidateResultJob;
use App\Models\Challenge;
use App\Models\GameMatch;
use App\Models\Message;
use App\Services\MatchService;
use App\Services\NotificationService;
use App\Services\ShadowCoinService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MatchController extends Controller
{
    public function __construct(private MatchService $matchService) {}

    public function show(int $id)
    {
        return redirect("/chat/{$id}");
    }

    public function setReady(Request $request, int $id)
    {
        $match = GameMatch::findOrFail($id);
        $user  = Auth::user();

        $this->matchService->setReady($user, $match);

        // Si un lien SF4 est fourni, l'envoyer dans le chat du match
        $link = trim($request->input('match_link', ''));
        if ($link !== '') {
            Message::create([
                'match_id'  => $match->id,
                'sender_id' => $user->id,
                'body'      => '🎮 ID de la salle Shadow Fight 4 : ' . $link,
                'type'      => 'text',
            ]);
        }

        return redirect("/chat/{$id}");
    }

    public function quit(int $id, ShadowCoinService $coinService, NotificationService $notifService)
    {
        $match = GameMatch::findOrFail($id);
        $user  = Auth::user();

        if ($match->player2_id !== $user->id) {
            return back()->withErrors(['quit' => 'Only the opponent can quit.']);
        }

        if ($match->status !== 'en_attente') {
            return back()->withErrors(['quit' => 'Cannot quit once the match has started.']);
        }

        DB::transaction(function () use ($match, $user, $coinService, $notifService) {
            $challenge = $match->challenge;
            $currency  = $challenge->currency ?? 'rb';

            // Refund player2
            if ($currency === 'usdt') {
                $coinService->creditUsdt($user, $challenge->bet_amount, 'remboursement');
            } else {
                $coinService->credit($user, $challenge->bet_amount, 'remboursement');
            }

            // Reopen challenge
            $challenge->update(['status' => 'ouvert']);

            // Delete match
            $match->delete();

            // Notify creator
            $creator = $challenge->creator;
            $notifService->matchQuitte($creator, $challenge->id, $user->username);
        });

        return redirect('/battle');
    }

    public function submitResult(Request $request, int $id)
    {
        $request->validate([
            'claimed_result' => ['required', 'in:win,loss'],
        ]);

        $screenshotPath = null;

        $user  = Auth::user();
        $match = GameMatch::findOrFail($id);

        $result = $this->matchService->submitResult(
            $user,
            $match,
            $request->claimed_result,
            $screenshotPath,
        );

        ValidateResultJob::dispatch($result, $user);

        // Message visible dans le chat avec la capture
        Message::create([
            'match_id'  => $match->id,
            'sender_id' => $user->id,
            'body'      => json_encode([
                'result'     => $request->claimed_result,
                'screenshot' => $screenshotPath,
            ]),
            'type'      => 'result',
        ]);

        return redirect("/chat/{$id}");
    }
}
