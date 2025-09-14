<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;

class EmployeeController extends Controller
{
    public function index()
    {
        return Employee::all();
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'username' => 'required|string|min:3|unique:employee,username',
                'password' => 'required|string|min:6',
                'roles'    => 'required|array|min:1', 
            ]);

            $employee = Employee::create([
                'username' => $validated['username'],
                'password' => bcrypt($validated['password']),
                'roles'    => $validated['roles'],
            ]);

            return response()->json($employee, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors()
            ], 422);

        } catch (QueryException $e) {
            if (str_contains($e->getMessage(), 'unique')) {
                return response()->json([
                    'message' => 'The username has already been taken.',
                    'errors' => [
                        'username' => ['The username has already been taken.']
                    ]
                ], 422);
            }

            return response()->json([
                'message' => 'Database error',
                'error'   => $e->getMessage()
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An unexpected error occurred',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        return Employee::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'username' => 'sometimes|string|min:3|unique:employee,username,' . $id,
            'password' => 'sometimes|string|min:6',
            'roles'    => 'sometimes|array|min:1',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $employee->update($validated);

        return response()->json($employee);
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();

        return response()->json(['message' => 'Employee deleted']);
    }
}