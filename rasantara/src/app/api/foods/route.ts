import FoodModel from '@/db/models/FoodModel';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const island = url.searchParams.get('island');

    type Food = { id: string | number; name?: string; origin?: { island?: string } }
    if (island) {
      const all = await FoodModel.getAll();
  const filtered = (all as unknown as Food[]).filter((f) => f.origin?.island === island);
      return NextResponse.json(filtered, { status: 200 });
    }

    const foods = await FoodModel.getAll();
    return NextResponse.json(foods, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
