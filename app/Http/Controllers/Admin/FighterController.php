<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fighter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FighterController extends Controller
{
    public function index()
    {
        $fighters = Fighter::orderBy('name')->get()
            ->map(fn($f) => [
                'id'         => $f->id,
                'name'       => $f->name,
                'game'       => $f->game,
                'actif'      => $f->is_active,
                'image_path' => $f->image_path,
            ]);

        return Inertia::render('Admin/Combattants', ['fighters' => $fighters]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => ['required', 'string', 'max:100'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path      = $request->file('image')->store('fighters', 'images');
            $imagePath = '/images/' . $path;
        }

        Fighter::create([
            'name'       => strtoupper($request->name),
            'game'       => 'Shadow Fight 4: Arena',
            'is_active'  => true,
            'image_path' => $imagePath,
        ]);

        return back()->with('flash', ['success' => 'Combattant ajouté.']);
    }

    public function toggle(int $id)
    {
        $fighter = Fighter::findOrFail($id);
        $fighter->update(['is_active' => !$fighter->is_active]);

        return back()->with('flash', ['success' => 'Statut mis à jour.']);
    }

    public function destroy(int $id)
    {
        $fighter = Fighter::findOrFail($id);

        if ($fighter->image_path && str_starts_with($fighter->image_path, '/images/fighters/')) {
            Storage::disk('images')->delete(str_replace('/images/', '', $fighter->image_path));
        }

        $fighter->delete();

        return back()->with('flash', ['success' => 'Combattant supprimé.']);
    }
}
