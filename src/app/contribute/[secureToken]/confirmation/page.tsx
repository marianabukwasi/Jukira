import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LegaseeLogo } from "@/components/LegaseeLogo";

export default async function ContributeConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ secureToken: string }>;
  searchParams: Promise<{ count?: string; name?: string }>;
}) {
  const { secureToken } = await params;
  const sp = await searchParams;
  const count = Number(sp.count || "1");
  const name = sp.name || "Friend";

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202020] flex flex-col">
      <header className="border-b border-[#E8E6E0] bg-[#F8F7F3] px-5 py-4 flex items-center justify-center">
        <LegaseeLogo href="/" size="md" />
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="max-w-md w-full bg-white border border-[#E8E6E0] rounded-2xl p-8 sm:p-10 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-[#718875]/15 text-[#718875] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="font-editorial text-3xl text-[#202020]">
            Thank you for sharing your memories.
          </h1>
          <p className="text-sm text-[#77746F] leading-relaxed">
            Thank you, {name}. Your contribution ({count}{" "}
            {count === 1 ? "item" : "items"}) has been received and will be
            included in the family’s collection.
          </p>

          <div className="pt-3 flex flex-col gap-3">
            <Link
              href={`/contribute/${secureToken}/upload`}
              className="w-full py-3 rounded-full bg-[#242424] text-white text-sm font-medium hover:bg-[#383838]"
            >
              Add More Photographs or Videos
            </Link>
            <Link
              href={`/contribute/${secureToken}`}
              className="w-full py-3 rounded-full border border-[#E8E6E0] text-sm font-medium text-[#202020] hover:bg-[#F1EFE9]"
            >
              Return to Memorial Page
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
