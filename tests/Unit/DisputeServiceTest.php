<?php

namespace Tests\Unit;

use App\Models\Challenge;
use App\Models\Dispute;
use App\Models\GameMatch;
use App\Models\User;
use App\Services\DisputeService;
use App\Services\NotificationService;
use App\Services\ShadowCoinService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DisputeServiceTest extends TestCase
{
    use RefreshDatabase;

    private DisputeService $service;
    private User $player1;
    private User $player2;
    private Challenge $challenge;
    private GameMatch $match;

    protected function setUp(): void
    {
        parent::setUp();

        $notifService = $this->createMock(NotificationService::class);
        $coinService  = new ShadowCoinService();

        $this->service = new DisputeService($coinService, $notifService);

        $this->player1 = User::factory()->create([
            'username'          => 'joueur1',
            'balance_rb'        => 0,
            'reliability_score' => 100,
        ]);

        $this->player2 = User::factory()->create([
            'username'          => 'joueur2',
            'balance_rb'        => 0,
            'reliability_score' => 100,
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

    private function openDispute(): Dispute
    {
        return $this->service->open($this->player1, $this->match);
    }

    public function test_open_cree_un_litige(): void
    {
        $dispute = $this->openDispute();

        $this->assertDatabaseHas('disputes', [
            'match_id'  => $this->match->id,
            'opened_by' => $this->player1->id,
            'status'    => 'ouvert',
        ]);

        $this->assertEquals('ouvert', $dispute->status);
    }

    public function test_open_passe_le_match_en_litige(): void
    {
        $this->openDispute();

        $this->assertEquals('litige', $this->match->fresh()->status);
    }

    public function test_open_cree_un_message_systeme(): void
    {
        $this->openDispute();

        $this->assertDatabaseHas('messages', [
            'match_id' => $this->match->id,
            'type'     => 'system',
        ]);
    }

    public function test_open_refuse_si_joueur_non_participant(): void
    {
        $intrus = User::factory()->create(['username' => 'intrus']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Tu ne participes pas à ce match.');

        $this->service->open($intrus, $this->match);
    }

    public function test_open_refuse_si_litige_deja_ouvert(): void
    {
        $this->openDispute();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Un litige est déjà ouvert pour ce match.');

        $this->openDispute();
    }

    public function test_resolve_en_faveur_de_player1(): void
    {
        $dispute = $this->openDispute();

        $this->service->resolve($dispute, $this->player1->id, 'Player1 a fourni la preuve.');

        // player1 reçoit 200 RB (100 × 2, sans commission pour litige)
        $this->assertEquals(200, $this->player1->fresh()->balance_rb);
        $this->assertEquals(0,   $this->player2->fresh()->balance_rb);
    }

    public function test_resolve_en_faveur_de_player2(): void
    {
        $dispute = $this->openDispute();

        $this->service->resolve($dispute, $this->player2->id);

        $this->assertEquals(0,   $this->player1->fresh()->balance_rb);
        $this->assertEquals(200, $this->player2->fresh()->balance_rb);
    }

    public function test_resolve_passe_le_match_en_termine(): void
    {
        $dispute = $this->openDispute();

        $this->service->resolve($dispute, $this->player1->id);

        $match = $this->match->fresh();
        $this->assertEquals('termine',       $match->status);
        $this->assertEquals($this->player1->id, $match->winner_id);
    }

    public function test_resolve_met_a_jour_le_litige(): void
    {
        $dispute = $this->openDispute();

        $this->service->resolve($dispute, $this->player1->id, 'Admin note');

        $d = $dispute->fresh();
        $this->assertEquals('resolu',           $d->status);
        $this->assertEquals($this->player1->id, $d->decision_player_id);
        $this->assertEquals('Admin note',       $d->admin_note);
        $this->assertNotNull($d->resolved_at);
    }

    public function test_resolve_diminue_fiabilite_du_perdant(): void
    {
        $dispute = $this->openDispute();

        $this->service->resolve($dispute, $this->player1->id);

        // Perdant perd 5 points de fiabilité
        $this->assertEquals(95, $this->player2->fresh()->reliability_score);
        // Gagnant gagne 2 points
        $this->assertEquals(100, $this->player1->fresh()->reliability_score); // était 100, +2 = min(100,102)
    }

    public function test_cancel_rembourse_les_deux_joueurs(): void
    {
        $dispute = $this->openDispute();

        $this->service->cancelMatch($dispute);

        $this->assertEquals(100, $this->player1->fresh()->balance_rb);
        $this->assertEquals(100, $this->player2->fresh()->balance_rb);
    }

    public function test_cancel_annule_le_match(): void
    {
        $dispute = $this->openDispute();

        $this->service->cancelMatch($dispute);

        $this->assertEquals('annule', $this->match->fresh()->status);
        $this->assertEquals('annule', $dispute->fresh()->status);
    }
}
