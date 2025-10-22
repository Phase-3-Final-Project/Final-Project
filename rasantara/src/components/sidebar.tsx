import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";

export default function Sidebar() {
  return (
    <aside className="w-72 fixed top-23 self-start h-[calc(100vh-4rem)] overflow-hidden bg-[#FAFAFA] text-[#5C4033] border-r border-[#FAFAFA] flex flex-col">
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
            <Link
              href="/admin/"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#F9F5EB] transition-all duration-200 group"
            >
              <MdOutlineDashboard className="w-6 h-6 text-[#8B6F47] group-hover:text-[#5C4033] transition-colors" />
              <span className="font-bold text-sm">Dashboard</span>
            </Link>
          </li>

          {/* Add Product */}
          <li>
            <Link
              href="/admin/add"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#F9F5EB] transition-all duration-200 group"
            >
              <IoAddCircleOutline className="w-6 h-6 text-[#8B6F47] group-hover:text-[#5C4033] transition-colors" />
              <span className="font-bold text-sm">Add Product</span>
            </Link>
          </li>

          {/* Image to 3D */}
          <li>
            <Link
              href="/admin/update"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#F9F5EB] transition-all duration-200 group"
            >
              <FaEdit className="w-6 h-6 text-[#8B6F47] group-hover:text-[#5C4033] transition-colors" />
              <span className="font-bold text-sm">Update</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}