<?php

namespace App\Http\Controllers;

use App\Models\User;
use Elliptic\EC;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use kornrunner\Keccak;

class WalletController extends Controller
{
    public function nonce(string $address)
    {
        $address = strtolower($address);
        $nonce   = bin2hex(random_bytes(16));

        $user = User::where('wallet_address', $address)->first();

        if ($user) {
            $user->update(['auth_nonce' => $nonce]);
        } else {
            session(["wallet_nonce_{$address}" => $nonce]);
        }

        return response()->json(['nonce' => $nonce]);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'address'   => ['required', 'string'],
            'signature' => ['required', 'string'],
        ]);

        $address   = strtolower($validated['address']);
        $signature = $validated['signature'];

        $existingUser = User::where('wallet_address', $address)->first();
        $nonce        = $existingUser
            ? $existingUser->auth_nonce
            : session("wallet_nonce_{$address}");

        if (!$nonce) {
            return response()->json(['error' => 'Nonce invalide ou expiré. Recommence.'], 422);
        }

        $message = "Connexion RIVALBET — nonce: {$nonce}";

        if (!$this->verifySignature($message, $signature, $address)) {
            return response()->json(['error' => 'Signature invalide.'], 422);
        }

        // Rotate nonce after use (anti-replay)
        if ($existingUser) {
            $existingUser->update(['auth_nonce' => bin2hex(random_bytes(16))]);
        } else {
            session()->forget("wallet_nonce_{$address}");
        }

        // User is logged in → link wallet to account
        if (Auth::check()) {
            $user = Auth::user();

            if ($existingUser && $existingUser->id !== $user->id) {
                return response()->json(['error' => 'Ce wallet est déjà lié à un autre compte.'], 422);
            }

            $user->update(['wallet_address' => $address]);

            return response()->json(['success' => true, 'address' => $address]);
        }

        // Not logged in → sign in via wallet
        if (!$existingUser) {
            return response()->json(['error' => 'Aucun compte lié à ce wallet. Connecte-toi d\'abord avec ton email.'], 422);
        }

        Auth::login($existingUser);
        $request->session()->regenerate();

        $intended = redirect()->intended('/battle')->getTargetUrl();
        return response()->json(['redirect' => $intended]);
    }

    public function unlink(Request $request)
    {
        $user = Auth::user();
        $user->update(['wallet_address' => null, 'auth_nonce' => null]);
        return back();
    }

    private function verifySignature(string $message, string $signature, string $address): bool
    {
        try {
            $msgLen = strlen($message);
            $hash   = Keccak::hash("\x19Ethereum Signed Message:\n{$msgLen}{$message}", 256);

            $sign  = [
                'r' => substr($signature, 2, 64),
                's' => substr($signature, 66, 64),
            ];
            $recid = hexdec(substr($signature, 130, 2)) - 27;

            if ($recid < 0 || $recid > 3) {
                return false;
            }

            $ec     = new EC('secp256k1');
            $pubKey = $ec->recoverPubKey($hash, $sign, $recid);

            $pubKeyHex  = $pubKey->encode('hex');
            $pubKeyBin  = hex2bin(substr($pubKeyHex, 2));
            $keyHash    = Keccak::hash($pubKeyBin, 256);
            $recovered  = '0x' . substr($keyHash, -40);

            return strtolower($recovered) === strtolower($address);
        } catch (\Throwable) {
            return false;
        }
    }
}
