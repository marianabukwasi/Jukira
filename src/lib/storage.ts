import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const UPLOADS_ROOT = path.join(process.cwd(), ".data", "uploads");
const DOWNLOAD_SECRET =
  process.env.LEGASEE_SECRET || "jukira-local-dev-secret-change-in-production";

export interface StorageProvider {
  saveFile(
    projectId: string,
    filename: string,
    buffer: Buffer,
    subfolder?: string
  ): Promise<string>;
  readFile(storageKey: string): Promise<Buffer | null>;
  getFilePath(storageKey: string): string;
  deleteFile(storageKey: string): Promise<void>;
  getStorageUsageBytes(): Promise<number>;
}

function sanitizeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]/g, "_");
}

class LocalStorageProvider implements StorageProvider {
  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async saveFile(
    projectId: string,
    filename: string,
    buffer: Buffer,
    subfolder = "originals"
  ): Promise<string> {
    const safeProject = sanitizeSegment(projectId);
    const safeSub = sanitizeSegment(subfolder);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${sanitizeSegment(filename)}`;
    const relKey = path.posix.join(safeProject, safeSub, uniqueName);
    const fullPath = path.join(UPLOADS_ROOT, safeProject, safeSub, uniqueName);
    this.ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, buffer);
    return relKey;
  }

  getFilePath(storageKey: string): string {
    const normalized = path.normalize(storageKey).replace(/^(\.\.[/\\])+/, "");
    return path.join(UPLOADS_ROOT, normalized);
  }

  async readFile(storageKey: string): Promise<Buffer | null> {
    const fullPath = this.getFilePath(storageKey);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath);
  }

  async deleteFile(storageKey: string): Promise<void> {
    const fullPath = this.getFilePath(storageKey);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async getStorageUsageBytes(): Promise<number> {
    if (!fs.existsSync(UPLOADS_ROOT)) return 0;
    let total = 0;
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else total += fs.statSync(full).size;
      }
    };
    walk(UPLOADS_ROOT);
    return total;
  }
}

export const storage: StorageProvider = new LocalStorageProvider();

export function createExpiringDownloadToken(
  payload: { projectId: string; kind: "film" | "shorter" | "raw" | "media"; targetId?: string },
  expiresInSeconds = 3600
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const data = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const sig = crypto
    .createHmac("sha256", DOWNLOAD_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyExpiringDownloadToken(token: string): {
  projectId: string;
  kind: "film" | "shorter" | "raw" | "media";
  targetId?: string;
  exp: number;
} | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = crypto
      .createHmac("sha256", DOWNLOAD_SECRET)
      .update(data)
      .digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
