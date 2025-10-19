import FoodModel from '@/db/models/FoodModel';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // try by slug first, then by numeric id
    const food = await FoodModel.getBySlug(id);
    if (!food) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return new Response(JSON.stringify(food), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
