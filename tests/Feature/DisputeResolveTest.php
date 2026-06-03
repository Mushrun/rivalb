<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Challenge;
use App\Models\Dispute;
use App\Models\GameMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DisputeResolveTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;
    private User $player1;
    private User $player2;
    private GameMatch $match;
    private Dispute $dispute;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = Admin::create([
            'name'      => 'Admin Test',
            'email'     => 'admin@rivalbet.com',
            'password'  => Hash::make('admin123'),
            'role'      => 'super_admin',
            'is_active' => true,
        ]);

        $this->player1 = User::factory()->create([
            'username'   => 'joueur1',
            'balance_rb' => 0,
        ]);

        $this->player2 = User::factory()->create([
            'username'   => 'joueur2',
            'balance_rb' => 0,
        ]);

        $challenge = Challenge::create([
            'creator_id' => $this->player1->id,
            'type'       => '1v1',
            'game'       => 'FIFA',
            'bet_amount' => 100,
            'status'     => 'en_cours',
            'visibility' => 'public',
        ]);

        $this->match = GameMatch::create([
            'challenge_id' => $challenge->id,
            'player1_id'   => $this->player1->id,
            'player2_id'   => $this->player2->id,
            'status'       => 'litige',
        ]);

        $this->dispute = Dispute::create([
            'match_id'  => $this->match->id,
            'opened_by' => $this->player1->id,
            'status'    => 'ouvert',
        ]);
    }

    // ──────────────────────────────────────────────
    // Résolution par l'admin
    // ──────────────────────────────────────────────

    public function test_admin_resout_en_faveur_de_player1(): void
    {
        $response = $this->actingAs($this->admin, 'admin')
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'winner_id' => $this->player1->id,
                'note'      => 'Player1 a fourni la preuve.',
            ]);

        $response->assertRedirect();

        $this->assertEquals(200, $this->player1->fresh()->balance_rb);
        $this->assertEquals(0,   $this->player2->fresh()->balance_rb);

        $this->assertDatabaseHas('disputes', [
            'id'                 => $this->dispute->id,
            'status'             => 'resolu',
            'decision_player_id' => $this->player1->id,
        ]);
    }

    public function test_admin_resout_en_faveur_de_player2(): void
    {
        $this->actingAs($this->admin, 'admin')
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'winner_id' => $this->player2->id,
            ]);

        $this->assertEquals(0,   $this->player1->fresh()->balance_rb);
        $this->assertEquals(200, $this->player2->fresh()->balance_rb);

        $this->assertEquals($this->player2->id, $this->match->fresh()->winner_id);
    }

    public function test_resolution_termine_le_match(): void
    {
        $this->actingAs($this->admin, 'admin')
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'winner_id' => $this->player1->id,
            ]);

        $match = $this->match->fresh();
        $this->assertEquals('termine', $match->status);
        $this->assertNotNull($match->ended_at);
    }

    public function test_resolution_cree_message_systeme(): void
    {
        $this->actingAs($this->admin, 'admin')
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'winner_id' => $this->player1->id,
                'note'      => 'Preuves vérifiées.',
            ]);

        $this->assertDatabaseHas('messages', [
            'match_id' => $this->match->id,
            'type'     => 'system',
        ]);
    }

    public function test_admin_peut_annuler_et_rembourser(): void
    {
        $this->actingAs($this->admin, 'admin')
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'cancel' => true,
            ]);

        $this->assertEquals(100, $this->player1->fresh()->balance_rb);
        $this->assertEquals(100, $this->player2->fresh()->balance_rb);

        $this->assertEquals('annule', $this->match->fresh()->status);
        $this->assertEquals('annule', $this->dispute->fresh()->status);
    }

    public function test_double_resolution_retourne_erreur(): void
    {
        $this->actingAs($this->admin, 'admin')
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'winner_id' => $this->player1->id,
            ]);

        $response = $this->actingAs($this->admin, 'admin')
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'winner_id' => $this->player2->id,
            ]);

        $response->assertSessionHasErrors('dispute');
        // player2 ne reçoit rien, player1 reste gagnant
        $this->assertEquals(0, $this->player2->fresh()->balance_rb);
    }

    // ──────────────────────────────────────────────
    // Protection de la route
    // ──────────────────────────────────────────────

    public function test_utilisateur_normal_ne_peut_pas_resoudre(): void
    {
        $response = $this->actingAs($this->player1)
            ->post("/admin/litiges/{$this->dispute->id}/resolve", [
                'winner_id' => $this->player1->id,
            ]);

        // Redirigé vers login admin (guard:admin)
        $response->assertRedirect();
        $this->assertDatabaseHas('disputes', [
            'id'     => $this->dispute->id,
            'status' => 'ouvert',
        ]);
    }

    public function test_non_connecte_ne_peut_pas_resoudre(): void
    {
        $response = $this->post("/admin/litiges/{$this->dispute->id}/resolve", [
            'winner_id' => $this->player1->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('disputes', [
            'id'     => $this->dispute->id,
            'status' => 'ouvert',
        ]);
    }
}
