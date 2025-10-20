import Link from "next/link";
import { SlHome } from "react-icons/sl";
import { IoIosPeople } from "react-icons/io";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] py-4 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-3 text-sm text-gray-600">
        {/* Links */}
        <div className="flex space-x-4">
          <Link href="/" className=" text-[#5C4033] hover:text-black">
            <SlHome />
          </Link>
          <span>|</span>
          <Link href="/products" className=" text-[#5C4033] hover:text-black">
            <IoIosPeople />
          </Link>
        </div>
        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mt-2">
          <p>© 2025 Rasantara</p>
        </div>
      </div>
    </footer>
  );
}