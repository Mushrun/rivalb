<?php

namespace App\Providers;

use App\Events\MatchTermine;
use App\Listeners\EnvoyerNotificationsMatch;
use App\Listeners\MettreAJourFiabilite;
use App\Services\AI\ChatModerationService;
use App\Services\AI\FraudDetectionService;
use App\Services\AI\ResultValidationService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\NotificationService::class);
        $this->app->singleton(\App\Services\ShadowCoinService::class);

        $this->app->singleton(\App\Services\ChallengeService::class, function ($app) {
            return new \App\Services\ChallengeService(
                $app->make(\App\Services\ShadowCoinService::class),
                $app->make(\App\Services\NotificationService::class),
            );
        });

        $this->app->singleton(\App\Services\TelegramService::class);

        $this->app->singleton(\App\Services\DisputeService::class, function ($app) {
            return new \App\Services\DisputeService(
                $app->make(\App\Services\ShadowCoinService::class),
                $app->make(\App\Services\NotificationService::class),
                $app->make(\App\Services\TelegramService::class),
            );
        });

        $this->app->singleton(\App\Services\MatchService::class, function ($app) {
            return new \App\Services\MatchService(
                $app->make(\App\Services\ShadowCoinService::class),
                $app->make(\App\Services\DisputeService::class),
                $app->make(\App\Services\NotificationService::class),
            );
        });

        $this->app->singleton(ResultValidationService::class);
        $this->app->singleton(FraudDetectionService::class);
        $this->app->singleton(ChatModerationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(MatchTermine::class, EnvoyerNotificationsMatch::class);
        Event::listen(MatchTermine::class, MettreAJourFiabilite::class);

        if (str_contains(request()->header('host'), 'ngrok-free.dev')) {
            URL::forceScheme('https');
        }
    }
}
