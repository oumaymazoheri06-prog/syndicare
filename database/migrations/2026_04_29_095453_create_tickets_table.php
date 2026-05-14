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
       Schema::create('tickets', function (Blueprint $table) {
    $table->id();

    $table->string('title');


    // Who created the ticket
    $table->foreignId('assingned_by')
          ->constrained('users')
          ->onDelete('cascade');

    // Optional: assign to admin/employee
    $table->foreignId('assigned_to')
          ->nullable()
          ->constrained('users')
          ->nullOnDelete();

    // Ticket status

    $table->enum('status', ['open', 'in_progress', 'closed'])
          ->default('open');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
