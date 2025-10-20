export default function Sidebar() {
  return (
    <aside className="w-72 sticky top-0 self-start max-h-screen bg-[#FAFAFA] text-[#5C4033] border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-[#5C4033]">
          Admin Panel
        </h2>
        <p className="text-sm text-[#8B6F47] mt-1">Rasantara Dashboard</p>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 flex-1 overflow-y-auto">
        <ul className="space-y-2 px-4">
          {/* Dashboard */}
          <li>
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#F9F5EB] transition-all duration-200 group"
            >
              <svg
                className="w-6 h-6 text-[#8B6F47] group-hover:text-[#5C4033] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-bold text-sm">Dashboard</span>
            </a>
          </li>

          {/* Add Product */}
          <li>
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#F9F5EB] transition-all duration-200 group"
            >
              <svg
                className="w-6 h-6 text-[#8B6F47] group-hover:text-[#5C4033] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="font-bold text-sm">Add Product</span>
            </a>
          </li>

          {/* Image to 3D */}
          <li>
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#F9F5EB] transition-all duration-200 group"
            >
              <svg
                className="w-6 h-6 text-[#8B6F47] group-hover:text-[#5C4033] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-bold text-sm">Image to 3D</span>
            </a>
          </li>

          {/* Map */}
          <li>
            <a
              href="#"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#F9F5EB] transition-all duration-200 group"
            >
              <svg
                className="w-6 h-6 text-[#8B6F47] group-hover:text-[#5C4033] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <span className="font-bold text-sm">Map</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}