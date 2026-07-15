SyndiCare

SyndiCare is a condominium management web application built with Laravel, React, Inertia.js, and MySQL.

I created it as my final-year project to make communication and daily management easier for property managers, co-owners, and tenants. Instead of relying on Excel files, WhatsApp messages, paper receipts, and manual reminders, users can manage everything from one platform.

Main Features
Separate dashboards for administrators, property managers, co-owners, and tenants
Management of buildings, floors, apartments, residents, and occupancy
Charges, expenses, payments, receipts, and payment validation
Complaints and message history between residents and the property manager
Document and announcement sharing
Notifications and audit logs
Lost-and-found module
French and Arabic language support
Multi-tenant organization management
Technologies

Backend: Laravel, PHP, Eloquent ORM, MySQL
Frontend: React, Inertia.js, Tailwind CSS, Vite
Other tools: Git, GitHub, Composer, npm, PHPUnit, Docker

My Work on the Project

I worked on both the frontend and backend of the application.

I built the dashboards, user interfaces, authentication system, role-based access, database structure, payments, complaints, notifications, lost-and-found features, and multilingual support.

I also prepared demo data, automated tests, and deployment configuration.

User Roles

Property Manager
Manages buildings, residents, charges, payments, documents, announcements, complaints, and expenses.

Co-owner
Can view owned apartments, charges, payments, documents, announcements, and complaints.

Tenant
Can view assigned apartments, announcements, documents, and complaints.

Demo Accounts
Property Manager: demo@syndicare.ma
Co-owner: copro.demo@syndicare.ma
Tenant: locataire.demo@syndicare.ma
Password: Demo@2026

Local Installation
composer install
npm install
cp .env.example .env
php artisan key:generate

Configure the database in the .env file, then run:

php artisan migrate
php artisan db:seed --class=DemoAccountSeeder
npm run dev
php artisan serve
Testing
php artisan test
Project Structure
app/Http/Controllers
app/Models
app/Services
database/migrations
database/seeders
resources/js/Pages
resources/js/Components
resources/js/i18n
tests/Feature

## Screenshots

### Landing page
<img width="2509" height="1351" alt="Screenshot 2026-06-27 180055" src="https://github.com/user-attachments/assets/1e364655-ec5c-4122-9cb1-09e13d9b7398" />
### login
 <img width="1748" height="1253" alt="Screenshot 2026-06-27 175200" src="https://github.com/user-attachments/assets/ba2510c0-9188-455c-a365-594ce6668629" />
### manager dashboard 
<img width="1253" height="735" alt="dashboard final" src="https://github.com/user-attachments/assets/046e2661-8e52-49d0-a128-bf742888d351" />
### charge generation form 
<img width="2150" height="1420" alt="Screenshot 2026-05-20 203159" src="https://github.com/user-attachments/assets/49154d12-4f7d-4be3-b353-6a85f72170eb" />

### co-owner dashboard
<img width="2507" height="1337" alt="Screenshot 2026-07-15 192144" src="https://github.com/user-attachments/assets/e67656ee-0ad5-49a7-b515-68e66a5e5233" />

### tenant dashboard
<img width="2502" height="1356" alt="Screenshot 2026-07-15 192226" src="https://github.com/user-attachments/assets/ba8473c5-f499-4b71-9a23-da85bd3d143d" />

### Report a Lost or Found Item
<img width="2070" height="1347" alt="objet" src="https://github.com/user-attachments/assets/14aef09b-96b0-4ffb-a3bb-d72a4bf33a8d" />

### Building Overview
<img width="2145" height="1366" alt="Screenshot 2026-07-15 192609" src="https://github.com/user-attachments/assets/d8ed9d54-a8bd-4650-8bb3-7946bea7281b" />
### Payments overview
<img width="2147" height="1333" alt="Screenshot 2026-07-15 192656" src="https://github.com/user-attachments/assets/d5045ab9-32e7-491c-8a98-22978d99bd4e" />







 


