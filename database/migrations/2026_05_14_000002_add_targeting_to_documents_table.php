<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('target_type')->default('all');
            $table->foreignId('apartment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('target_role')->nullable();
        });

        DB::table('documents')
            ->whereNotNull('building_id')
            ->update(['target_type' => 'building']);
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('apartment_id');
            $table->dropColumn(['target_type', 'target_role']);
        });
    }
};
