<?php

namespace Tests\Feature;

use App\Mail\UserInvitationMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_invite_a_resident_and_resident_can_activate_account(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['role' => 'Syndic']);

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Resident Invite',
                'email' => 'resident@example.com',
                'phone_number' => '0600000000',
                'role' => 'Locataire',
            ])
            ->assertRedirect(route('users.index'));

        $resident = User::where('email', 'resident@example.com')->firstOrFail();

        $this->assertNull($resident->email_verified_at);
        $this->assertDatabaseHas('user_invitations', [
            'user_id' => $resident->id,
            'accepted_at' => null,
        ]);

        $acceptUrl = null;

        Mail::assertSent(UserInvitationMail::class, function (UserInvitationMail $mail) use (&$acceptUrl) {
            $acceptUrl = $mail->acceptUrl;

            return $mail->hasTo('resident@example.com')
                && $mail->user->email === 'resident@example.com';
        });

        $token = basename((string) parse_url($acceptUrl, PHP_URL_PATH));

        $this->post(route('logout'))->assertRedirect('/');

        $this->post(route('invitations.store', $token), [
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ])->assertRedirect(route('dashboard', absolute: false));

        $resident->refresh();

        $this->assertAuthenticatedAs($resident);
        $this->assertTrue(Hash::check('SecurePass123', $resident->password));
        $this->assertNotNull($resident->email_verified_at);
        $this->assertNotNull($resident->latestInvitation->accepted_at);
    }
}
