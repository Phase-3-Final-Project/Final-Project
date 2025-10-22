import { NextRequest, NextResponse } from "next/server";

const ARK_API_KEY = process.env.ARK_API_KEY || "";
// Try different possible endpoints based on your region
const ARK_API_URL = process.env.ARK_API_URL || "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    if (!ARK_API_KEY) {
      return NextResponse.json(
        { error: "ARK_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log("=== Debug Info ===");
    console.log("ARK_API_KEY exists:", !!ARK_API_KEY);
    console.log("ARK_API_KEY length:", ARK_API_KEY?.length);
    console.log("ARK_API_KEY format:", ARK_API_KEY?.substring(0, 8) + "...");
    console.log("Image URL:", imageUrl);

    // Professional food photography enhancement prompt
    const prompt = `You are a professional food photography AI expert. Analyze this food image and provide AGGRESSIVE enhancement values to transform it into PERFECT professional studio-quality food photography like Michelin-star restaurant menus.

CRITICAL TARGET REQUIREMENTS (MUST ACHIEVE):
✓ PURE WHITE BACKGROUND (RGB 255,255,255) - like professional product photography
✓ Professional 3/4 side view composition
✓ Studio lighting: bright, clean, appetizing
✓ MAXIMUM detail and sharpness on food
✓ Vibrant but natural food colors
✓ Zero shadows on background
✓ Perfect for 3D model generation

ANALYSIS REQUIREMENTS - BE AGGRESSIVE WITH VALUES:

1. Background Enhancement (CRITICAL):
   - makeWhite: ALWAYS true for clean studio look
   - whiteLevel: 100 (maximum)
   - backgroundBrightness: 100 (brightest)

2. Lighting & Brightness (BOOST HEAVILY):
   - brightness: Recommend +30 to +60 for darker images
   - shadows: 80-100 (lighten shadows significantly)
   - highlights: +20 to +40 (boost highlights for pop)

3. Color & Vibrancy (MAKE FOOD APPETIZING):
   - contrast: +30 to +45 (strong contrast for definition)
   - saturation: +25 to +40 (vibrant but not artificial)
   - warmth: +15 to +30 (warm, appetizing tones for food)
   - vibrance: 35-50 (maximum vibrancy for muted colors)

4. Detail & Sharpness (MAXIMUM CLARITY):
   - sharpness: 80-100 (very sharp, crisp details)
   - clarity: 75-95 (maximum detail enhancement)

5. Food Identification:
   - Identify the Indonesian food name accurately

IMPORTANT: Give STRONG values to achieve dramatic improvement. Don't be conservative! Transform this into professional food photography with pure white background, studio lighting, and maximum appetizing appeal.`;

    // Call ByteDance SeedDream API
    // For image-to-image enhancement, include the image field
    const requestBody = {
      model: "seedream-4-0-250828",
      prompt: prompt,
      image: imageUrl, // Single image URL (not array) for enhancement
      sequential_image_generation: "disabled",
      response_format: "url",
      size: "2K",
      stream: false, // Use non-streaming for simpler response handling
      watermark: true,
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(ARK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ByteDance API error:", errorText);
      
      let errorMessage = "Failed to upgrade image";
      
      // Parse error for better user feedback
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.code === "AuthenticationError") {
          errorMessage = `Authentication failed. Please check:
1. Your ARK_API_KEY is correct and active
2. The API key has access to image generation APIs
3. Your account has sufficient credits
4. The endpoint region matches your account (current: ${ARK_API_URL})

API Error: ${errorJson.error.message}`;
        }
      } catch (e) {
        // If not JSON, use original error
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    // Handle non-streaming response (stream: false)
    const result = await response.json();
    console.log("API Response:", JSON.stringify(result, null, 2));

    // Extract the upgraded image URL from response
    let upgradedImageUrl = null;

    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      upgradedImageUrl = result.data[0].url || result.data[0].image_url;
    } else if (result.url) {
      upgradedImageUrl = result.url;
    } else if (result.image_url) {
      upgradedImageUrl = result.image_url;
    }

    if (!upgradedImageUrl) {
      console.error("No image URL in response:", JSON.stringify(result));
      return NextResponse.json(
        { error: "No upgraded image URL in response", result },
        { status: 500 }
      );
    }

    console.log("Successfully extracted image URL:", upgradedImageUrl);

    return NextResponse.json({
      success: true,
      upgradedImageUrl,
    });
  } catch (error: any) {
    console.error("Upgrade image error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
