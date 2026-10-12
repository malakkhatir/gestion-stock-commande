<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        if (!$user || !in_array($user->getRole(), $roles)) {
            abort(403, 'Accès non autorisé');
        }
        return $next($request);
    }
}