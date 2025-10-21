"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSession, signOut } from "next-auth/react";
import { IoHome } from "react-icons/io5";
import { GiSelfLove } from "react-icons/gi";
import { IoLogIn } from "react-icons/io5";
import { IoLogOut } from "react-icons/io5";
import { RiDashboardFill } from "react-icons/ri";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession(); // NextAuth session untuk Google Sign-In
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const checkLoginAndRole = async () => {
      // Check untuk NextAuth session (Google Sign-In)
      if (status === "authenticated" && session) {
        setIsLoggedIn(true);

        // Sync session dengan Authorization cookie
        try {
          await fetch("/api/auth/sync");
        } catch (error) {
          console.error("Error syncing session:", error);
        }

        // Get role from session atau fetch dari API
        const role = (session as any).user?.role;
        if (role) {
          setUserRole(role);
        } else {
          // Fallback: fetch dari API
          try {
            const response = await fetch("/api/user/me");
            if (response.ok) {
              const data = await response.json();
              setUserRole(data.user?.role || null);
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
          }
        }
        return;
      }

      // Check untuk cookie-based auth (login biasa)
      const cookies = document.cookie.split("; ");
      const authCookie = cookies.find((cookie) =>
        cookie.startsWith("Authorization=")
      );
      setIsLoggedIn(!!authCookie);

      if (authCookie) {
        try {
          const response = await fetch("/api/user/me");
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.user?.role || null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUserRole(null);
      }
    };

    checkLoginAndRole();
  }, [session, status]);

  const handleLogout = async () => {
    // Check if logged in via NextAuth (Google)
    if (status === "authenticated") {
      // Clear Authorization cookie
      document.cookie =
        "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      await signOut({ callbackUrl: "/" });
      toast.success("Logged out successfully");
    } else {
      // Cookie-based logout (login biasa)
      document.cookie =
        "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsLoggedIn(false);
      setUserRole(null);
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white/30 backdrop-blur-md border-b border-white/20 flex flex-col px-8 h-24 pb-2 justify-between md:flex-row items-center">
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
        {userRole === "admin" ? (
          <Link
            href="/admin"
            className="flex flex-col items-center text-sm text-[#5C4033] hover:text-black font-bold"
          >
            <RiDashboardFill />
            <p>CMS</p>
          </Link>
        ) : (
          <div
            className="flex flex-col items-center text-sm text-gray-400 cursor-not-allowed opacity-50"
            title="Hanya admin yang dapat mengakses CMS"
          >
            <RiDashboardFill />
            <p>CMS</p>
          </div>
        )}
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
          <>
            {isLoginPage ? (
              <div
                className="flex items-center space-x-1 text-sm text-gray-400 cursor-not-allowed opacity-50"
                title="Anda sudah berada di halaman login"
              >
                <IoLogIn />
                <span>Login</span>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1 text-sm text-[#5C4033] hover:text-black font-bold"
              >
                <IoLogIn />
                <span>Login</span>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
