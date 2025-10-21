import Link from "next/link";
import { IoHome } from "react-icons/io5";
import { IoIosPeople } from "react-icons/io";

export default function Footer() {
  return (
    <footer className="bg-[#FAFAFA] py-6 px-4 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-8 mb-6">
          {/* Branding Section */}
          <div className="flex flex-col items-center sm:items-start space-y-2 flex-1">
            <h3 className="text-lg font-bold text-[#5C4033]">Rasantara</h3>
            <p className="text-sm text-gray-600 text-center sm:text-left max-w-xs">
              Explore the richness of Indonesian cuisine through interactive 3D technology
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 flex-1 sm:justify-center">
            <div className="flex flex-col items-center sm:items-start space-y-2">
              <h4 className="font-semibold text-[#5C4033] text-sm mb-1">Menu</h4>
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-[#5C4033] transition-colors text-sm"
              >
                <IoHome className="text-base" />
                <span>Home</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 text-gray-600 hover:text-[#5C4033] transition-colors text-sm"
              >
                <IoIosPeople className="text-base" />
                <span>About Us</span>
              </Link>
            </div>
          </div>

          {/* Contact/Info Section */}
          <div className="flex flex-col items-center sm:items-start space-y-2 flex-1 sm:justify-end">
            <h4 className="font-semibold text-[#5C4033] text-sm mb-1">Connect</h4>
            <p className="text-xs text-gray-500 text-center sm:text-left">
              h8.rmt.065@gmail.com
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 text-xs text-gray-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Rasantara. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}