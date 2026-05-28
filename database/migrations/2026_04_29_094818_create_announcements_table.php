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
       Schema::create('announcements', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
 $table->foreignId('building_id')->nullable()->constrained()->nullOnDelete();
    // null = tous les immeubles
    $table->enum('target_role', ['all', 'coproprietaires', 'locataires'])->default('all');

    $table->foreignId('creator_id')
          ->constrained('users')
          ->onDelete('cascade');

    $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
