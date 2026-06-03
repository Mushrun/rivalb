<?php

namespace Tests\Feature;

use App\Models\Challenge;
use App\Models\GameMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MatchResultTest extends TestCase
{
    use RefreshDatabase;

    private User $player1;
    private User $player2;
    private GameMatch $match;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Queue::fake();
        Event::fake();

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
            'status'       => 'en_cours',
        ]);
    }

    private function submitResult(User $user, string $result): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($user)->post("/match/{$this->match->id}/result", [
            'claimed_result' => $result,
            'screenshot'     => UploadedFile::fake()->image('screen.jpg'),
        ]);
    }

    public function test_soumission_resultat_win_enregistre_en_base(): void
    {
        $this->submitResult($this->player1, 'win');

        $this->assertDatabaseHas('match_results', [
            'match_id'       => $this->match->id,
            'player_id'      => $this->player1->id,
            'claimed_result' => 'win',
        ]);
    }

    public function test_soumission_resultat_cree_message_dans_le_chat(): void
    {
        $this->submitResult($this->player1, 'win');

        $this->assertDatabaseHas('messages', [
            'match_id'  => $this->match->id,
            'sender_id' => $this->player1->id,
            'type'      => 'result',
        ]);
    }

    public function test_resultats_coherents_terminent_le_match(): void
    {
        $this->submitResult($this->player1, 'win');
        $this->submitResult($this->player2, 'loss');

        $this->assertEquals('termine', $this->match->fresh()->status);
        $this->assertEquals($this->player1->id, $this->match->fresh()->winner_id);
    }

    public function test_gagnant_recoit_190_rb_sur_mise_de_100(): void
    {
        $this->submitResult($this->player1, 'win');
        $this->submitResult($this->player2, 'loss');

        // 100 × 2 = 200, 5% commission = 10, prize = 190
        $this->assertEquals(190, $this->player1->fresh()->balance_rb);
    }

    public function test_double_soumission_est_refusee(): void
    {
        $this->submitResult($this->player1, 'win');

        $response = $this->actingAs($this->player1)->post("/match/{$this->match->id}/result", [
            'claimed_result' => 'win',
            'screenshot'     => UploadedFile::fake()->image('screen2.jpg'),
        ]);

        // L'exception RuntimeException du service doit être traitée comme erreur
        $response->assertStatus(500);
        $this->assertDatabaseCount('match_results', 1);
    }

    public function test_soumission_sans_screenshot_est_refusee(): void
    {
        $response = $this->actingAs($this->player1)->post("/match/{$this->match->id}/result", [
            'claimed_result' => 'win',
        ]);

        $response->assertSessionHasErrors('screenshot');
        $this->assertDatabaseCount('match_results', 0);
    }

    public function test_claimed_result_invalide_est_refuse(): void
    {
        $response = $this->actingAs($this->player1)->post("/match/{$this->match->id}/result", [
            'claimed_result' => 'nul',
            'screenshot'     => UploadedFile::fake()->image('screen.jpg'),
        ]);

        $response->assertSessionHasErrors('claimed_result');
    }

    public function test_non_participant_ne_peut_pas_soumettre(): void
    {
        $intrus = User::factory()->create(['username' => 'intrus']);

        $response = $this->actingAs($intrus)->post("/match/{$this->match->id}/result", [
            'claimed_result' => 'win',
            'screenshot'     => UploadedFile::fake()->image('screen.jpg'),
        ]);

        $response->assertStatus(500);
        $this->assertDatabaseCount('match_results', 0);
    }

    public function test_les_deux_declarent_victoire_ouvre_un_litige(): void
    {
        $this->submitResult($this->player1, 'win');
        $this->submitResult($this->player2, 'win');

        $this->assertDatabaseHas('disputes', [
            'match_id' => $this->match->id,
            'status'   => 'ouvert',
        ]);

        $this->assertEquals('litige', $this->match->fresh()->status);
    }

    public function test_route_protegee_pour_non_connecte(): void
    {
        $response = $this->post("/match/{$this->match->id}/result", [
            'claimed_result' => 'win',
            'screenshot'     => UploadedFile::fake()->image('screen.jpg'),
        ]);

        $response->assertRedirect('/login');
    }
}
