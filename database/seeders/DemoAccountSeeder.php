<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\Building;
use App\Models\Charge;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Floor;
use App\Models\Item;
use App\Models\ItemClaim;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\Ticket;
use App\Models\Ticket_message;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoAccountSeeder extends Seeder
{
    public const PASSWORD = 'Demo@2026';
    public const SYNDIC_EMAIL = 'demo@syndicare.ma';
    public const COOWNER_EMAIL = 'copro.demo@syndicare.ma';
    public const TENANT_EMAIL = 'locataire.demo@syndicare.ma';

    private const ORGANIZATION_SLUG = 'syndicare-demo';

    public function run(): void
    {
        fake()->seed(20260714);
        fake()->unique(true);

        DB::transaction(function (): void {
            $organization = Organization::query()
                ->where('slug', self::ORGANIZATION_SLUG)
                ->first();

            if ($organization) {
                $this->resetOrganization($organization);
            }

            $organization = Organization::query()->updateOrCreate(
                ['slug' => self::ORGANIZATION_SLUG],
                [
                    'name' => 'SyndiCare Demo Publique',
                    'email' => self::SYNDIC_EMAIL,
                    'phone' => '0600000000',
                    'plan' => 'pro',
                    'subscription_status' => 'active',
                    'subscription_started_at' => now()->subMonth(),
                    'subscription_ends_at' => now()->addYear(),
                    'billing_cycle' => 'monthly',
                    'subscription_price' => 216,
                ]
            );

            $syndic = $this->createUser(
                $organization,
                'SyndiCare Demo',
                self::SYNDIC_EMAIL,
                'Syndic',
                '0600000001',
                'MA6400210000000000000000001'
            );

            $publicCoOwner = $this->createUser(
                $organization,
                'Amina Benali',
                self::COOWNER_EMAIL,
                'Coproprietaire',
                '0600000002'
            );

            $publicTenant = $this->createUser(
                $organization,
                'Youssef El Amrani',
                self::TENANT_EMAIL,
                'Locataire',
                '0600000003'
            );

            $coOwners = collect([$publicCoOwner])->merge(
                collect([
                    ['Nadia Berrada', 'nadia.demo@syndicare.ma', '0600000010'],
                    ['Karim Idrissi', 'karim.demo@syndicare.ma', '0600000011'],
                    ['Meryem Alaoui', 'meryem.demo@syndicare.ma', '0600000012'],
                    ['Omar Fassi', 'omar.demo@syndicare.ma', '0600000013'],
                    ['Leila Tazi', 'leila.demo@syndicare.ma', '0600000014'],
                    ['Samir Bennani', 'samir.demo@syndicare.ma', '0600000015'],
                ])->map(fn (array $user) => $this->createUser(
                    $organization,
                    $user[0],
                    $user[1],
                    'Coproprietaire',
                    $user[2]
                ))
            )->values();

            $tenants = collect([$publicTenant])->merge(
                collect([
                    ['Salma Idrissi', 'salma.demo@syndicare.ma', '0600000020'],
                    ['Mehdi Lahlou', 'mehdi.demo@syndicare.ma', '0600000021'],
                    ['Imane Chraibi', 'imane.demo@syndicare.ma', '0600000022'],
                    ['Rania Mansouri', 'rania.demo@syndicare.ma', '0600000023'],
                    ['Hicham Naciri', 'hicham.demo@syndicare.ma', '0600000024'],
                    ['Sofia El Fassi', 'sofia.demo@syndicare.ma', '0600000025'],
                    ['Ayoub Hilali', 'ayoub.demo@syndicare.ma', '0600000026'],
                    ['Nora Skalli', 'nora.demo@syndicare.ma', '0600000027'],
                ])->map(fn (array $user) => $this->createUser(
                    $organization,
                    $user[0],
                    $user[1],
                    'Locataire',
                    $user[2]
                ))
            )->values();

            $assignableUsers = collect([$publicCoOwner, $publicTenant])
                ->merge($coOwners->reject(fn (User $user) => $user->is($publicCoOwner)))
                ->merge($tenants->reject(fn (User $user) => $user->is($publicTenant)))
                ->values();

            [$buildings, $apartments, $apartmentsByBuilding] = $this->createBuildings(
                $organization,
                $assignableUsers
            );

            $this->createFinancialData($organization, $apartments, $apartmentsByBuilding);
            $this->createAnnouncements($organization, $syndic, $buildings);
            $this->createDocuments($organization, $syndic, $buildings, $apartments);
            $this->createTickets($organization, $syndic, $apartments);
            $this->createNotifications($organization, collect([$syndic])->merge($assignableUsers));
            $this->createItems($organization, $apartments, $assignableUsers);
            $this->createAuditLogs($organization, $syndic);
        });
    }

    private function resetOrganization(Organization $organization): void
    {
        $organizationId = $organization->id;
        $userIds = User::withoutGlobalScopes()
            ->where('organization_id', $organizationId)
            ->pluck('id');
        $itemIds = Item::withoutGlobalScopes()
            ->where('organization_id', $organizationId)
            ->pluck('id');

        if ($itemIds->isNotEmpty()) {
            ItemClaim::query()->whereIn('item_id', $itemIds)->delete();
        }

        if ($userIds->isNotEmpty()) {
            UserInvitation::query()
                ->whereIn('user_id', $userIds)
                ->orWhereIn('created_by', $userIds)
                ->delete();
        }

        foreach ([
            Ticket_message::class,
            Ticket::class,
            Receipt::class,
            Payment::class,
            Charge::class,
            Expense::class,
            Document::class,
            Announcement::class,
            Notification::class,
            Audit_log::class,
            Item::class,
            Apartment::class,
            Floor::class,
            Building::class,
            User::class,
        ] as $model) {
            $model::withoutGlobalScopes()
                ->where('organization_id', $organizationId)
                ->delete();
        }
    }

    private function createUser(
        Organization $organization,
        string $name,
        string $email,
        string $role,
        string $phone,
        ?string $rib = null
    ): User {
        return User::factory()->create([
            'organization_id' => $organization->id,
            'name' => $name,
            'email' => $email,
            'phone_number' => $phone,
            'payment_rib' => $rib,
            'role' => $role,
            'email_verified_at' => now(),
            'password' => Hash::make(self::PASSWORD),
        ]);
    }

    private function createBuildings(Organization $organization, $assignableUsers): array
    {
        $buildingRows = [
            ['Residence Atlas Garden', '12 Boulevard Abdelmoumen, Casablanca', 'AT'],
            ['Residence Les Orangers', '8 Rue Socrate, Rabat', 'OR'],
            ['Immeuble Nour', '24 Avenue Moulay Ismail, Tanger', 'NR'],
        ];
        $floorLabels = ['RDC', '1', '2'];
        $areas = [54, 68, 72, 81, 93, 105, 118, 126];
        $buildings = collect();
        $apartments = collect();
        $apartmentsByBuilding = [];
        $apartmentCounter = 0;

        foreach ($buildingRows as $buildingRow) {
            [$name, $address, $prefix] = $buildingRow;

            $building = Building::query()->create([
                'organization_id' => $organization->id,
                'name' => $name,
                'address' => $address,
            ]);
            $buildings->push($building);
            $apartmentsByBuilding[$building->id] = collect();

            foreach ($floorLabels as $floorIndex => $floorLabel) {
                $floor = Floor::query()->create([
                    'organization_id' => $organization->id,
                    'number' => $prefix.'-'.$floorLabel,
                    'building_id' => $building->id,
                ]);

                foreach (range(1, 4) as $unitIndex) {
                    $occupant = ($apartmentCounter > 5 && $apartmentCounter % 9 === 0)
                        ? null
                        : $assignableUsers[$apartmentCounter % $assignableUsers->count()];

                    $apartment = Apartment::query()->create([
                        'organization_id' => $organization->id,
                        'number' => sprintf('%s-%d%02d', $prefix, $floorIndex, $unitIndex),
                        'floor_id' => $floor->id,
                        'user_id' => $occupant?->id,
                        'area' => $areas[$apartmentCounter % count($areas)],
                    ]);

                    $apartments->push($apartment);
                    $apartmentsByBuilding[$building->id]->push($apartment);
                    $apartmentCounter++;
                }
            }
        }

        return [$buildings, $apartments, $apartmentsByBuilding];
    }

    private function createFinancialData(Organization $organization, $apartments, array $apartmentsByBuilding): void
    {
        $chargeTemplates = [
            ['Entretien mensuel', 280],
            ['Fonds de reserve', 120],
            ['Nettoyage et securite', 240],
            ['Maintenance ascenseur', 170],
        ];
        $methods = ['virement', 'cashplus', 'especes'];

        foreach ($apartments as $apartmentIndex => $apartment) {
            foreach ($chargeTemplates as $monthOffset => [$description, $baseAmount]) {
                $date = now()
                    ->startOfMonth()
                    ->subMonthsNoOverflow($monthOffset)
                    ->addDays(4);
                $statusSeed = ($apartmentIndex + $monthOffset) % 5;
                $status = match ($statusSeed) {
                    0, 3 => 'paid',
                    1 => 'overdue',
                    default => 'pending',
                };
                $amount = round($baseAmount + ((float) $apartment->area * 1.35) + (($apartmentIndex % 4) * 25), 2);

                $charge = Charge::query()->create([
                    'organization_id' => $organization->id,
                    'description' => $description.' - '.$date->format('m/Y'),
                    'amount' => $amount,
                    'date' => $date->toDateString(),
                    'apartment_id' => $apartment->id,
                    'status' => $status,
                ]);

                if ($status === 'paid' || $statusSeed === 4) {
                    $isValidated = $status === 'paid';
                    $payment = Payment::query()->create([
                        'organization_id' => $organization->id,
                        'amount' => $amount,
                        'charge_id' => $charge->id,
                        'user_id' => $apartment->user_id,
                        'status' => $isValidated ? 'validated' : 'pending',
                        'payment_date' => $isValidated
                            ? $date->copy()->addDays(6)->toDateString()
                            : now()->subDays(($apartmentIndex % 5) + 1)->toDateString(),
                        'method' => $methods[$apartmentIndex % count($methods)],
                        'payment_proof' => 'payment-proofs/demo-payment-'.$charge->id.'.pdf',
                    ]);

                    if ($isValidated && $apartmentIndex % 4 !== 1) {
                        Receipt::query()->create([
                            'organization_id' => $organization->id,
                            'payment_id' => $payment->id,
                            'file_path' => 'receipts/demo-receipt-'.$payment->id.'.pdf',
                        ]);
                    }
                }
            }
        }

        $expenseTemplates = [
            ['Nettoyage parties communes', 'Contrat mensuel de nettoyage', 1850],
            ['Maintenance ascenseur', 'Intervention preventive et controle technique', 3200],
            ['Electricite des communs', 'Facture mensuelle des parties communes', 1450],
            ['Jardinage', 'Entretien des espaces verts', 950],
            ['Gardiennage', 'Service de surveillance et accueil', 4100],
        ];

        foreach ($apartmentsByBuilding as $buildingId => $buildingApartments) {
            foreach ($expenseTemplates as $index => [$title, $description, $amount]) {
                Expense::query()->create([
                    'organization_id' => $organization->id,
                    'title' => $title,
                    'description' => $description,
                    'amount' => $amount + (($buildingId % 3) * 180),
                    'date' => now()->startOfMonth()->subMonthsNoOverflow($index)->addDays(8)->toDateString(),
                    'building_id' => $buildingId,
                    'apartment_id' => $index === 1 ? $buildingApartments->first()?->id : null,
                ]);
            }
        }
    }

    private function createAnnouncements(Organization $organization, User $syndic, $buildings): void
    {
        $rows = [
            ['Travaux de peinture du hall', 'Les travaux demarrent lundi matin. Merci de laisser les acces libres.', 'all', $buildings[0]->id],
            ['Assemblee generale ordinaire', 'La prochaine assemblee se tiendra dans le hall principal a 19h00.', 'coproprietaires', null],
            ['Nettoyage du parking', 'Le parking sera nettoye vendredi entre 09h00 et 12h00.', 'locataires', $buildings[1]->id],
            ['Nouvelle note de service', 'Les documents administratifs du trimestre sont disponibles dans votre espace.', 'all', null],
            ['Verification des compteurs', 'Un technicien passera cette semaine pour verifier les compteurs communs.', 'all', $buildings[2]->id],
        ];

        foreach ($rows as [$title, $content, $targetRole, $buildingId]) {
            Announcement::query()->create([
                'organization_id' => $organization->id,
                'title' => $title,
                'content' => $content,
                'target_role' => $targetRole,
                'building_id' => $buildingId,
                'creator_id' => $syndic->id,
            ]);
        }
    }

    private function createDocuments(Organization $organization, User $syndic, $buildings, $apartments): void
    {
        $rows = [
            ['Reglement interieur 2026', 'documents/demo/reglement-interieur.pdf', 'reglement', 'all', null, null, null, null],
            ['Proces-verbal AG', 'documents/demo/proces-verbal-ag.pdf', 'pv', 'role', null, null, null, 'Coproprietaire'],
            ['Contrat nettoyage', 'documents/demo/contrat-nettoyage.pdf', 'contrat', 'building', $buildings[0]->id, [$buildings[0]->id], null, null],
            ['Budget previsionnel', 'documents/demo/budget-previsionnel.pdf', 'finance', 'building', $buildings[1]->id, [$buildings[1]->id, $buildings[2]->id], null, null],
            ['Avis de travaux lot', 'documents/demo/avis-travaux-lot.pdf', 'autre', 'apartment', null, null, $apartments->first()->id, null],
            ['Guide paiement des charges', 'documents/demo/guide-paiement.pdf', 'finance', 'role', null, null, null, 'Locataire'],
        ];

        foreach ($rows as [$title, $path, $category, $targetType, $buildingId, $buildingIds, $apartmentId, $targetRole]) {
            Document::query()->create([
                'organization_id' => $organization->id,
                'title' => $title,
                'file_path' => $path,
                'category' => $category,
                'target_type' => $targetType,
                'building_id' => $buildingId,
                'building_ids' => $buildingIds,
                'apartment_id' => $apartmentId,
                'target_role' => $targetRole,
                'uploaded_by' => $syndic->id,
            ]);
        }
    }

    private function createTickets(Organization $organization, User $syndic, $apartments): void
    {
        $ticketRows = [
            ['Fuite dans le couloir', 'Une fuite apparait pres de la gaine technique.', 'open'],
            ['Ampoule grillee', 'La lumiere du palier ne fonctionne plus.', 'in_progress'],
            ['Porte du parking bloquee', 'La porte reste ouverte apres passage.', 'open'],
            ['Bruit ascenseur', 'Un bruit inhabituel se repete a chaque montee.', 'closed'],
            ['Interphone faible', 'Le son de l interphone est tres bas.', 'in_progress'],
            ['Trace d humidite', 'Une trace apparait au plafond du couloir.', 'open'],
            ['Badge perdu', 'Demande de remplacement de badge parking.', 'closed'],
            ['Nettoyage terrasse', 'La terrasse commune a besoin d un nettoyage.', 'open'],
        ];

        $occupiedApartments = $apartments
            ->filter(fn (Apartment $apartment) => $apartment->user_id)
            ->values();

        foreach ($ticketRows as $index => [$title, $description, $status]) {
            $apartment = $occupiedApartments[$index % $occupiedApartments->count()];
            $ticket = Ticket::query()->create([
                'organization_id' => $organization->id,
                'title' => $title,
                'description' => $description,
                'apartment_id' => $apartment->id,
                'assingned_by' => $apartment->user_id,
                'assigned_to' => $syndic->id,
                'status' => $status,
            ]);

            Ticket_message::query()->create([
                'organization_id' => $organization->id,
                'ticket_id' => $ticket->id,
                'sender_id' => $apartment->user_id,
                'message' => 'Bonjour, pouvez-vous verifier ce point des que possible ?',
            ]);

            Ticket_message::query()->create([
                'organization_id' => $organization->id,
                'ticket_id' => $ticket->id,
                'sender_id' => $syndic->id,
                'message' => $status === 'closed'
                    ? 'Intervention terminee, merci pour votre retour.'
                    : 'Merci, la demande est bien prise en compte.',
            ]);
        }
    }

    private function createNotifications(Organization $organization, $users): void
    {
        foreach ($users as $index => $user) {
            foreach ([
                ['Nouveau document', 'Un document vient d etre ajoute a votre espace.', 'info'],
                ['Paiement a traiter', 'Une preuve de paiement attend une validation.', 'warning'],
            ] as $notificationIndex => [$title, $message, $type]) {
                Notification::query()->create([
                    'organization_id' => $organization->id,
                    'user_id' => $user->id,
                    'title' => $title,
                    'message' => $message,
                    'type' => $type,
                    'is_read' => ($index + $notificationIndex) % 3 === 0,
                ]);
            }
        }
    }

    private function createItems(Organization $organization, $apartments, $users): void
    {
        $rows = [
            ['Cle trouvee', 'Cles trouvees pres de la boite aux lettres.', 'Cles', 'Trouve', 'Hall principal', 'ouvert'],
            ['Telephone perdu', 'Telephone noir signale comme perdu au parking.', 'Telephone', 'Perdue', 'Parking -1', 'en_contact'],
            ['Casque audio', 'Casque retrouve dans l ascenseur.', 'Objet personnel', 'Trouve', 'Ascenseur', 'ouvert'],
            ['Badge resident', 'Badge d acces perdu dimanche soir.', 'Badge', 'Perdue', 'Entree principale', 'resolu'],
            ['Sac de sport', 'Sac bleu oublie pres du local velo.', 'Sac', 'Trouve', 'Local velo', 'ouvert'],
        ];

        foreach ($rows as $index => [$title, $description, $category, $type, $location, $status]) {
            $apartment = $apartments[$index % $apartments->count()];
            $user = $users[$index % $users->count()];
            $item = Item::query()->create([
                'organization_id' => $organization->id,
                'title' => $title,
                'category' => $category,
                'description' => $description,
                'date' => now()->subDays($index + 2)->toDateString(),
                'type' => $type,
                'status' => $status,
                'location' => $location,
                'image_path' => null,
                'user_id' => $user->id,
                'apartment_id' => $apartment->id,
                'resolved_at' => $status === 'resolu' ? now()->subDay() : null,
            ]);

            if ($index < 2) {
                ItemClaim::query()->create([
                    'item_id' => $item->id,
                    'user_id' => $users[($index + 3) % $users->count()]->id,
                    'message' => 'Je pense que cet objet peut etre le mien.',
                    'status' => $index === 0 ? 'pending' : 'accepted',
                ]);
            }
        }
    }

    private function createAuditLogs(Organization $organization, User $syndic): void
    {
        foreach ([
            ['created', 'Creation du compte demo public.'],
            ['created', 'Ajout des immeubles et des lots demo.'],
            ['updated', 'Mise a jour des charges mensuelles demo.'],
            ['reviewed', 'Validation de plusieurs preuves de paiement demo.'],
            ['created', 'Publication des documents administratifs demo.'],
        ] as [$action, $details]) {
            Audit_log::query()->create([
                'organization_id' => $organization->id,
                'action' => $action,
                'details' => $details,
                'performed_by' => $syndic->id,
            ]);
        }
    }
}
