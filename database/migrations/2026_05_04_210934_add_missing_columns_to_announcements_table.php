<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('announcements', 'target_role')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->enum('target_role', ['all', 'copropriÃ©taires', 'locataires'])->default('all');
            });
        }

        if (! Schema::hasColumn('announcements', 'building_id')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->foreignId('building_id')->nullable()->constrained()->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('announcements', 'building_id')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->dropConstrainedForeignId('building_id');
            });
        }

        if (Schema::hasColumn('announcements', 'target_role')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->dropColumn('target_role');
            });
        }
    }
};
