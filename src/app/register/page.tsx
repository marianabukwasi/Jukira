"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LegaseeLogo } from "@/components/LegaseeLogo";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "FUNERAL_HOME"
      ? "FUNERAL_HOME"
      : "FAMILY_OWNER";

  const [role, setRole] = useState<"FAMILY_OWNER" | "FUNERAL_HOME">(initialRole);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("EU");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name,
          businessName,
          country,
          email,
          telephone,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      if (data.pendingApproval) {
        setPendingMessage(data.message);
      } else {
        router.push(data.redirectTo || "/family/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7 sm:p-8 shadow-xs">
      {pendingMessage ? (
        <div className="text-center py-6 space-y-4">
          <h2 className="font-editorial text-2xl text-[#202020]">
            Partner Request Received
          </h2>
          <p className="text-sm text-[#77746F]">{pendingMessage}</p>
          <Link
            href="/"
            className="inline-flex px-6 py-2.5 rounded-full bg-[#242424] text-white text-sm font-medium"
          >
            Return Home
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F1EFE9]">
            <button
              type="button"
              onClick={() => setRole("FAMILY_OWNER")}
              className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                role === "FAMILY_OWNER"
                  ? "bg-white text-[#202020] shadow-xs"
                  : "text-[#77746F]"
              }`}
            >
              For a Family
            </button>
            <button
              type="button"
              onClick={() => setRole("FUNERAL_HOME")}
              className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                role === "FUNERAL_HOME"
                  ? "bg-white text-[#202020] shadow-xs"
                  : "text-[#77746F]"
              }`}
            >
              Funeral Home Partner
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#F1EFE9] border border-[#B68C55]/40 text-xs text-[#202020]">
              {error}
            </div>
          )}

          {role === "FUNERAL_HOME" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                  Funeral Home Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                  Country / Pricing Market
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
                >
                  <option value="EU">Europe (EUR)</option>
                  <option value="UK">United Kingdom (GBP)</option>
                  <option value="US">United States (USD)</option>
                  <option value="UG">Uganda (UGX)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Telephone (optional)
            </label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77746F] mb-1.5">
              Password (minimum 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] disabled:opacity-60 transition-colors"
          >
            {loading
              ? "Creating account..."
              : role === "FUNERAL_HOME"
              ? "Request Partner Account"
              : "Create Family Account"}
          </button>

          <p className="mt-4 text-center text-xs text-[#77746F]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#202020] font-medium underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-5">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <LegaseeLogo href="/" size="lg" />
          <h1 className="font-editorial text-3xl text-[#202020] mt-6">
            Create your account
          </h1>
          <p className="text-sm text-[#77746F] mt-1.5">
            Contributors never need an account, only project owners and
            funeral home partners.
          </p>
        </div>
        <Suspense fallback={<div className="h-64 bg-white rounded-2xl" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
