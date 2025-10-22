"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { ImSpoonKnife } from "react-icons/im";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) throw result;
      toast.success("Login Success!");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

      console.log(result, "Login Success");
    } catch (err) {
      console.error((err as Error).message);
      toast.error((err as Error).message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5EB] flex flex-col pt-32 pb-16">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 mb-50">
        <div className="w-full max-w-md">
          <h1 className="text-black font-bold text-center mb-3 mt-4">LOGIN</h1>
          <form 
          onSubmit={handleSubmit}
          action="#"
          method="POST"
          className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#D35400] hover:bg-[#E0A106] text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <ImSpoonKnife className="inline-block mr-1" />
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F9F5EB] text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full bg-[#E0A106] border border-gray-300 text-white py-2 px-4 rounded-md hover:bg-[#D35400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Sign in with Google</span>
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-black underline hover:text-[#E0A106]"
            >
              Register here!
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
