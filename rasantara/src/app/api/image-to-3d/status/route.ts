import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Stream progress from Meshy
  const meshRes = await fetch(`https://api.meshy.ai/openapi/v1/image-to-3d/${id}/stream`, {
    headers: {
      Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
      Accept: "text/event-stream",
    },
  });
  if (!meshRes.body) return NextResponse.json({ error: "No stream body" }, { status: 500 });

  // Proxy the stream to client
  return new Response(meshRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
