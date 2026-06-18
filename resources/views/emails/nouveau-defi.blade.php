<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New challenge on RivalBet</title>
    <style>
        body { margin: 0; padding: 0; background: #0D0D0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 520px; margin: 40px auto; background: #1A1A1A; border-radius: 16px; overflow: hidden; }
        .header { background: #FF3B30; padding: 32px 32px 24px; text-align: center; }
        .header h1 { color: #FFF; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.75); font-size: 13px; margin: 6px 0 0; }
        .body { padding: 32px; }
        .greeting { color: #FFF; font-size: 18px; font-weight: 700; margin: 0 0 12px; }
        .text { color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .challenge-card { background: #0D0D0D; border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #2A2A2A; }
        .challenge-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .challenge-row:last-child { margin-bottom: 0; }
        .ch-label { color: #555; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
        .ch-value { color: #FFF; font-size: 14px; font-weight: 700; }
        .bet-value { color: #FF3B30; font-size: 24px; font-weight: 900; }
        .btn { display: block; background: #FF3B30; color: #FFF; text-decoration: none; text-align: center; padding: 16px; border-radius: 12px; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; }
        .divider { border: none; border-top: 1px solid #2A2A2A; margin: 24px 0; }
        .badge { display: inline-block; background: rgba(255,59,48,0.15); color: #FF3B30; font-size: 11px; font-weight: 800; letter-spacing: 2px; padding: 4px 12px; border-radius: 50px; margin-bottom: 16px; }
        .footer { padding: 16px 32px; text-align: center; }
        .footer p { color: #444; font-size: 11px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RIVALBET</h1>
            <p>P2P Gaming · Shadow Fight Arena</p>
        </div>

        <div class="body">
            <span class="badge">⚔️ NEW CHALLENGE</span>

            <p class="greeting">Hey {{ $recipient->username }},</p>
            <p class="text">
                <strong style="color:#FFF;">{{ $creatorUsername }}</strong> just launched a new challenge.
                Think you can beat them? Log in and accept it before someone else does!
            </p>

            <div class="challenge-card">
                <div class="challenge-row">
                    <span class="ch-label">Creator</span>
                    <span class="ch-value">{{ $creatorUsername }}</span>
                </div>
                <div class="challenge-row">
                    <span class="ch-label">Game</span>
                    <span class="ch-value">{{ $game }}</span>
                </div>
                <div class="challenge-row">
                    <span class="ch-label">Bet</span>
                    <span class="bet-value">
                        {{ $currency === 'usdt' ? '$' . number_format($betAmount, 2) . ' USDT' : $betAmount . ' RB' }}
                    </span>
                </div>
            </div>

            <a href="{{ config('app.url') }}/defis/{{ $challengeId }}" class="btn">
                ⚔️ ACCEPT THIS CHALLENGE
            </a>

            <hr class="divider">
            <p class="text" style="margin:0; font-size:12px;">
                If you win, you take the full pot (minus 5% platform fee). Be the first to accept!
            </p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Rivalbet · All rights reserved</p>
        </div>
    </div>
</body>
</html>
