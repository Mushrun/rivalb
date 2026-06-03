<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'bscscan' => [
        'key'             => env('BSCSCAN_API_KEY'),
        'token_address'   => env('RB_TOKEN_ADDRESS'),
        'usdt_address'    => env('USDT_TOKEN_ADDRESS'),
        'platform_wallet' => env('PLATFORM_WALLET'),
        'rb_per_usdt'     => (int) env('RB_PER_USDT', 500),
    ],

    'anthropic' => [
        'key'                 => env('ANTHROPIC_API_KEY'),
        'moderation_enabled'  => env('AI_CHAT_MODERATION_ENABLED', true),
        'validation_threshold'=> env('AI_SCREENSHOT_CONFIDENCE_THRESHOLD', 80),
        'fraud_threshold'     => env('AI_FRAUD_RISK_THRESHOLD', 70),
    ],

];
