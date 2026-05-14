<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            if (! Schema::hasColumn('items', 'title')) {
                $table->string('title')->nullable()->after('id');
            }

            if (! Schema::hasColumn('items', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('items', 'apartment_id')) {
                $table->foreignId('apartment_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('apartments')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('items', 'location')) {
                $table->string('location')->nullable()->after('description');
            }

            if (! Schema::hasColumn('items', 'status')) {
                $table->string('status', 30)->default('ouvert')->after('type');
            }

            if (! Schema::hasColumn('items', 'image_path')) {
                $table->string('image_path')->nullable()->after('location');
            }

            if (! Schema::hasColumn('items', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            if (Schema::hasColumn('items', 'apartment_id')) {
                $table->dropConstrainedForeignId('apartment_id');
            }

            if (Schema::hasColumn('items', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }

            foreach (['resolved_at', 'image_path', 'status', 'location', 'title'] as $column) {
                if (Schema::hasColumn('items', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
