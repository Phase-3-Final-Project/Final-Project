import FoodModel from '@/db/models/FoodModel';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Try lookup by MongoDB _id when id is a valid ObjectId
    if (id && ObjectId.isValid(id)) {
      const byId = await FoodModel.collection().findOne({ _id: new ObjectId(id) });
      if (byId) return NextResponse.json(byId, { status: 200 });
    }

    // Fallback: try lookup by slug
    const bySlug = await FoodModel.getBySlug(id);
    if (bySlug) return NextResponse.json(bySlug, { status: 200 });

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
