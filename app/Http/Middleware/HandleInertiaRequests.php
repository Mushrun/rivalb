<?php

namespace App\Http\Middleware;

use App\Models\Message;
use App\Models\Notification;
use Closure;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    private const GUEST_PATHS = ['login', 'register', 'forgot-password', 'reset-password/*'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = parent::handle($request, $next);

        if ($request->is(...self::GUEST_PATHS)) {
            $response->headers->set('Cache-Control', 'no-store, private');
        }

        return $response;
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'                => $request->user()->id,
                    'name'              => $request->user()->name,
                    'username'          => $request->user()->username,
                    'email'             => $request->user()->email,
                    'balance_rb'        => $request->user()->balance_rb,
                    'reliability_score' => $request->user()->reliability_score,
                    'avatar_path'       => $request->user()->avatar_path,
                    'bio'              => $request->user()->bio,
                    'wallet_address'    => $request->user()->wallet_address,
                    'status'            => $request->user()->status,
                ] : null,
                'admin' => $request->user('admin') ? [
                    'id'    => $request->user('admin')->id,
                    'name'  => $request->user('admin')->name,
                    'email' => $request->user('admin')->email,
                    'role'  => $request->user('admin')->role,
                ] : null,
            ],
            'unread_count' => $request->user()
                ? Notification::where('user_id', $request->user()->id)->whereNull('read_at')->count()
                : 0,
            'unread_chat' => $request->user()
                ? Message::whereHas('gameMatch', fn($q) => $q
                        ->where('player1_id', $request->user()->id)
                        ->orWhere('player2_id', $request->user()->id))
                    ->where('sender_id', '!=', $request->user()->id)
                    ->whereNull('read_at')
                    ->count()
                : 0,
            'flash' => [
                'status'  => $request->session()->get('status'),
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
