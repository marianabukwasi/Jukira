import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getSession } from "@/lib/auth";
import { canAccessProject } from "@/lib/access";
import { storage, verifyExpiringDownloadToken } from "@/lib/storage";
import type { MediaRecord, ProjectRecord } from "@/lib/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> }
) {
  ensureSeeded();
  const { mediaId } = await context.params;
  const db = getDb();

  const media = db
    .prepare("SELECT * FROM media WHERE id = ?")
    .get(mediaId) as unknown as MediaRecord | undefined;

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(media.project_id) as unknown as ProjectRecord | undefined;

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const download = url.searchParams.get("download") === "1";

  let authorized = false;
  if (token) {
    const verified = verifyExpiringDownloadToken(token);
    if (
      verified &&
      verified.projectId === project.id &&
      verified.kind === "media" &&
      verified.targetId === media.id
    ) {
      authorized = true;
    }
  } else {
    const user = await getSession();
    if (user && canAccessProject(user, project)) {
      // Funeral homes only see what is needed to manage projects unless admin/family
      if (user.role === "ADMIN" || user.role === "FAMILY_OWNER") {
        authorized = true;
      }
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let fileBuffer: Buffer | null = null;
  if (media.storage_key.startsWith("public:")) {
    const rel = media.storage_key.replace("public:", "").replace(/^\/+/, "");
    const publicPath = path.join(process.cwd(), "public", rel);
    if (fs.existsSync(publicPath)) {
      fileBuffer = fs.readFileSync(publicPath);
    }
  } else {
    fileBuffer = await storage.readFile(media.storage_key);
  }

  if (!fileBuffer) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": media.mime_type || "application/octet-stream",
    "Cache-Control": "private, max-age=300",
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${media.original_filename.replace(/"/g, "")}"`;
  }

  return new NextResponse(new Uint8Array(fileBuffer), { headers });
}
