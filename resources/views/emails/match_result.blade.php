<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $won ? __('email_match_won_title') : __('email_match_lost_title') }}</title>
    <style>
        body { margin: 0; padding: 0; background: #0D0D0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 520px; margin: 40px auto; background: #1A1A1A; border-radius: 16px; overflow: hidden; }
        .header { padding: 32px 32px 24px; text-align: center; background: {{ $won ? 'rgba(76,217,100,0.15)' : 'rgba(255,59,48,0.1)' }}; border-bottom: 2px solid {{ $won ? '#4CD964' : '#FF3B30' }}; }
        .result-icon { font-size: 48px; margin-bottom: 8px; }
        .result-title { color: {{ $won ? '#4CD964' : '#FF3B30' }}; font-size: 28px; font-weight: 900; margin: 0; }
        .result-subtitle { color: #888; font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px; }
        .text { color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .prize-box { background: #0D0D0D; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px solid {{ $won ? 'rgba(76,217,100,0.2)' : 'rgba(255,59,48,0.15)' }}; }
        .prize-label { color: #555; font-size: 11px; font-weight: 700; letter-spacing: 2px; display: block; margin-bottom: 6px; }
        .prize-value { color: {{ $won ? '#4CD964' : '#FF3B30' }}; font-size: 36px; font-weight: 900; display: block; }
        .btn { display: block; background: #FF3B30; color: #FFF; text-decoration: none; text-align: center; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; }
        .footer { padding: 16px 32px; text-align: center; }
        .footer p { color: #444; font-size: 11px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="result-icon">{{ $won ? '🏆' : '💔' }}</div>
            <h1 class="result-title">{{ $won ? __('email_match_won_title') : __('email_match_lost_title') }}</h1>
            <p class="result-subtitle">Match #{{ $matchId }}</p>
        </div>
        <div class="body">
            <p class="text">
                <strong style="color:#FFF">{{ $recipient->username }}</strong>,<br>
                @if($won)
                    {{ __('email_match_greeting_won') }}
                @else
                    {{ __('email_match_greeting_lost') }}
                @endif
            </p>

            <div class="prize-box">
                <span class="prize-label">{{ $won ? __('email_match_earned') : __('email_match_lost_bet') }}</span>
                <span class="prize-value">{{ $won ? '+' : '-' }}{{ $won ? $prize : ($prize / 2) }} {{ strtoupper($currency) }}</span>
            </div>

            <a href="{{ config('app.url') }}/match/{{ $matchId }}" class="btn">{{ __('email_match_cta') }}</a>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} Rivalbet · Match #{{ $matchId }}</p>
        </div>
    </div>
</body>
</html>
