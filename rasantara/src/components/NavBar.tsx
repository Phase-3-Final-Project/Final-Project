"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  return (
    <div className="bg-[#FAFAFA] flex flex-wrap gap-4 md:gap-6 justify-between items-center p-4 border-b border-gray-200">
      <div className="flex items-center space-x-6 md:space-x-8">
        <Link href="/" className="block">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-18 w-auto object-contain rounded-xl"
            style={{ maxWidth: 94 }}
          />
        </Link>
        <Link
          href="/"
          className="text-sm text-[#5C4033] hover:text-black font-bold"
        >
          Home
        </Link>
        <Link
          href="/wishlist"
          className="text-sm text-[#5C4033] hover:text-black font-bold"
        >
          Wishlist
        </Link>
        <a
          href="/API"
          className="text-sm text-[#5C4033] hover:text-black font-bold cursor-pointer"
        >
          API
        </a>
      </div>
      <div className="flex space-x-4 items-center">
        {isLoggedIn ? (
          <button
            className="text-sm text-[#5C4033] hover:text-black font-bold"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm text-[#5C4033] hover:text-black font-bold"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}