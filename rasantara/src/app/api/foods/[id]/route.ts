import FoodModel from '@/db/models/FoodModel';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
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
