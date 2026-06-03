<?php

namespace Tests\Unit;

use App\Events\MatchTermine;
use App\Models\Challenge;
use App\Models\GameMatch;
use App\Models\User;
use App\Services\DisputeService;
use App\Services\MatchService;
use App\Services\NotificationService;
use App\Services\ShadowCoinService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MatchServiceTest extends TestCase
{
    use RefreshDatabase;

    private MatchService $service;
    private User $player1;
    private User $player2;
    private Challenge $challenge;
    private GameMatch $match;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        Event::fake();

        $notifService   = $this->createMock(NotificationService::class);
        $coinService    = new ShadowCoinService();
        $disputeService = new DisputeService($coinService, $notifService);

        $this->service = new MatchService($coinService, $disputeService, $notifService);

        $this->player1 = User::factory()->create([
            'username'   => 'joueur1',
            'balance_rb' => 0,
        ]);

        $this->player2 = User::factory()->create([
            'username'   => 'joueur2',
            'balance_rb' => 0,
        ]);

        $this->challenge = Challenge::create([
            'creator_id' => $this->player1->id,
            'type'       => '1v1',
            'game'       => 'FIFA',
            'bet_amount' => 100,
            'status'     => 'en_cours',
            'visibility' => 'public',
        ]);

        $this->match = GameMatch::create([
            'challenge_id' => $this->challenge->id,
            'player1_id'   => $this->player1->id,
            'player2_id'   => $this->player2->id,
            'status'       => 'en_cours',
        ]);
    }

    public function test_gagnant_recoit_la_mise_moins_commission(): void
    {
        // 100 RB × 2 = 200, 5% = 10 → gagnant reçoit 190
        $this->service->submitResult($this->player1, $this->match, 'win');
        $this->service->submitResult($this->player2, $this->match, 'loss');

        $this->assertEquals(190, $this->player1->fresh()->balance_rb);
        $this->assertEquals(0,   $this->player2->fresh()->balance_rb);
    }

    public function test_match_passe_en_termine_quand_resultats_coherents(): void
    {
        $this->service->submitResult($this->player1, $this->match, 'win');
        $this->service->submitResult($this->player2, $this->match, 'loss');

        $this->assertEquals('termine', $this->match->fresh()->status);
        $this->assertEquals($this->player1->id, $this->match->fresh()->winner_id);
    }

    public function test_player2_gagne_si_player1_declare_defaite(): void
    {
        $this->service->submitResult($this->player1, $this->match, 'loss');
        $this->service->submitResult($this->player2, $this->match, 'win');

        $this->assertEquals(190, $this->player2->fresh()->balance_rb);
        $this->assertEquals($this->player2->id, $this->match->fresh()->winner_id);
    }

    public function test_litige_ouvert_si_les_deux_declarent_victoire(): void
    {
        $this->service->submitResult($this->player1, $this->match, 'win');
        $this->service->submitResult($this->player2, $this->match, 'win');

        $this->assertDatabaseHas('disputes', [
            'match_id' => $this->match->id,
            'status'   => 'ouvert',
        ]);

        $this->assertEquals('litige', $this->match->fresh()->status);
    }

    public function test_litige_ouvert_si_les_deux_declarent_defaite(): void
    {
        $this->service->submitResult($this->player1, $this->match, 'loss');
        $this->service->submitResult($this->player2, $this->match, 'loss');

        $this->assertDatabaseHas('disputes', [
            'match_id' => $this->match->id,
            'status'   => 'ouvert',
        ]);
    }

    public function test_evenement_match_termine_est_fire(): void
    {
        $this->service->submitResult($this->player1, $this->match, 'win');
        $this->service->submitResult($this->player2, $this->match, 'loss');

        Event::assertDispatched(MatchTermine::class);
    }

    public function test_exception_si_joueur_non_participant_soumet_resultat(): void
    {
        $intrus = User::factory()->create(['username' => 'intrus']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Tu ne participes pas à ce match.');

        $this->service->submitResult($intrus, $this->match, 'win');
    }

    public function test_exception_si_double_soumission(): void
    {
        $this->service->submitResult($this->player1, $this->match, 'win');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Tu as déjà soumis un résultat pour ce match.');

        $this->service->submitResult($this->player1, $this->match, 'win');
    }

    public function test_commission_enregistree_en_transaction(): void
    {
        $this->service->submitResult($this->player1, $this->match, 'win');
        $this->service->submitResult($this->player2, $this->match, 'loss');

        // Commission = 10 RB (5% de 200)
        $this->assertDatabaseHas('transactions', [
            'user_id'   => $this->player1->id,
            'type'      => 'match_perte',
            'amount_rb' => 10,
        ]);
    }
}
