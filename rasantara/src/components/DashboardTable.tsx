"use client";

import { useState } from "react";
import View3DModal from "./View3DModal";

interface FoodData {
  _id: string;
  name: string;
  origin: {
    province: string;
    island: string;
    city_or_region: string;
  };
  category?: string;
  course?: string;
  model3D?: string;
}

interface DashboardTableProps {
  foods: FoodData[];
  currentPage: number;
  itemsPerPage: number;
}

export default function DashboardTable({
  foods,
  currentPage,
  itemsPerPage,
}: DashboardTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);

  const totalPages = Math.ceil(foods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = foods.slice(startIndex, endIndex);

  const handleView3D = (food: FoodData) => {
    setSelectedFood(food);
    setModalOpen(true);
  };

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-[#7C3E2A] text-white">
              <th className="text-center py-3 px-4 text-base">No</th>
              <th className="py-3 px-4 text-base">Nama Makanan</th>
              <th className="py-3 px-4 text-base">Asal Makanan</th>
              <th className="py-3 px-4 text-base">Category</th>
              <th className="text-center py-3 px-4 text-base">Model 3D</th>
              <th className="text-center py-3 px-4 text-base">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((food, index) => {
              const hasValid3DModel =
                food.model3D && food.model3D.startsWith("http");
              const originText =
                typeof food.origin === "object"
                  ? food.origin.city_or_region || food.origin.province
                  : "Unknown";
              const categoryText =
                food.category || food.course || "Uncategorized";

              return (
                <tr
                  key={food._id}
                  className="hover:bg-[#FFF8F0] border-b border-gray-100"
                >
                  <td className="text-center py-3 px-4 text-base">
                    {startIndex + index + 1}
                  </td>
                  <td className="font-semibold text-black py-3 px-4 text-base">
                    {food.name}
                  </td>
                  <td className="text-gray-700 py-3 px-4 text-base">
                    <span className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {originText}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-base">
                    <span className="px-2.5 py-1 rounded-full text-base font-medium text-black">
                      {categoryText}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    {hasValid3DModel ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-semibold">
                        ✓ True
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-semibold">
                        ✗ False
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex gap-1.5 justify-center items-center">
                      {hasValid3DModel && (
                        <button
                          onClick={() => handleView3D(food)}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded flex items-center gap-1 transition-colors"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View 3D
                        </button>
                      )}
                      <button className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded flex items-center gap-1 transition-colors">
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Update
                      </button>
                      <button className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded flex items-center gap-1 transition-colors">
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
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-between items-center">
        {/* Info */}
        <div className="text-xs text-gray-600">
          Menampilkan <span className="font-semibold">{startIndex + 1}</span> -{" "}
          <span className="font-semibold">
            {Math.min(endIndex, foods.length)}
          </span>{" "}
          dari <span className="font-semibold">{foods.length}</span> data
        </div>

        {/* Pagination */}
        <div className="flex gap-0">
          <a
            href={`?page=${currentPage - 1}`}
            className={`px-3 py-1 border border-gray-300 bg-white text-sm ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            «
          </a>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`?page=${page}`}
              className={`px-3 py-1 border-t border-b border-r border-gray-300 text-sm ${
                page === currentPage
                  ? "bg-[#7C3E2A] text-white font-semibold"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </a>
          ))}
          <a
            href={`?page=${currentPage + 1}`}
            className={`px-3 py-1 border-t border-b border-r border-gray-300 bg-white text-sm ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            »
          </a>
        </div>
      </div>

      {/* 3D Modal */}
      {selectedFood && (
        <View3DModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          modelUrl={selectedFood.model3D || ""}
          foodName={selectedFood.name}
        />
      )}
    </>
  );
}
