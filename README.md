# SyndiCare

SyndiCare is a web platform for managing a copropriete. It connects the property
manager, co-owners, and tenants in one shared workspace so building operations,
financial follow-up, documents, announcements, and resident requests are no
longer scattered across Excel files, WhatsApp messages, paper receipts, and
manual reminders.

The application is built as a multi-tenant Laravel and React project. Each
organization has its own users, buildings, lots, charges, payments, documents,
tickets, and notifications.

## Main Features

- Public landing page with pricing estimate, product presentation, blog content,
  and French/Arabic language support.
- Authentication, registration, password reset, email verification, profile
  management, and invitation-based onboarding for residents.
- Role-based access for `SuperAdmin`, `Syndic`, `Coproprietaire`, and
  `Locataire`.
- Organization and subscription management for platform administrators.
- Syndic dashboard with global and per-building statistics.
- Resident dashboards for coproprietaires and locataires.
- Building, floor, and lot management with occupancy assignment.
- User management with invitation resend and invitation status tracking.
- Charges management, monthly charge preview, and monthly charge generation.
- Expense tracking by building and optionally by lot.
- Payment submission with method, proof file, validation workflow, and receipts.
- Targeted document sharing by all users, building, lot, or role.
- Announcements targeted by building and resident type, with real-time broadcast
  support.
- Ticket/reclamation management with message history between residents and the
  syndic.
- Lost and found module with item claims and status tracking.
- Notification center with read/unread handling.
- Audit logs for important syndic actions.
- Resettable public demo account with realistic fake data.

## Technologies

- Backend: Laravel 13, PHP 8.3+, Eloquent ORM, Laravel policies, middleware,
  queues, mail, broadcasting, and migrations.
- Frontend: React 18, Inertia.js, Vite, Tailwind CSS, Ziggy routes.
- Realtime: Laravel Echo with Reverb-compatible configuration.
- Database: MySQL in local/production, SQLite in automated tests.
- Testing: PHPUnit feature tests and unit tests.
- Tooling: Composer, npm, Vite production build, Docker/nginx-php-fpm support.

## User Roles

- `SuperAdmin`: manages organizations and subscription status.
- `Syndic`: manages the copropriete, residents, lots, charges, payments,
  documents, announcements, tickets, notifications, expenses, and audit logs.
- `Coproprietaire`: follows owned lots, charges, payments, documents,
  announcements, and tickets.
- `Locataire`: follows assigned lots, announcements, and tickets.

## Problems Addressed

Many syndic operations are still handled manually: residents ask questions in
different channels, payment proofs are hard to verify, building documents are
shared with the wrong people, and monthly charges are repetitive to prepare.
This creates delays, missing information, and weak visibility for both the
syndic and residents.

SyndiCare solves this by centralizing the workflow:

- Multi-tenant data keeps each organization isolated.
- Role-based dashboards show each user only the information they need.
- Charge generation reduces repetitive monthly work.
- Payment validation and receipts make the financial follow-up easier to audit.
- Document and announcement targeting avoids oversharing.
- Tickets keep resident requests traceable from creation to resolution.
- Audit logs preserve a history of important actions.
- Demo seeding makes the deployed project easy to test without manual setup.

## Demo Accounts

The demo tenant can be created or refreshed with:

```bash
php artisan db:seed --class=DemoAccountSeeder --force
```

Public demo credentials:

```txt
Syndic: demo@syndicare.ma
Coproprietaire: copro.demo@syndicare.ma
Locataire: locataire.demo@syndicare.ma
Password: Demo@2026
```

The demo seeder only resets the demo organization identified by the
`syndicare-demo` slug. It does not wipe other organizations.

## Local Installation

1. Install PHP dependencies:

```bash
composer install
```

2. Install JavaScript dependencies:

```bash
npm install
```

3. Create and configure the environment file:

```bash
cp .env.example .env
php artisan key:generate
```

4. Configure database variables in `.env`, then run migrations:

```bash
php artisan migrate
```

5. Seed the public demo account:

```bash
php artisan db:seed --class=DemoAccountSeeder
```

6. Build or run frontend assets:

```bash
npm run dev
```

For a production asset build:

```bash
npm run build
```

7. Start Laravel locally:

```bash
php artisan serve
```

## Testing

Run the automated test suite:

```bash
php artisan test
```

The test environment uses SQLite in memory, as configured in `phpunit.xml`.

## Deployment Notes

The deployment script in `scripts/00-laravel-deploy.sh` is intentionally
non-destructive. It runs normal migrations and then refreshes only the public
demo tenant:

```bash
php artisan migrate --force
php artisan db:seed --class=DemoAccountSeeder --force
php artisan optimize
```

Do not use `migrate:fresh` on production unless the goal is to erase and rebuild
the whole database.

Recommended production checklist:

- Set `APP_ENV=production` and `APP_DEBUG=false`.
- Configure `APP_URL`, database credentials, mail credentials, queue connection,
  session domain, and Reverb/broadcasting values if realtime announcements are
  enabled.
- Run `php artisan storage:link` if uploaded files must be publicly accessible.
- Run `npm run build` before serving the application.
- Run `php artisan migrate --force`.
- Optionally run `php artisan db:seed --class=DemoAccountSeeder --force` for a
  public demo deployment.

## Project Structure

- `app/Http/Controllers`: Laravel controllers for dashboards and CRUD modules.
- `app/Models`: Eloquent models for organizations, users, lots, charges,
  payments, tickets, documents, items, and notifications.
- `app/Services`: business services for notifications and monthly charge
  generation.
- `database/migrations`: schema history.
- `database/seeders/DemoAccountSeeder.php`: public demo tenant and fake data.
- `resources/js/Pages`: Inertia React pages.
- `resources/js/Components`: reusable React components.
- `resources/js/i18n`: French/Arabic translation support.
- `tests/Feature`: feature coverage for auth, dashboard, invitations,
  notifications, expenses, tickets, charge generation, and payments.
