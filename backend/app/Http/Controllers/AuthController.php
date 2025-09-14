<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Login and return Sanctum token for either admin or employee.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (Auth::guard('web')->attempt($request->only('username', 'password'))) {
            $user = Auth::guard('web')->user();
            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Admin logged in successfully',
                'user' => $user,
                'token' => $token,
            ], 200);
        }

        if (Auth::guard('employee')->attempt($request->only('username', 'password'))) {
            $user = Auth::guard('employee')->user();
            $token = $user->createToken('employee-token')->plainTextToken;

            return response()->json([
                'message' => 'Employee logged in successfully',
                'user' => $user,
                'token' => $token,
            ], 200);
        }

        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    /**
     * Get authenticated user.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        $user = Auth::user();

        if ($user) {
            return response()->json([
                'username' => $user->username,
                'id' => $user->id,
            ]);
        }

        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    /**
     * Get authenticated employee.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function employee(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if ($employee) {
            return response()->json($employee);
        }

        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    /**
     * Logout and revoke token.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Update the authenticated user's profile.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $tableName = '';
        if ($user instanceof User) {
            $tableName = 'tbl_users';
        } elseif ($user instanceof Employee) {
            $tableName = 'employee';
        }

        $request->validate([
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique($tableName, 'username')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:6',
        ]);

        $user->username = $request->username;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => [
                'username' => $user->username,
                'id' => $user->id,
            ]
        ], 200);
    }
}