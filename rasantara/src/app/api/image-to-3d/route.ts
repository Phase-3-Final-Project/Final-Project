import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image_data } = await req.json();

    if (!image_data) {
      return NextResponse.json({ error: "image_data is required" }, { status: 400 });
    }

    const isDataUrl = typeof image_data === "string" && image_data.startsWith("data:");
    const isHttpUrl = typeof image_data === "string" && /^https?:\/\//i.test(image_data);

    const payload: Record<string, unknown> = {
      enable_pbr: true,
      should_remesh: true,
      should_texture: true,
    };
    if (isDataUrl) {
      // base64 data URL → send only base64 content without prefix
      const commaIndex = image_data.indexOf(',');
      const base64Only = commaIndex >= 0 ? image_data.slice(commaIndex + 1) : image_data;
      payload.image = base64Only;
    } else if (isHttpUrl) {
      // remote URL
      payload.image_url = image_data;
    } else {
      return NextResponse.json({ error: "image_data must be a data URL or http(s) URL" }, { status: 400 });
    }

    const response = await fetch("https://api.meshy.ai/openapi/v1/image-to-3d", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Meshy API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
