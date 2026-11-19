"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LegaseeLogo } from "@/components/LegaseeLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin(loginEmail: string, loginPassword: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sign in failed");
      }
      router.push(data.redirectTo || "/family/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitLogin(email, password);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-5">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <LegaseeLogo href="/" size="lg" />
          <h1 className="font-editorial text-3xl text-[#202020] mt-6">
            Welcome back
          </h1>
          <p className="text-sm text-[#77746F] mt-1.5">
            Sign in to manage your memorial film project or partner account.
          </p>
        </div>

        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#F1EFE9] border border-[#B68C55]/40 text-xs text-[#202020]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#77746F]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#77746F] hover:text-[#202020]"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#77746F]">
            New to Jukira?{" "}
            <Link
              href="/register"
              className="text-[#202020] font-medium underline underline-offset-2"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Demo role quick-login for testing */}
        <div className="mt-6 bg-[#F1EFE9] border border-[#E8E6E0] rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#77746F] mb-3 text-center">
            Demo Accounts (Quick Sign-In)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                submitLogin("claire.bennett@example.com", "FamilyDemo2026!")
              }
              className="px-3 py-2 rounded-lg bg-white border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F8F7F3]"
            >
              Family Owner
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                submitLogin("partners@oakwoodfunerals.com", "PartnerDemo2026!")
              }
              className="px-3 py-2 rounded-lg bg-white border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F8F7F3]"
            >
              Funeral Home
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                submitLogin("admin@jukira.life", "JukiraAdmin2026!")
              }
              className="px-3 py-2 rounded-lg bg-white border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F8F7F3]"
            >
              Administrator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
