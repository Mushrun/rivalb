<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'player', 'guard_name' => 'web']);
    }

    private function makeUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'username' => 'testuser',
            'password' => Hash::make('password123'),
        ], $overrides));
    }

    // ──────────────────────────────────────────────
    // Login
    // ──────────────────────────────────────────────

    public function test_login_valide_redirige_vers_battle(): void
    {
        $user = $this->makeUser();

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect('/battle');
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_mauvais_mot_de_passe_retourne_erreur(): void
    {
        $user = $this->makeUser();

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'mauvais',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_login_email_inexistant_retourne_erreur(): void
    {
        $response = $this->post('/login', [
            'email'    => 'inconnu@test.com',
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_login_compte_banni_refuse(): void
    {
        $user = $this->makeUser(['status' => 'banni']);

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_login_compte_suspendu_refuse(): void
    {
        $user = $this->makeUser(['status' => 'suspendu']);

        $response = $this->post('/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    // ──────────────────────────────────────────────
    // Inscription
    // ──────────────────────────────────────────────

    public function test_inscription_valide_cree_utilisateur(): void
    {
        Queue::fake();

        $response = $this->post('/register', [
            'username'              => 'nouveauJoueur',
            'email'                 => 'nouveau@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/battle');
        $this->assertDatabaseHas('users', [
            'username' => 'nouveauJoueur',
            'email'    => 'nouveau@test.com',
        ]);
        $this->assertAuthenticated();
    }

    public function test_inscription_email_deja_utilise_retourne_erreur(): void
    {
        $this->makeUser(['email' => 'pris@test.com']);

        $response = $this->post('/register', [
            'username'              => 'autrejoueur',
            'email'                 => 'pris@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_inscription_username_deja_utilise_retourne_erreur(): void
    {
        $this->makeUser(['username' => 'pris']);

        $response = $this->post('/register', [
            'username'              => 'pris',
            'email'                 => 'neuf@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('username');
    }

    public function test_inscription_mot_de_passe_trop_court_retourne_erreur(): void
    {
        $response = $this->post('/register', [
            'username'              => 'joueur',
            'email'                 => 'joueur@test.com',
            'password'              => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_logout_deconnecte_et_redirige(): void
    {
        $user = $this->makeUser();
        $this->actingAs($user);

        $response = $this->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }
}
