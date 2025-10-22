import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Convert files to base64 (atau bisa upload ke cloud storage jika perlu)
    const imageUrls: string[] = [];
    
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      imageUrls.push(base64);
    }

    return NextResponse.json({ success: true, imageUrls });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
