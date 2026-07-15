<?php

namespace App\Providers;

use Illuminate\Routing\Exceptions\UrlGenerationException;
use Illuminate\Routing\UrlGenerator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(UrlGenerator $url): void
    { Schema::defaultStringLength(191);
        Vite::prefetch(concurrency: 3);

        if(env('APP_ENV') === 'production') {
            $url->forceScheme('https');
        }
    }
}
