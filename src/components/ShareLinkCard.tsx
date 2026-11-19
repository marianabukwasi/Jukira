"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, QrCode, Share2 } from "lucide-react";

interface ShareLinkCardProps {
  projectId: string;
  secureToken: string;
  deceasedName: string;
}

export function ShareLinkCard({
  projectId,
  secureToken,
  deceasedName,
}: ShareLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/contribute/${secureToken}`
      : `/contribute/${secureToken}`;

  const messageText = `We are creating a Jukira memorial film celebrating the life of ${deceasedName}. If you have photographs or videos to share, please add them here: ${shareUrl}`;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({
        title: `Celebrate the life of ${deceasedName}`,
        text: messageText,
        url: shareUrl,
      });
    } else {
      copyLink();
    }
  }

  return (
    <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="font-editorial text-xl text-[#202020]">
          Private Contribution Link
        </h3>
        <p className="text-xs text-[#77746F] mt-1">
          Share this link with family and friends. No account is required to
          upload photographs or videos.
        </p>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F7F3] border border-[#E8E6E0]">
        <code className="text-xs text-[#202020] truncate flex-1 px-1">
          {shareUrl}
        </code>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] text-white text-xs font-medium shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(messageText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F1EFE9]"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#718875]" />
          <span>WhatsApp</span>
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(
            `Share memories of ${deceasedName}`
          )}&body=${encodeURIComponent(messageText)}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F1EFE9]"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email</span>
        </a>
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F1EFE9]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
        <button
          type="button"
          onClick={() => setShowQr((s) => !s)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E8E6E0] text-xs font-medium text-[#202020] hover:bg-[#F1EFE9]"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{showQr ? "Hide QR" : "QR Code"}</span>
        </button>
      </div>

      {showQr && (
        <div className="pt-3 border-t border-[#E8E6E0] flex flex-col sm:flex-row items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/projects/${projectId}/qrcode`}
            alt="Contribution QR Code"
            className="w-36 h-36 rounded-xl border border-[#E8E6E0] bg-white p-1"
          />
          <div className="text-xs text-[#77746F] space-y-2">
            <p>
              Print or display this QR code on order-of-service cards so guests
              can scan and contribute memories from their phones.
            </p>
            <a
              href={`/api/projects/${projectId}/qrcode`}
              download={`jukira-qr-${secureToken}.svg`}
              className="inline-block underline text-[#202020] font-medium"
            >
              Download QR Code (SVG)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
