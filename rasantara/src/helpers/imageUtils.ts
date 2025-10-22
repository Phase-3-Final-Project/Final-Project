// Resize local image to reduce payload size (helps avoid server body limit)
export const fileToDataUrlResized = async (
  file: File,
  maxDim = 1024,
  quality = 0.85
): Promise<string> => {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  // Create image element
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
  // Compute scale
  const { width, height } = img;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  if (scale >= 1) return dataUrl; // already small
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  // Use JPEG to reduce size further
  const out = canvas.toDataURL("image/jpeg", quality);
  return out || dataUrl;
};

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) return new Blob();
  const mime = match[1] || "image/jpeg";
  const b64 = match[2] || "";
  const byteStr = atob(b64);
  const len = byteStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = byteStr.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};
