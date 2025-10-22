import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(`https://api.meshy.ai/openapi/v1/image-to-3d/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}` },
      // Avoid caching
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Failed to fetch result';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
