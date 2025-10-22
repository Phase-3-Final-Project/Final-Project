"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DeleteButtonProps {
  foodId: string;
  foodName: string;
}

export default function DeleteButton({ foodId, foodName }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Show loading toast
    const loadingToast = toast.loading(`Menghapus ${foodName}...`);
    
    try {
      const response = await fetch(`/api/foods/${foodId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        // Dismiss loading and show success
        toast.dismiss(loadingToast);
        toast.success(`Berhasil menghapus ${foodName}! 🎉`, {
          duration: 3000,
          position: "top-center",
        });
        
        // Close modal first
        setShowConfirm(false);
        
        // Refresh the page to update the table
        setTimeout(() => {
          router.refresh();
        }, 500);
      } else {
        // Dismiss loading and show error
        toast.dismiss(loadingToast);
        toast.error(`Gagal menghapus: ${data.error || "Unknown error"}`, {
          duration: 4000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error deleting food:", error);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan saat menghapus data", {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white text-sm font-medium rounded flex items-center gap-1 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus <strong>{foodName}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-medium rounded transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
