import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Forward user agent to avoid bot blocking
        "User-Agent": req.headers.get("user-agent") || "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.status}`);
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "model/gltf-binary",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Proxy failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
