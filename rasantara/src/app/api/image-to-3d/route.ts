import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const payload: Record<string, unknown> = {
      enable_pbr: true,
      should_remesh: true,
      should_texture: true,
    };

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      const imageUrl = form.get('image_url');
      if (file && file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const type = (file as File).type || 'image/jpeg';
        const mime = type || 'image/jpeg';
        // Send as data URL in image_url field (required by Meshy API)
        payload.image_url = `data:${mime};base64,${base64}`;
        console.log('[Meshy] Multipart file detected, mime:', mime, 'size:', Math.round(base64.length/1024), 'KB');
      } else if (typeof imageUrl === 'string' && imageUrl) {
        payload.image_url = imageUrl;
        console.log('[Meshy] Multipart image_url detected:', imageUrl.slice(0, 80));
      } else {
        return NextResponse.json({ error: 'file or image_url is required' }, { status: 400 });
      }
    } else {
      const { image_data } = await req.json();
      if (!image_data) {
        return NextResponse.json({ error: "image_data is required" }, { status: 400 });
      }
      const isDataUrl = typeof image_data === "string" && image_data.startsWith("data:");
      const isHttpUrl = typeof image_data === "string" && /^https?:\/\//i.test(image_data);
      if (isDataUrl) {
        // Send data URL directly as image_url (Meshy accepts data URLs)
        payload.image_url = image_data;
        console.log('[Meshy] JSON data URL detected, size:', Math.round(image_data.length/1024), 'KB');
      } else if (isHttpUrl) {
        payload.image_url = image_data;
        console.log('[Meshy] JSON http(s) URL detected:', image_data.slice(0, 80));
      } else {
        return NextResponse.json({ error: "image_data must be a data URL or http(s) URL" }, { status: 400 });
      }
    }

    const response = await fetch("https://api.meshy.ai/openapi/v1/image-to-3d", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data: { raw?: string; result?: string; task_id?: string; id?: string } | Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!response.ok) {
      console.error("Meshy start non-OK:", response.status, data);
    } else {
      console.log('[Meshy] Start OK:', response.status, 'task_id:', data?.result || data?.task_id || data?.id);
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Meshy API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to start 3D generation';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
