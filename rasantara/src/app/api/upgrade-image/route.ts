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
    console.log("Endpoint:", ARK_API_URL);

    // Professional food photography enhancement prompt optimized for 3D generation
    const prompt = `Transform this food image into PERFECT professional 3D-ready food photography with these CRITICAL requirements:

🎯 PRIMARY REQUIREMENT - 3/4 SIDE VIEW ANGLE (CRITICAL FOR 3D):
✓ MUST show the food from a 45-degree angle (3/4 view)
✓ NEVER top-down view or straight front view
✓ Show depth, height, and layers of the food
✓ Visible side profile showing food structure and thickness
✓ Camera angle slightly above eye level (15-30 degrees)
✓ This angle is ESSENTIAL for successful 3D model generation

🎨 VISUAL REQUIREMENTS FOR 3D SCANNING:
✓ PURE WHITE BACKGROUND (RGB 255,255,255) - completely clean, no shadows
✓ Even, diffused studio lighting from multiple angles
✓ No harsh shadows or dark areas that block details
✓ Maximum visible surface area of the food
✓ Clear separation between food and background
✓ All textures and details clearly visible

📸 COMPOSITION FOR 3D MODEL:
✓ Food centered but showing dimensional depth
✓ Entire dish visible with no cropping
✓ Space around the food for clean background
✓ Multiple layers/components clearly distinguishable
✓ Height and volume clearly represented
✓ Natural presentation on appropriate serving vessel

💡 LIGHTING & ENHANCEMENT (AGGRESSIVE):
✓ Brightness: +40 to +70 (very bright, studio quality)
✓ Shadows: 90-100 (eliminate all dark shadows)
✓ Highlights: +30 to +50 (bright, appetizing highlights)
✓ Contrast: +35 to +50 (strong definition between elements)
✓ Saturation: +30 to +45 (vibrant, appetizing colors)
✓ Sharpness: 90-100 (maximum detail and clarity)
✓ Clarity: 85-100 (enhanced texture and detail)

🍽️ FOOD-SPECIFIC OPTIMIZATION:
✓ Enhance natural food colors (not artificial)
✓ Show moisture, texture, and freshness
✓ Emphasize layers, toppings, and garnishes
✓ Warm color temperature (+20 to +35) for appetizing look
✓ Preserve authentic Indonesian food appearance

⚠️ CRITICAL REMINDERS:
1. The 3/4 side view angle is NON-NEGOTIABLE - this is the ONLY angle that works for 3D generation
2. If current image is top-down, recompose to show side profile
3. If current image is flat/straight-on, add dimensional perspective
4. Background MUST be pure white with zero shadows
5. All food details must be clearly visible for 3D reconstruction

Transform this image following ALL requirements above, prioritizing the 3/4 side view angle for optimal 3D model generation.`;

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
