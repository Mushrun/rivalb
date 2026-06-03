<?php

namespace App\Http\Controllers;

use App\Jobs\ValidateResultJob;
use App\Models\GameMatch;
use App\Models\Message;
use App\Services\MatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    public function submitResult(Request $request, int $id)
    {
        $request->validate([
            'claimed_result' => ['required', 'in:win,loss'],
            'screenshot'     => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $screenshotPath = null;
        if ($request->hasFile('screenshot')) {
            $screenshotPath = $request->file('screenshot')->store('screenshots', 'public');
        }

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
