import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";
import { getAllPricingConfigs } from "@/lib/pricing";

export async function GET(request: Request) {
  ensureSeeded();
  const configs = getAllPricingConfigs();
  const countryHeader =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    "";
  const acceptLang = request.headers.get("accept-language") || "";

  let detectedMarket = "EU";
  const c = countryHeader.toUpperCase();
  if (c === "UG") detectedMarket = "UG";
  else if (c === "GB" || c === "UK") detectedMarket = "UK";
  else if (c === "US") detectedMarket = "US";
  else if (acceptLang.includes("en-GB")) detectedMarket = "UK";
  else if (acceptLang.includes("en-US")) detectedMarket = "US";

  return NextResponse.json({ detectedMarket, configs });
}
