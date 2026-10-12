<?php

namespace App\Http\Middleware;

use App\Models\Client;
use Closure;
use Illuminate\Http\Request;

class EnsureClient
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() instanceof Client) {
            abort(403, 'Accès non autorisé');
        }

        return $next($request);
    }
}
