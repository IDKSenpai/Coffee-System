<?php

namespace App\Http\Controllers;

use App\Models\Items;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ItemsController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        $items = Items::query()
            ->when($q, function ($query, $q) {
                $query->where('name', 'LIKE', "%{$q}%")
                      ->orWhere('price', 'LIKE', "%{$q}%");
            })
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:20480',
            'options' => 'nullable|json',
        ]);

        $data = $request->only('name', 'price');

        $data['options'] = json_decode($request->input('options', '[]'), true);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('items', 'public');
        }

        $item = Items::create($data);
        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:20480',
            'options' => 'nullable|json', 
        ]);

        $item = Items::findOrFail($id);
        $item->name = $request->name;
        $item->price = $request->price;

        $item->options = json_decode($request->input('options', '[]'), true);

        if ($request->hasFile('image')) {
            if ($item->image && Storage::disk('public')->exists($item->image)) {
                Storage::disk('public')->delete($item->image);
            }
            $item->image = $request->file('image')->store('items', 'public');
        }

            $item->save();
            return response()->json($item);
    }

    
    public function destroy($id)
    {
        $item = Items::findOrFail($id);
        if ($item->image && Storage::disk('public')->exists($item->image)) {
            Storage::disk('public')->delete($item->image);
        }
        $item->delete();
        return response()->json(null, 204);
    }
}
