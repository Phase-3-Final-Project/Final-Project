# Setup Image Upgrade Feature

This document explains how to set up the AI-powered image upgrade feature using ByteDance's SeedDream API.

## Overview

The Image Upgrade feature uses ByteDance's SeedDream API to enhance food images to professional studio-quality photography. This feature:

- ✨ Transforms regular food photos into Michelin-star quality images
- 🎨 Creates pure white backgrounds for professional product photography
- 💡 Enhances lighting, colors, and sharpness
- 🎯 Optimizes images for better 3D model generation

## Prerequisites

You need to obtain an API key from ByteDance Volcano Engine (ARK Platform).

## Configuration

### 1. Get ARK API Key

1. Visit [ByteDance Volcano Engine ARK Platform](https://www.volcengine.com/product/ark)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Set Environment Variable

Add the following to your `.env` file in the `rasantara` directory:

```env
ARK_API_KEY=your_ark_api_key_here
```

Replace `your_ark_api_key_here` with your actual API key from ByteDance Volcano Engine.

**Optional:** If you need to use a different endpoint region, you can also set:

```env
ARK_API_URL=https://ark.cn-beijing.volces.com/api/v3/images/generations
```

**Possible endpoint regions:**
- China Beijing: `https://ark.cn-beijing.volces.com/api/v3/images/generations`
- Singapore: `https://ark-api-ap-southeast-1.bytepluses.com/api/v3/images/generations`
- Other regions: Check ByteDance documentation for your specific region

### 3. Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## Usage

### In Add Food Page

1. Upload or provide a URL for your food image
2. Click the **"✨ Upgrade Image (AI Enhanced)"** button
3. Wait for the AI to process and enhance the image
4. The upgraded image will be displayed with a green border
5. The upgraded image will automatically be used for:
   - Saving to the database
   - Generating the 3D model

### How It Works

The upgrade process:

1. **Sends the original image URL** to the ByteDance SeedDream API
2. **Applies professional enhancement prompt** that includes:
   - Pure white background (RGB 255,255,255)
   - Professional 3/4 side view composition
   - Studio lighting (bright, clean, appetizing)
   - Maximum detail and sharpness
   - Vibrant but natural food colors
   - Zero shadows on background
3. **Returns the enhanced image** ready for database storage and 3D generation

### Enhancement Features

The AI applies aggressive enhancements including:

- **Background**: Pure white, professional studio look
- **Lighting**: +30 to +60 brightness boost for darker images
- **Colors**: +25 to +40 saturation for appetizing look
- **Sharpness**: 80-100 maximum clarity
- **Contrast**: +30 to +45 for definition

## API Endpoint

The image upgrade feature is available at:

```
POST /api/upgrade-image
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/food-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "upgradedImageUrl": "https://enhanced-image-url.jpg",
  "originalResult": { /* Full API response */ }
}
```

## Troubleshooting

### Error: "ARK_API_KEY not configured"

**Solution:**
- Make sure you've added `ARK_API_KEY` to your `.env` file (NOT `.env.local`)
- Restart the development server after adding the variable
- Verify the file is in the correct location: `rasantara/.env`

### Error: "The API key doesn't exist" (AuthenticationError)

This is the most common error. Possible causes and solutions:

1. **Wrong API Key Format**
   - Make sure you copied the FULL API key from ByteDance console
   - API key should look like: `7a951c1b-4948-437b-bb22-abd431834335` (UUID format)
   - No extra spaces or characters

2. **API Key Not Activated**
   - Go to ByteDance Volcano Engine console
   - Navigate to ARK Platform → API Keys
   - Make sure the API key status is "Active"
   - Check if the key has permissions for "Image Generation" service

3. **Wrong Service/Product**
   - Make sure you created the API key for **ARK Platform** (ModelArk)
   - NOT for other ByteDance services (like Volcengine CDN, etc.)
   - The key must have access to SeedDream model

4. **Wrong Region/Endpoint**
   - Check your account region in ByteDance console
   - Add to `.env`:
     ```env
     ARK_API_URL=https://ark-api-ap-southeast-1.bytepluses.com/api/v3/images/generations
     ```
   - Try different endpoints based on your region:
     - **Singapore/SEA**: `https://ark-api-ap-southeast-1.bytepluses.com/api/v3/images/generations`
     - **China Beijing**: `https://ark.cn-beijing.volces.com/api/v3/images/generations`

5. **Insufficient Credits**
   - Check your ByteDance account balance
   - Make sure you have credits for API usage

**How to verify your API key:**

1. Go to [ByteDance Volcano Engine Console](https://console.volcengine.com/)
2. Navigate to: ARK Platform → API Management → API Keys
3. Check:
   - ✅ Status: Active
   - ✅ Permissions: Include "Image Generation" or "All Permissions"
   - ✅ Expiry Date: Not expired
   - ✅ Account Balance: Has sufficient credits

### Error: "Failed to upgrade image"

- Check that your ARK_API_KEY is valid and active
- Ensure you have sufficient API credits
- Verify the image URL is accessible
- Check server logs for detailed error message

### Error: "No image available to upgrade"

- Make sure you've uploaded an image or provided a valid image URL
- For uploaded files, you may need to provide the image URL as well
- The image URL must be publicly accessible

## Notes

- The upgrade process may take 10-30 seconds depending on image size
- The upgraded image URL will be automatically used for 3D model generation
- The upgraded image is what gets saved to the database
- **Important**: This feature only works on the **Add Food** page, not the Update page

## Cost Considerations

- Check ByteDance's pricing for the SeedDream API
- Consider implementing caching for frequently upgraded images
- Monitor your API usage to stay within budget

## Support

For issues with the ByteDance API:
- [ByteDance Volcano Engine Documentation](https://www.volcengine.com/docs)
- [ARK Platform Support](https://www.volcengine.com/product/ark)
