"use client";

import { useRef } from "react";

interface PhotoUploadProps {
  photoFile: File | null;
  photoPreview: string;
  photoUrl: string;
  onFileChange: (file: File | null, preview: string) => void;
  onUrlChange: (url: string) => void;
}

export default function PhotoUpload({
  photoFile,
  photoPreview,
  photoUrl,
  onFileChange,
  onUrlChange,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      {/* Preview */}
      {(photoPreview || photoUrl) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Photo preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
          )}
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Photo URL preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
          )}
        </div>
      )}
    </div>
  );
}
