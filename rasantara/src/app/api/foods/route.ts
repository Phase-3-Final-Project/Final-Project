import FoodModel from '@/db/models/FoodModel';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const island = url.searchParams.get('island');
    const province = url.searchParams.get('province');

    type Food = { _id: string | number; name?: string; origin?: { island?: string; province?: string } }
    
    const all = await FoodModel.getAll();
    
    if (province) {
      const filtered = (all as unknown as Food[]).filter((f) => f.origin?.province === province);
      return NextResponse.json(filtered, { status: 200 });
    }
    
    if (island) {
      const filtered = (all as unknown as Food[]).filter((f) => f.origin?.island === island);
      return NextResponse.json(filtered, { status: 200 });
    }

    return NextResponse.json(all, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Required fields minimal
    if (!body.name || !body.photo || !body.description || !body.origin) {
      return NextResponse.json({ error: "name, photo, description, origin { province, island, city_or_region } wajib diisi" }, { status: 400 });
    }
    if (typeof body.origin !== 'object' || !body.origin?.province || !body.origin?.island || !body.origin?.city_or_region) {
      return NextResponse.json({ error: "origin harus object { province, island, city_or_region }" }, { status: 400 });
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

    interface FoodPayload {
      name: string;
      alternate_names: string[];
      description: string;
      photo: string;
      category: string;
      course: string;
      origin: {
        province: string;
        island: string;
        city_or_region: string;
      };
      serving: {
        temperature: string;
        accompaniments: string[];
        portion_size: string;
      };
      main_ingredients: string[];
      taste_profile: {
        spiciness: string;
        flavor_notes: string[];
      };
      model3D?: string;
      [key: string]: unknown;
    }

    const payload: FoodPayload = {
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

    const food = await FoodModel.insert(payload);
    return NextResponse.json({ success: true, food });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

