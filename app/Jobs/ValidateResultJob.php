<?php

namespace App\Jobs;

use App\Models\MatchResult;
use App\Models\User;
use App\Services\AI\FraudDetectionService;
use App\Services\AI\ResultValidationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ValidateResultJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 60;

    public function __construct(
        public readonly MatchResult $result,
        public readonly User        $user,
    ) {}

    public function handle(
        ResultValidationService $validationService,
        FraudDetectionService   $fraudService,
    ): void {
        if ($this->result->screenshot_path) {
            $validationService->validate($this->result);
        }

        $fraudService->analyze($this->user);
    }
}
