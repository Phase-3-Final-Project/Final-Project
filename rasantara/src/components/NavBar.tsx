"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { IoHome } from "react-icons/io5";
import { GiSelfLove } from "react-icons/gi";
import { IoLogIn } from "react-icons/io5";
import { IoLogOut } from "react-icons/io5";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const cookies = document.cookie.split("; ");
      const authCookie = cookies.find(cookie => cookie.startsWith("Authorization="));
      setIsLoggedIn(!!authCookie);
    };

    checkLogin();
  }, []);

  const handleLogout = () => {
    document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-transparent flex flex-col px-8 h-24 pb-2 justify-between md:flex-row items-center">
      <div className="flex items-center space-x-6 md:space-x-8">
        <Link href="/" className="block">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-18 w-auto object-contain rounded-xl border border-gray-300"
            style={{ maxWidth: 94 }}
          />
        </Link>
        <Link
            href="/"
            className="flex flex-col items-center text-[#5C4033] hover:text-black"
          >
            <IoHome />
            <p>Home</p>
          </Link>
        <Link
          href="/wishlist"
          className="flex flex-col items-center text-[#5C4033] hover:text-black"
        >
          <GiSelfLove />
          <p>Wishlist</p>
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
            onClick={handleLogout}
            className="flex items-center space-x-1 text-sm text-[#5C4033] hover:text-red-500 font-bold"
          >
            <IoLogOut />
            <span>Logout</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center space-x-1 text-sm text-[#5C4033] hover:text-black font-bold"
          >
            <IoLogIn />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}