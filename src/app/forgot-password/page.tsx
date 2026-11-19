"use client";

import { useState } from "react";
import Link from "next/link";
import { LegaseeLogo } from "@/components/LegaseeLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-5">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <LegaseeLogo href="/" size="lg" />
          <h1 className="font-editorial text-3xl text-[#202020] mt-6">
            Reset your password
          </h1>
          <p className="text-sm text-[#77746F] mt-1.5">
            Enter the email address associated with your Jukira account.
          </p>
        </div>

        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-7 sm:p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-[#202020]">
                If an account exists for <strong>{email}</strong>, password
                reset instructions have been sent.
              </p>
              <Link
                href="/login"
                className="inline-flex px-6 py-2.5 rounded-full bg-[#242424] text-white text-sm font-medium"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
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
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
              >
                Send Reset Link
              </button>
              <p className="text-center text-xs text-[#77746F]">
                <Link href="/login" className="hover:text-[#202020]">
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
