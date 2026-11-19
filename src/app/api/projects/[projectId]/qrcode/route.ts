import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/access";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  ensureSeeded();
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await context.params;
  const project = getAuthorizedProject(user, projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const url = `${origin}/contribute/${project.secure_token}`;
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 2,
    color: { dark: "#202020", light: "#FFFFFF" },
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
