<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Validation\Rule;

abstract class Controller
{
    use AuthorizesRequests;

    protected function tenantExists(string $table, string $column = 'id')
    {
        return Rule::exists($table, $column)
            ->where(fn ($query) => $query->where('organization_id', request()->user()?->organization_id));
    }

    protected function tenantUnique(string $table, string $column)
    {
        return Rule::unique($table, $column)
            ->where(fn ($query) => $query->where('organization_id', request()->user()?->organization_id));
    }
}
