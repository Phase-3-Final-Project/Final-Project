"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";

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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
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
