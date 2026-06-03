<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\EnsureUserIsActive::class,
        ]);
        $middleware->redirectGuestsTo(fn(\Illuminate\Http\Request $r) => $r->is('admin*') ? '/admin/login' : '/login');
        $middleware->redirectUsersTo(fn(\Illuminate\Http\Request $r) => $r->is('admin*') ? '/admin' : '/battle');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
