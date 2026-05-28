<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private array $tenantTables = [
        'users',
        'buildings',
        'floors',
        'apartments',
        'charges',
        'payments',
        'expenses',
        'documents',
        'announcements',
        'tickets',
        'ticket_messages',
        'receipts',
        'items',
        'notifications',
        'audit_logs',
    ];

    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        $now = now();
        $defaultOrganizationId = DB::table('organizations')->insertGetId([
            'name' => 'SyndiCare Demo',
            'slug' => 'syndicare-demo',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        foreach ($this->tenantTables as $tableName) {
            if (! Schema::hasTable($tableName) || Schema::hasColumn($tableName, 'organization_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('organization_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('organizations')
                    ->nullOnDelete();
            });

            DB::table($tableName)->whereNull('organization_id')->update([
                'organization_id' => $defaultOrganizationId,
            ]);
        }

        $firstSyndic = DB::table('users')
            ->where('role', 'Syndic')
            ->orderBy('id')
            ->first();

        if ($firstSyndic) {
            DB::table('organizations')
                ->where('id', $defaultOrganizationId)
                ->update([
                    'name' => $firstSyndic->name ? $firstSyndic->name.' - Syndic' : 'SyndiCare Demo',
                    'slug' => Str::slug(($firstSyndic->name ?: 'syndicare-demo').'-syndic'),
                    'email' => $firstSyndic->email,
                    'phone' => $firstSyndic->phone_number ?? null,
                    'updated_at' => $now,
                ]);
        }

        Schema::table('floors', function (Blueprint $table) {
            $table->dropUnique('floors_number_unique');
            $table->unique(['organization_id', 'number']);
        });

        Schema::table('apartments', function (Blueprint $table) {
            $table->dropUnique('apartments_number_unique');
            $table->unique(['organization_id', 'number']);
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('apartments') && Schema::hasColumn('apartments', 'organization_id')) {
            Schema::table('apartments', function (Blueprint $table) {
                $table->dropUnique(['organization_id', 'number']);
                $table->unique('number');
            });
        }

        if (Schema::hasTable('floors') && Schema::hasColumn('floors', 'organization_id')) {
            Schema::table('floors', function (Blueprint $table) {
                $table->dropUnique(['organization_id', 'number']);
                $table->unique('number');
            });
        }

        foreach (array_reverse($this->tenantTables) as $tableName) {
            if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, 'organization_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }

        Schema::dropIfExists('organizations');
    }
};
