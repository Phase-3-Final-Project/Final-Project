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
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to delete food' }, { status: 500 });
  }
}
