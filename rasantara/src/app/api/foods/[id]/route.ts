import FoodModel from '@/db/models/FoodModel';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { _id: string } }) {
  try {
    const { _id } = params;
    // try by slug first, then by numeric id
    const food = await FoodModel.getBySlug(_id);
    if (!food) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(food), { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
