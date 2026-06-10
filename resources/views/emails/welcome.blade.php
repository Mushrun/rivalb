<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('email_welcome_subject') }}</title>
    <style>
        body { margin: 0; padding: 0; background: #0D0D0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 520px; margin: 40px auto; background: #1A1A1A; border-radius: 16px; overflow: hidden; }
        .header { background: #FF3B30; padding: 32px 32px 24px; text-align: center; }
        .header h1 { color: #FFF; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px; }
        .greeting { color: #FFF; font-size: 18px; font-weight: 700; margin: 0 0 12px; }
        .text { color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .btn { display: block; background: #FF3B30; color: #FFF; text-decoration: none; text-align: center; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; }
        .divider { border: none; border-top: 1px solid #2A2A2A; margin: 24px 0; }
        .stat { display: inline-block; background: #0D0D0D; border-radius: 10px; padding: 12px 20px; margin: 4px; text-align: center; }
        .stat-value { color: #FF3B30; font-size: 20px; font-weight: 900; display: block; }
        .stat-label { color: #555; font-size: 11px; display: block; margin-top: 2px; }
        .footer { padding: 16px 32px; text-align: center; }
        .footer p { color: #444; font-size: 11px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RIVALBET</h1>
            <p>{{ __('email_welcome_platform') }}</p>
        </div>
        <div class="body">
            <p class="greeting">{{ __('email_welcome_greeting', ['username' => $user->username]) }}</p>
            <p class="text">{{ __('email_welcome_body') }}</p>

            <div style="text-align:center; margin-bottom: 24px;">
                <div class="stat">
                    <span class="stat-value">100</span>
                    <span class="stat-label">{{ __('email_welcome_reliability') }}</span>
                </div>
                <div class="stat">
                    <span class="stat-value">0 RB</span>
                    <span class="stat-label">{{ __('email_welcome_balance') }}</span>
                </div>
            </div>

            <a href="{{ config('app.url') }}/battle" class="btn">{{ __('email_welcome_cta') }}</a>

            <hr class="divider">
            <p class="text" style="margin:0; font-size:12px;">
                {{ __('email_welcome_how') }}
            </p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Rivalbet · {{ __('email_welcome_footer') }}</p>
        </div>
    </div>
</body>
</html>
