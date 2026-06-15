<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🏆 {{ $winner_username }} won on RivalBet!</title>

    <!-- Open Graph -->
    <meta property="og:type"        content="website" />
    <meta property="og:site_name"   content="RivalBet" />
    <meta property="og:title"       content="🏆 {{ $winner_username }} just won on RivalBet!" />
    <meta property="og:description" content="{{ $winner_username }} beat {{ $loser_username }} in {{ $game }} and won {{ $gain }} {{ $currency }}. Join and start winning!" />
    <meta property="og:url"         content="{{ $app_url }}/register?ref={{ \Illuminate\Support\Str::after($referral_link, 'ref=') }}" />
    <meta property="og:image"       content="{{ $app_url }}/og-banner.png" />

    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="🏆 {{ $winner_username }} won on RivalBet!" />
    <meta name="twitter:description" content="{{ $winner_username }} beat {{ $loser_username }} in {{ $game }} and won {{ $gain }} {{ $currency }}." />
    <meta name="twitter:image"       content="{{ $app_url }}/og-banner.png" />

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0D0D0D;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .card {
            width: 100%;
            max-width: 420px;
            background: #1A1A1A;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #2A2A2A;
        }
        .card-header {
            background: linear-gradient(135deg, #1A1200 0%, #2A1A00 100%);
            border-bottom: 1px solid rgba(255,193,7,0.2);
            padding: 32px 24px 24px;
            text-align: center;
            position: relative;
        }
        .trophy {
            font-size: 56px;
            line-height: 1;
            margin-bottom: 12px;
        }
        .victory-badge {
            display: inline-block;
            background: rgba(255,193,7,0.15);
            border: 1px solid rgba(255,193,7,0.4);
            color: #FFC107;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 3px;
            padding: 5px 14px;
            border-radius: 50px;
            margin-bottom: 16px;
        }
        .winner-name {
            font-size: 28px;
            font-weight: 900;
            color: #fff;
            margin-bottom: 6px;
        }
        .vs-line {
            font-size: 13px;
            color: #888;
        }
        .vs-line span {
            color: #FF3B30;
            font-weight: 700;
        }
        .card-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .stat-row {
            display: flex;
            gap: 12px;
        }
        .stat-box {
            flex: 1;
            background: #0D0D0D;
            border-radius: 14px;
            padding: 14px 12px;
            text-align: center;
        }
        .stat-label {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #555;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        .stat-value {
            font-size: 18px;
            font-weight: 900;
        }
        .gain-value { color: #4CD964; }
        .game-value { color: #fff; font-size: 14px; }
        .date-value { color: #888; font-size: 12px; }
        .divider {
            height: 1px;
            background: #2A2A2A;
        }
        .brand-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .brand-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #FF3B30;
        }
        .brand-name {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #888;
        }
        .cta-btn {
            display: block;
            width: 100%;
            padding: 16px;
            background: #FF3B30;
            color: #fff;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 1px;
            text-align: center;
            text-decoration: none;
            border-radius: 16px;
            transition: opacity 0.2s;
        }
        .cta-btn:hover { opacity: 0.88; }
        .cta-sub {
            text-align: center;
            font-size: 11px;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header">
            <div class="trophy">🏆</div>
            <div class="victory-badge">VICTORY</div>
            <div class="winner-name">{{ $winner_username }}</div>
            <div class="vs-line">beat <span>{{ $loser_username }}</span></div>
        </div>

        <div class="card-body">
            <div class="stat-row">
                <div class="stat-box">
                    <div class="stat-label">WON</div>
                    <div class="stat-value gain-value">{{ $gain }} {{ $currency }}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">GAME</div>
                    <div class="stat-value game-value">{{ $game }}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">DATE</div>
                    <div class="stat-value date-value">{{ $match_date }}</div>
                </div>
            </div>

            <div class="divider"></div>

            <div class="brand-row">
                <div class="brand-dot"></div>
                <span class="brand-name">RIVALBET</span>
                <div class="brand-dot"></div>
            </div>

            <a href="{{ $referral_link }}" class="cta-btn">
                ⚔️ JOIN RIVALBET — IT'S FREE
            </a>
            <p class="cta-sub">Challenge real players. Win real money.</p>
        </div>
    </div>
</body>
</html>
