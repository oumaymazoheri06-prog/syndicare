<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY role ENUM('SuperAdmin', 'Syndic', 'Coproprietaire', 'Locataire') NOT NULL DEFAULT 'Syndic'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'Syndic' WHERE role = 'SuperAdmin'");

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE users MODIFY role ENUM('Syndic', 'Coproprietaire', 'Locataire') NOT NULL DEFAULT 'Syndic'");
    }
};
