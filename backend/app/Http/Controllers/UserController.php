<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // GET /api/users
    public function index()
    {
        return response()->json(User::all());
    }

    // POST /api/users
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'roles'    => 'array', 
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'password' => Hash::make($validated['password']),
            'roles'    => $validated['roles'] ?? [],
        ]);

        return response()->json($user, 201);
    }

    // GET /api/users/{id}
    public function show(User $user)
    {
        return response()->json($user);
    }

    // PUT /api/users/{id}
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:6',
            'roles'    => 'sometimes|array',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    // DELETE /api/users/{id}
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(null, 204);
    }
}
