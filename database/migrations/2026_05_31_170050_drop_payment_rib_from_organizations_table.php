<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('organizations', 'payment_rib')) {
            return;
        }

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('payment_rib');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('organizations', 'payment_rib')) {
            return;
        }

        Schema::table('organizations', function (Blueprint $table) {
            $table->string('payment_rib')->nullable()->after('phone');
        });
    }
};
