import FoodModel from '@/db/models/FoodModel';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    let food;
    
    // Try by ObjectId first if it's a valid ObjectId format
    if (ObjectId.isValid(id)) {
      food = await FoodModel.collection().findOne({ _id: new ObjectId(id) });
    }
    
    // Fallback to slug lookup
    if (!food) {
      food = await FoodModel.getBySlug(id);
    }
    
    if (!food) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(food), { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Validate if it's a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.photo || !body.description || !body.origin) {
      return NextResponse.json(
        { error: "name, photo, description, origin { province, island, city_or_region } wajib diisi" },
        { status: 400 }
      );
    }
    
    if (
      typeof body.origin !== 'object' ||
      !body.origin?.province ||
      !body.origin?.island ||
      !body.origin?.city_or_region
    ) {
      return NextResponse.json(
        { error: "origin harus object { province, island, city_or_region }" },
        { status: 400 }
      );
    }

    // Normalize arrays
    const alternate_names: string[] = Array.isArray(body.alternate_names) ? body.alternate_names : [];
    const main_ingredients: string[] = Array.isArray(body.main_ingredients) ? body.main_ingredients : [];
    const serving = {
      temperature: body?.serving?.temperature || "",
      accompaniments: Array.isArray(body?.serving?.accompaniments) ? body.serving.accompaniments : [],
      portion_size: body?.serving?.portion_size || "",
    };
    const taste_profile = {
      spiciness: body?.taste_profile?.spiciness || "",
      flavor_notes: Array.isArray(body?.taste_profile?.flavor_notes) ? body.taste_profile.flavor_notes : [],
    };

    const payload: Record<string, unknown> = {
      name: body.name,
      alternate_names,
      description: body.description,
      photo: body.photo,
      category: body.category || "",
      course: body.course || "",
      origin: body.origin,
      serving,
      main_ingredients,
      taste_profile,
    };
    
    if (body["model3D"]) payload["model3D"] = body["model3D"];
    
    // Update the food item
    const result = await FoodModel.updateById(id, payload);
    
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update food';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Validate if it's a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Delete the food item
    const result = await FoodModel.deleteById(id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete food';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
