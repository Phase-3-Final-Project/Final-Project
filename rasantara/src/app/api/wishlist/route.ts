import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import WishlistModel from '@/db/models/WishlistModel';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get('Authorization')?.value;

    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.replace('Bearer ', '');
    const payload = verify(token, process.env.SECRET_KEY as string) as { _id?: string };

    if (!payload?._id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { foodId } = await request.json();
    if (!foodId) {
      return NextResponse.json({ error: 'foodId is required' }, { status: 400 });
    }

    console.log('Adding to wishlist:', { userId: payload._id, foodId });
    const result = await WishlistModel.create({ userId: payload._id, foodId });
    console.log('Wishlist insert result:', result);

    return NextResponse.json({ message: 'Added to wishlist', insertedId: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get('Authorization')?.value;

    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.replace('Bearer ', '');
    const payload = verify(token, process.env.SECRET_KEY as string) as { _id?: string };

    if (!payload?._id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { wishlistId } = await request.json();
    if (!wishlistId) {
      return NextResponse.json({ error: 'wishlistId is required' }, { status: 400 });
    }

    await WishlistModel.deleteById(wishlistId);

    return NextResponse.json({ message: 'Removed from wishlist' }, { status: 200 });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
