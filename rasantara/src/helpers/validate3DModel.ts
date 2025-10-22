/**
 * Validates if a URL is a valid 3D model URL
 * @param url - The URL to validate
 * @returns true if URL is valid and points to a 3D model file
 */
export const isValid3DModelUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string") return false;

  // Check if it starts with http/https
  const isHttpUrl = url.startsWith("http://") || url.startsWith("https://");
  if (!isHttpUrl) return false;

  // Check if URL contains common 3D model file extensions
  const urlLower = url.toLowerCase();
  const valid3DExtensions = [".glb", ".gltf"];
  const hasValid3DExtension = valid3DExtensions.some((ext) =>
    urlLower.includes(ext)
  );

  return hasValid3DExtension;
};

/**
 * Validates if model3D field should be displayed
 * @param model3D - The model3D value from database
 * @returns true if model should be displayed
 */
export const shouldDisplay3DModel = (
  model3D: string | null | undefined
): boolean => {
  return isValid3DModelUrl(model3D);
};
