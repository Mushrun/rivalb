<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    public function send(Request $request, int $receiverId)
    {
        $validated = $request->validate([
            'amount'   => ['required', 'numeric', 'min:1'],
            'currency' => ['required', 'in:rb,usdt'],
        ]);

        $sender   = Auth::user();
        $receiver = User::findOrFail($receiverId);

        if ($sender->id === $receiverId) {
            return response()->json(['error' => 'self_transfer'], 422);
        }

        // Seuls les amis (personnes suivies) peuvent recevoir un transfert
        if (!Follow::where('follower_id', $sender->id)->where('followed_id', $receiverId)->exists()) {
            return response()->json(['error' => 'not_friend'], 403);
        }

        $amount   = $validated['currency'] === 'usdt'
            ? round((float) $validated['amount'], 4)
            : (int) $validated['amount'];

        try {
            DB::transaction(function () use ($sender, $receiver, $amount, $validated) {
                if ($validated['currency'] === 'usdt') {
                    $fresh = User::lockForUpdate()->findOrFail($sender->id);
                    if ($fresh->balance_usdt < $amount) {
                        throw new \RuntimeException('insufficient_balance');
                    }
                    $fresh->decrement('balance_usdt', $amount);
                    $receiver->increment('balance_usdt', $amount);
                } else {
                    $fresh = User::lockForUpdate()->findOrFail($sender->id);
                    if ($fresh->balance_rb < $amount) {
                        throw new \RuntimeException('insufficient_balance');
                    }
                    $fresh->decrement('balance_rb', $amount);
                    $receiver->increment('balance_rb', $amount);
                }
            });
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        $currency = strtoupper($validated['currency']);

        $message = Message::create([
            'sender_id'   => $sender->id,
            'receiver_id' => $receiverId,
            'match_id'    => null,
            'type'        => 'transfer',
            'body'        => json_encode([
                'sender'   => $sender->username,
                'receiver' => $receiver->username,
                'amount'   => $amount,
                'currency' => $currency,
            ]),
        ]);

        return response()->json([
            'ok'      => true,
            'message' => [
                'id'       => $message->id,
                'type'     => 'transfer',
                'is_mine'  => true,
                'time'     => $message->created_at->format('H:i'),
                'sender'   => $sender->username,
                'receiver' => $receiver->username,
                'amount'   => $amount,
                'currency' => $currency,
            ],
        ]);
    }
}
