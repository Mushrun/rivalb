<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepositTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'username'   => 'joueur',
            'balance_rb' => 1000,
        ]);
    }

    private function validHash(): string
    {
        return '0x' . str_repeat('a', 64);
    }

    // ─────────────────────────────────���────────────
    // Page de recharge
    // ──────────────────────────────────────────────

    public function test_page_recharge_accessible_quand_connecte(): void
    {
        $response = $this->actingAs($this->user)->get('/recharge');

        $response->assertStatus(200);
    }

    public function test_page_recharge_redirige_si_non_connecte(): void
    {
        $response = $this->get('/recharge');

        $response->assertRedirect('/login');
    }

    // ──────────────────────────────────────────────
    // Soumission de dépôt
    // ──────────────────────────────────────────────

    public function test_depot_valide_cree_une_transaction_en_attente(): void
    {
        $hash = $this->validHash();

        $response = $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => $hash,
            'amount_rb' => 500,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('transactions', [
            'user_id'   => $this->user->id,
            'type'      => 'depot',
            'amount_rb' => 500,
            'tx_hash'   => $hash,
            'status'    => 'en_attente',
        ]);
    }

    public function test_depot_ne_credite_pas_le_solde_immediatement(): void
    {
        $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => $this->validHash(),
            'amount_rb' => 500,
        ]);

        // Le solde ne change pas avant validation admin
        $this->assertEquals(1000, $this->user->fresh()->balance_rb);
    }

    public function test_depot_montant_inferieur_a_500_refuse(): void
    {
        $response = $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => $this->validHash(),
            'amount_rb' => 499,
        ]);

        $response->assertSessionHasErrors('amount_rb');
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_depot_montant_zero_refuse(): void
    {
        $response = $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => $this->validHash(),
            'amount_rb' => 0,
        ]);

        $response->assertSessionHasErrors('amount_rb');
    }

    public function test_depot_hash_invalide_refuse(): void
    {
        $response = $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => 'pas_un_hash',
            'amount_rb' => 500,
        ]);

        $response->assertSessionHasErrors('tx_hash');
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_depot_hash_sans_prefixe_0x_refuse(): void
    {
        $response = $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => str_repeat('a', 66), // 66 chars sans 0x
            'amount_rb' => 500,
        ]);

        $response->assertSessionHasErrors('tx_hash');
    }

    public function test_depot_hash_deja_utilise_refuse(): void
    {
        $hash = $this->validHash();

        $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => $hash,
            'amount_rb' => 500,
        ]);

        $response = $this->actingAs($this->user)->post('/recharge', [
            'tx_hash'   => $hash,
            'amount_rb' => 500,
        ]);

        $response->assertSessionHasErrors('tx_hash');
        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_depot_sans_hash_refuse(): void
    {
        $response = $this->actingAs($this->user)->post('/recharge', [
            'amount_rb' => 500,
        ]);

        $response->assertSessionHasErrors('tx_hash');
    }

    public function test_depot_non_connecte_redirige(): void
    {
        $response = $this->post('/recharge', [
            'tx_hash'   => $this->validHash(),
            'amount_rb' => 500,
        ]);

        $response->assertRedirect('/login');
    }
}
