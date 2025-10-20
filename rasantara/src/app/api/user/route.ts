import WishlistModel from '@/db/models/WishlistModel';
import UserModel from '@/db/models/UserModel';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, assume userId is in cookie/session; fallback to a test id
    const userId = process.env.TEST_USER_ID || '';
    if (!userId) return NextResponse.json({ error: 'No user' }, { status: 401 });

    const wishlist = await WishlistModel.findByUserId(userId);
    return NextResponse.json({ wishlist }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, username, email, password, role } = await request.json();
    const newUser = { name, username, email, password, role: role || 'user' };
    await UserModel.create(newUser);
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: err.status || 500 });
  }
}
