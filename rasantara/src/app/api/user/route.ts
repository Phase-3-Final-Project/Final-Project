import WishlistModel from '@/db/models/WishlistModel';
import FoodModel from '@/db/models/FoodModel';
import UserModel from '@/db/models/UserModel';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get userId from JWT token in cookie
    let userId = '';
    
    try {
      const cookieStore = await cookies();
      const auth = cookieStore.get('Authorization')?.value;
      
      if (auth && auth.startsWith('Bearer ')) {
        const token = auth.replace('Bearer ', '');
        const payload = verify(token, process.env.SECRET_KEY as string) as { _id?: string };
        userId = payload._id || '';
      }
    } catch (err) {
      console.warn('Failed to verify token, falling back to TEST_USER_ID', err);
    }
    
    // Fallback to TEST_USER_ID for development
    if (!userId) {
      userId = process.env.TEST_USER_ID || '';
    }
    
    if (!userId) return NextResponse.json({ error: 'No user' }, { status: 401 });
    const wishlist = await WishlistModel.findByUserId(userId);

    // enrich wishlist items with food details
  type WishlistDoc = { _id?: { toString?: () => string }; foodId?: { toString?: () => string } | string };
    const enriched = await Promise.all(
      (wishlist || []).map(async (w: unknown) => {
        try {
          if (typeof w === "object" && w !== null && "foodId" in w) {
            const doc = w as WishlistDoc;
            const wid = doc._id?.toString?.() ?? null;
            const foodId = doc.foodId;
            
            // Convert foodId to string for comparison
            const foodIdStr = typeof foodId === 'string' ? foodId : foodId?.toString?.();
            
            // Load all foods and find matching one
            const allFoods = await FoodModel.getAll();
            const food = allFoods.find((f: unknown) => {
              if (typeof f === 'object' && f !== null) {
                const ff = f as { _id?: { toString?: () => string }; slug?: string };
                const fid = ff._id?.toString?.();
                // Match by _id string comparison
                if (foodIdStr && fid === foodIdStr) return true;
                // Also try slug matching as fallback
                if (foodIdStr && ff.slug === foodIdStr) return true;
              }
              return false;
            });
            if (food) {
              return { wishlistId: wid, food: { ...food, id: food._id?.toString?.() } };
            }
          }
        } catch (e) {
          console.warn('Error loading food for wishlist item', e);
        }
        return null;
      })
    );

    return NextResponse.json({ wishlist: enriched.filter(Boolean) }, { status: 200 });
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
  } catch (err: unknown) {
    // Safely extract message from unknown
    console.error(err);
    const message = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Server error');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
