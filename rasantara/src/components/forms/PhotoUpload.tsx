"use client";

import { useRef, useState } from "react";

interface PhotoUploadProps {
  photoFile: File | null;
  photoPreview: string;
  photoUrl: string;
  onFileChange: (file: File | null, preview: string) => void;
  onUrlChange: (url: string) => void;
  upgradedImageUrl?: string;
  onUpgradedImageChange?: (url: string) => void;
}

export default function PhotoUpload({
  photoFile,
  photoPreview,
  photoUrl,
  onFileChange,
  onUrlChange,
  upgradedImageUrl,
  onUpgradedImageChange,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      onFileChange(f, URL.createObjectURL(f));
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleRemoveUpload = () => {
    onFileChange(null, "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpgradeImage = async () => {
    setUpgradeLoading(true);
    setUpgradeError(null);
    setUpgradeSuccess(false);

    try {
      let imageToUpgrade = "";
      
      // Priority: Use photoUrl if available
      if (photoUrl.trim()) {
        imageToUpgrade = photoUrl.trim();
      } 
      // If only local file without URL, upload it first
      else if (photoFile && photoPreview) {
        setUpgradeError("For local files, please also provide a public URL in the URL field below. ByteDance API requires publicly accessible image URLs.");
        setUpgradeLoading(false);
        return;
      } 
      else {
        setUpgradeError("No image available to upgrade. Please provide an image URL.");
        setUpgradeLoading(false);
        return;
      }

      // Call the upgrade API
      const response = await fetch("/api/upgrade-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageToUpgrade,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = data.error || "Failed to upgrade image";
        throw new Error(errorMsg);
      }

      if (data.upgradedImageUrl && onUpgradedImageChange) {
        onUpgradedImageChange(data.upgradedImageUrl);
        setUpgradeSuccess(true);
      } else {
        throw new Error("No upgraded image URL received");
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      setUpgradeError(error.message || "Failed to upgrade image");
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#5C4033] mb-2">
        Photo (upload or URL)
      </label>
      <button
        type="button"
        className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] transition-colors"
        onClick={handleUploadClick}
      >
        📤 Upload Photo
      </button>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
          placeholder="Paste photo URL..."
          value={photoUrl}
          onChange={(e) => onUrlChange(e.target.value)}
        />
        {photoFile && (
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
            onClick={handleRemoveUpload}
          >
            ✕ Remove Upload
          </button>
        )}
      </div>

      {/* Upgrade Image Button */}
      {(photoPreview || photoUrl) && (
        <div className="mt-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpgradeImage}
            disabled={upgradeLoading || !photoUrl.trim()}
          >
            {upgradeLoading ? (
              <>
                <span className="animate-spin">⚙️</span>
                Upgrading...
              </>
            ) : (
              <>
                ✨ Upgrade Image (AI Enhanced)
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            {!photoUrl.trim() && photoPreview ? (
              <>⚠️ Please provide an image URL below to enable upgrade feature. ByteDance API requires publicly accessible URLs.</>
            ) : (
              <>Note: Requires valid ByteDance ARK API key. Original image will be used if not upgraded.</>
            )}
          </p>
        </div>
      )}

      {/* Upgrade Status Messages */}
      {upgradeError && (
        <div className="mt-2 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <div className="font-semibold mb-1">❌ Image Upgrade Failed</div>
          <div className="text-xs whitespace-pre-wrap">{upgradeError}</div>
          {upgradeError.includes("Authentication") && (
            <div className="mt-2 text-xs">
              <a 
                href="/SETUP_IMAGE_UPGRADE.md" 
                target="_blank" 
                className="text-blue-600 underline hover:text-blue-800"
              >
                📖 See troubleshooting guide
              </a>
            </div>
          )}
        </div>
      )}
      {upgradeSuccess && upgradedImageUrl && (
        <div className="mt-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
          ✅ Image upgraded successfully! This enhanced image will be used for 3D generation.
        </div>
      )}

      {/* Preview */}
      {(photoPreview || photoUrl || upgradedImageUrl) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {photoPreview && (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Photo preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                Original
              </span>
            </div>
          )}
          {photoUrl && !photoPreview && (
            <div className="relative">
              <img
                src={photoUrl}
                alt="Photo URL preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                Original
              </span>
            </div>
          )}
          {upgradedImageUrl && (
            <div className="relative">
              <img
                src={upgradedImageUrl}
                alt="Upgraded photo"
                className="w-full h-32 object-cover rounded-lg border-2 border-emerald-400 shadow-lg"
              />
              <span className="absolute bottom-1 left-1 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded">
                ✨ Upgraded
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
