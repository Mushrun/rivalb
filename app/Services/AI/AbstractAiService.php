<?php

namespace App\Services\AI;

use App\Models\AiLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class AbstractAiService
{
    protected function callClaude(string $model, array $messages, int $maxTokens = 512): string
    {
        $response = Http::timeout(30)
            ->withHeaders([
                'x-api-key'         => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])
            ->post('https://api.anthropic.com/v1/messages', [
                'model'      => $model,
                'max_tokens' => $maxTokens,
                'messages'   => $messages,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Anthropic API error: ' . $response->status());
        }

        return $response->json('content.0.text', '');
    }

    protected function record(
        string $action,
        string $model,
        string $input,
        string $output,
        ?int   $confidenceScore,
    ): void {
        try {
            AiLog::create([
                'action'           => $action,
                'model'            => $model,
                'input'            => $input,
                'output'           => $output,
                'confidence_score' => $confidenceScore,
            ]);
        } catch (\Throwable $e) {
            Log::error('AiLog write failed: ' . $e->getMessage());
        }
    }

    protected function safeInt(string $text, int $default = 50): int
    {
        preg_match('/\d+/', trim($text), $matches);
        $value = isset($matches[0]) ? (int) $matches[0] : $default;
        return max(0, min(100, $value));
    }
}
