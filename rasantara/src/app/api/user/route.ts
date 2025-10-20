import WishlistModel from '@/db/models/WishlistModel';
import FoodModel from '@/db/models/FoodModel';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, assume userId is in cookie/session; fallback to a test id
    const userId = process.env.TEST_USER_ID || '';
    if (!userId) return NextResponse.json({ error: 'No user' }, { status: 401 });

    const wishlist = await WishlistModel.findByUserId(userId);

    // enrich wishlist items with food details
  type WishlistDoc = { _id?: { toString?: () => string }; foodId?: unknown };
    const enriched = await Promise.all(
      (wishlist || []).map(async (w: unknown) => {
        try {
          if (typeof w === "object" && w !== null && "foodId" in w) {
            const doc = w as WishlistDoc;
            const wid = doc._id?.toString?.() ?? null;
            const foodId = doc.foodId;
            // if foodId is an ObjectId-like or string, pass directly to query
            // For simplicity in this endpoint, load foods into memory and match by id/slug.
            const allFoods = await FoodModel.getAll();
            // try matching by ObjectId string or slug
            const food = allFoods.find((f: unknown) => {
              if (typeof f === 'object' && f !== null) {
                const ff = f as { _id?: { toString?: () => string }; slug?: string };
                const fid = ff._id?.toString?.();
                if (typeof foodId === 'string' && fid === foodId) return true;
                if (typeof foodId === 'string' && ff.slug === foodId) return true;
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
