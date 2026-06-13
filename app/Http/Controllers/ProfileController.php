<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\Follow;
use App\Models\GameMatch;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('Profil/Index', [
            'profile' => $this->buildProfile(Auth::user()),
        ]);
    }

    public function show(int $id)
    {
        $me     = Auth::user();
        $target = User::findOrFail($id);

        $challenges = Challenge::where('creator_id', $target->id)
            ->where('status', 'ouvert')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'game'       => $c->game,
                'type'       => $c->type,
                'bet_amount' => $c->bet_amount,
                'created_at' => $c->created_at->diffForHumans(),
            ]);

        $reviews = Review::where('reviewed_id', $target->id)
            ->with('reviewer')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'id'         => $r->id,
                'reviewer'   => $r->reviewer->username,
                'sentiment'  => $r->sentiment,
                'comment'    => $r->comment,
                'created_at' => $r->created_at->diffForHumans(),
            ]);

        $profile               = $this->buildProfile($target);
        $profile['followers']  = Follow::where('followed_id', $target->id)->count();
        $profile['following']  = Follow::where('follower_id', $target->id)->count();
        $profile['is_following'] = $me
            ? Follow::where('follower_id', $me->id)->where('followed_id', $target->id)->exists()
            : false;

        return Inertia::render('Profil/Show', [
            'profile'    => $profile,
            'challenges' => $challenges,
            'reviews'    => $reviews,
        ]);
    }

    public function follow(int $id)
    {
        $me = Auth::user();
        if ($me->id === $id) return response()->json(['error' => 'forbidden'], 403);

        Follow::firstOrCreate(['follower_id' => $me->id, 'followed_id' => $id]);

        return response()->json([
            'followers'    => Follow::where('followed_id', $id)->count(),
            'is_following' => true,
        ]);
    }

    public function unfollow(int $id)
    {
        $me = Auth::user();

        Follow::where('follower_id', $me->id)->where('followed_id', $id)->delete();

        return response()->json([
            'followers'    => Follow::where('followed_id', $id)->count(),
            'is_following' => false,
        ]);
    }

    public function updateLocale(Request $request)
    {
        $locale = in_array($request->input('locale'), ['fr', 'en']) ? $request->input('locale') : 'fr';
        Auth::user()->update(['locale' => $locale]);
        return response()->json(['ok' => true]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'username' => ['sometimes', 'string', 'min:3', 'max:30', Rule::unique('users')->ignore($user->id)],
            'bio'      => ['sometimes', 'nullable', 'string', 'max:300'],
        ]);

        $user->update(array_filter($validated, fn($v) => $v !== null));

        return back()->with('success', 'Profil mis à jour.');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $user = Auth::user();

        if ($user->avatar_path) {
            Storage::disk('images')->delete(str_replace('/images/', '', $user->avatar_path));
        }

        $path = $request->file('avatar')->store('avatars', 'images');
        $user->update(['avatar_path' => '/images/' . $path]);

        return back()->with('success', 'Photo de profil mise à jour.');
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => ['required', function ($attribute, $value, $fail) use ($user) {
                if (!Hash::check($value, $user->password)) {
                    $fail('Mot de passe actuel incorrect.');
                }
            }],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update(['password' => $request->password]);

        return back()->with('success', 'Mot de passe mis à jour.');
    }

    private function buildProfile(User $user): array
    {
        $matches = GameMatch::where(function ($q) use ($user) {
            $q->where('player1_id', $user->id)->orWhere('player2_id', $user->id);
        })->where('status', 'termine')->get();

        $wins  = $matches->where('winner_id', $user->id)->count();
        $total = $matches->count();

        return [
            'id'                => $user->id,
            'username'          => $user->username,
            'bio'               => $user->bio ?? '',
            'avatar_path'       => $user->avatar_path,
            'balance_rb'        => $user->balance_rb,
            'balance_usdt'      => $user->balance_usdt ?? 0,
            'reliability_score' => $user->reliability_score ?? 100,
            'member_since'      => $user->created_at->format('M Y'),
            'wins'              => $wins,
            'losses'            => $total - $wins,
            'total'             => $total,
        ];
    }
}
