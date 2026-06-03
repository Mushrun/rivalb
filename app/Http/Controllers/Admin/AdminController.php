<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $admins = Admin::latest()->get()->map(fn($a) => [
            'id'         => $a->id,
            'name'       => $a->name,
            'email'      => $a->email,
            'role'       => $a->role,
            'is_active'  => $a->is_active,
            'created_at' => $a->created_at->format('d/m/Y'),
        ]);

        return Inertia::render('Admin/Admins', ['admins' => $admins]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'unique:admins,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'in:super_admin,moderator,support'],
        ]);

        // Seul un super_admin peut créer un autre super_admin
        if ($request->role === 'super_admin' && auth('admin')->user()->role !== 'super_admin') {
            return back()->withErrors(['role' => 'Seul un super_admin peut créer un autre super_admin.']);
        }

        Admin::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'is_active' => true,
        ]);

        return back()->with('flash', ['success' => 'Administrateur créé.']);
    }

    public function toggleActive(int $id)
    {
        $admin = Admin::findOrFail($id);
        $admin->update(['is_active' => !$admin->is_active]);

        return back()->with('flash', ['success' => 'Statut mis à jour.']);
    }

    public function destroy(int $id)
    {
        Admin::findOrFail($id)->delete();

        return back()->with('flash', ['success' => 'Administrateur supprimé.']);
    }
}
