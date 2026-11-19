"use client";

import { useState } from "react";
import Link from "next/link";
import { LegaseeLogo } from "@/components/LegaseeLogo";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("Family Support");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, inquiryType, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#202020]">
      <header className="border-b border-[#E8E6E0] bg-[#F8F7F3]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <LegaseeLogo href="/" />
          <Link
            href="/"
            className="text-sm text-[#77746F] hover:text-[#202020]"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 py-14 sm:py-20 px-5 sm:px-8">
        <div className="max-w-xl mx-auto bg-white border border-[#E8E6E0] rounded-2xl p-7 sm:p-10">
          <h1 className="font-editorial text-3xl text-[#202020] mb-2">
            Contact Jukira
          </h1>
          <p className="text-sm text-[#77746F] mb-6">
            Whether you are arranging a film for your family or inquiring about
            a funeral home partnership, we are here to help.
          </p>

          {status === "sent" ? (
            <div className="p-5 rounded-xl bg-[#F1EFE9] border border-[#E8E6E0] text-sm">
              <p className="font-medium text-[#202020] mb-1">
                Thank you for reaching out.
              </p>
              <p className="text-[#77746F]">
                We have received your message and will respond shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-xs text-[#B68C55] bg-[#F1EFE9] p-3 rounded-lg">
                  {error}
                </p>
              )}
              <div>
                <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                  Your Name
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
                  Inquiry Type
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
                >
                  <option>Family Support</option>
                  <option>Funeral Home Partnership</option>
                  <option>Custom Film Duration Quote</option>
                  <option>Privacy &amp; Data Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#77746F] mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-sm focus:outline-none focus:border-[#242424]"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838] disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
