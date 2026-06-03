<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\ShadowCoinService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShadowCoinServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShadowCoinService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ShadowCoinService();
    }

    private function makeUser(int $balance = 0): User
    {
        return User::factory()->create([
            'username'   => fake()->unique()->userName(),
            'balance_rb' => $balance,
        ]);
    }

    public function test_credit_ajoute_le_solde(): void
    {
        $user = $this->makeUser(100);

        $this->service->credit($user, 50, 'depot');

        $this->assertEquals(150, $user->fresh()->balance_rb);
    }

    public function test_credit_cree_une_transaction(): void
    {
        $user = $this->makeUser(0);

        $tx = $this->service->credit($user, 200, 'match_gain');

        $this->assertEquals(200, $tx->amount_rb);
        $this->assertEquals('match_gain', $tx->type);
        $this->assertEquals('valide', $tx->status);
        $this->assertDatabaseHas('transactions', [
            'user_id'   => $user->id,
            'type'      => 'match_gain',
            'amount_rb' => 200,
        ]);
    }

    public function test_debit_reduit_le_solde(): void
    {
        $user = $this->makeUser(300);

        $this->service->debit($user, 100, 'match_perte');

        $this->assertEquals(200, $user->fresh()->balance_rb);
    }

    public function test_debit_cree_une_transaction(): void
    {
        $user = $this->makeUser(500);

        $tx = $this->service->debit($user, 150, 'retrait');

        $this->assertEquals(150, $tx->amount_rb);
        $this->assertDatabaseHas('transactions', [
            'user_id'   => $user->id,
            'type'      => 'retrait',
            'amount_rb' => 150,
        ]);
    }

    public function test_debit_leve_exception_si_solde_insuffisant(): void
    {
        $user = $this->makeUser(50);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Solde insuffisant.');

        $this->service->debit($user, 100, 'match_perte');
    }

    public function test_debit_ne_modifie_pas_le_solde_si_insuffisant(): void
    {
        $user = $this->makeUser(50);

        try {
            $this->service->debit($user, 100, 'match_perte');
        } catch (\RuntimeException) {}

        $this->assertEquals(50, $user->fresh()->balance_rb);
    }

    public function test_has_enough_retourne_true_si_solde_suffisant(): void
    {
        $user = $this->makeUser(500);

        $this->assertTrue($this->service->hasEnough($user, 500));
        $this->assertTrue($this->service->hasEnough($user, 499));
    }

    public function test_has_enough_retourne_false_si_solde_insuffisant(): void
    {
        $user = $this->makeUser(50);

        $this->assertFalse($this->service->hasEnough($user, 51));
    }

    public function test_transfer_deplace_le_solde_entre_deux_users(): void
    {
        $from = $this->makeUser(200);
        $to   = $this->makeUser(0);

        $this->service->transfer($from, $to, 200, 'remboursement');

        $this->assertEquals(0, $from->fresh()->balance_rb);
        $this->assertEquals(200, $to->fresh()->balance_rb);
    }
}
