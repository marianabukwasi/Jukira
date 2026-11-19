"use client";

import { useState } from "react";
import { Flag, Flower2 } from "lucide-react";
import type { DigitalFlowerRecord } from "@/lib/types";

const FLOWER_OPTIONS = [
  { name: "White Rose", price: "$1.50" },
  { name: "Ivory Lily", price: "$1.50" },
  { name: "Forget-Me-Not Bouquet", price: "$2.00" },
  { name: "Olive & Laurel Wreath", price: "$2.00" },
  { name: "Sunlit Daisy Posy", price: "$1.25" },
];

export function GraveTributesAndChallenge({
  plotId,
  allowFlowers,
  initialFlowers,
}: {
  plotId: string;
  allowFlowers: boolean;
  initialFlowers: DigitalFlowerRecord[];
}) {
  const [flowers, setFlowers] = useState(initialFlowers);
  const [selectedFlower, setSelectedFlower] = useState(FLOWER_OPTIONS[0].name);
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [flowerMsg, setFlowerMsg] = useState("");
  const [flowerNotice, setFlowerNotice] = useState("");

  const [showChallenge, setShowChallenge] = useState(false);
  const [challengerName, setChallengerName] = useState("");
  const [challengerEmail, setChallengerEmail] = useState("");
  const [reason, setReason] = useState("DUPLICATE");
  const [details, setDetails] = useState("");
  const [challengeNotice, setChallengeNotice] = useState("");

  async function placeFlower(e: React.FormEvent) {
    e.preventDefault();
    setFlowerNotice("");
    const res = await fetch(`/api/garden/${plotId}/flowers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flowerType: selectedFlower,
        senderName,
        isAnonymous,
        message: flowerMsg,
      }),
    });
    const data = await res.json();
    if (res.ok && data.flower) {
      setFlowers((prev) => [data.flower, ...prev]);
      setFlowerMsg("");
      setFlowerNotice(`${selectedFlower} placed at the resting place.`);
    } else {
      setFlowerNotice(data.error || "Unable to place flower.");
    }
  }

  async function submitChallenge(e: React.FormEvent) {
    e.preventDefault();
    setChallengeNotice("");
    const res = await fetch(`/api/garden/${plotId}/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengerName,
        challengerEmail,
        reason,
        details,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setChallengeNotice(data.message);
      setDetails("");
    } else {
      setChallengeNotice(data.error || "Unable to submit challenge.");
    }
  }

  return (
    <div className="space-y-8">
      {allowFlowers && (
        <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-[#718875]" />
            <h3 className="font-editorial text-2xl text-[#202020]">
              Place Digital Flowers
            </h3>
          </div>
          <p className="text-xs text-[#77746F]">
            Digital flowers are placed at the resting place and gently fade over
            30 days. You may place flowers with your name or anonymously.
          </p>

          {flowerNotice && (
            <div className="p-3 rounded-xl bg-[#F1EFE9] border border-[#E8E6E0] text-xs text-[#202020]">
              {flowerNotice}
            </div>
          )}

          <form onSubmit={placeFlower} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FLOWER_OPTIONS.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setSelectedFlower(f.name)}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                    selectedFlower === f.name
                      ? "bg-[#242424] text-white border-[#242424]"
                      : "bg-[#F8F7F3] text-[#202020] border-[#E8E6E0]"
                  }`}
                >
                  <p className="font-medium">{f.name}</p>
                  <p
                    className={
                      selectedFlower === f.name
                        ? "text-white/75"
                        : "text-[#77746F]"
                    }
                  >
                    {f.price}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                disabled={isAnonymous}
                placeholder={
                  isAnonymous ? "Placing anonymously" : "Your Name (optional)"
                }
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-xs disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="Short tribute note (optional)"
                value={flowerMsg}
                onChange={(e) => setFlowerMsg(e.target.value)}
                className="px-3.5 py-2.5 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-[#77746F]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#242424]"
                />
                <span>Leave flowers anonymously</span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#242424] text-white text-xs font-medium hover:bg-[#383838]"
              >
                Place {selectedFlower}
              </button>
            </div>
          </form>

          {flowers.length > 0 && (
            <div className="pt-4 border-t border-[#E8E6E0] space-y-2">
              <p className="text-xs font-medium text-[#77746F]">
                Recent Flowers Placed ({flowers.length})
              </p>
              <div className="divide-y divide-[#E8E6E0] text-xs">
                {flowers.slice(0, 6).map((f) => (
                  <div
                    key={f.id}
                    className="py-2 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-medium text-[#202020]">
                        {f.flower_type}
                      </span>{" "}
                      <span className="text-[#77746F]">
                        •{" "}
                        {f.is_anonymous
                          ? "Anonymous visitor"
                          : f.sender_name || "Visitor"}
                        {f.message ? ` — "${f.message}"` : ""}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#77746F] shrink-0">
                      {new Date(f.placed_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Challenge This Memorial */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowChallenge((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs text-[#77746F] hover:text-[#202020] underline underline-offset-2"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Challenge This Memorial / Report Dispute</span>
        </button>

        {showChallenge && (
          <form
            onSubmit={submitChallenge}
            className="mt-4 text-left bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-3 max-w-xl mx-auto"
          >
            <h4 className="font-editorial text-lg text-[#202020]">
              Submit a Registry Challenge
            </h4>
            {challengeNotice && (
              <p className="p-3 rounded-xl bg-[#F1EFE9] text-xs text-[#202020]">
                {challengeNotice}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Name *"
                value={challengerName}
                onChange={(e) => setChallengerName(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-xs"
              />
              <input
                type="email"
                required
                placeholder="Your Email *"
                value={challengerEmail}
                onChange={(e) => setChallengerEmail(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-xs"
              />
            </div>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-xs"
            >
              <option value="DUPLICATE">Duplicate memorial</option>
              <option value="UNAUTHORISED">Creator is not authorised</option>
              <option value="WRONG_PERSON">Memorial belongs to someone else</option>
              <option value="INACCURATE">Information is inaccurate</option>
              <option value="INAPPROPRIATE">Inappropriate or unauthorised material</option>
              <option value="OWNERSHIP_TRANSFER">Request ownership transfer</option>
            </select>
            <textarea
              rows={3}
              required
              placeholder="Explain the issue or your relationship to the deceased..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8E6E0] bg-[#F8F7F3] text-xs"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#242424] text-white text-xs font-medium"
            >
              Submit Challenge for Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
