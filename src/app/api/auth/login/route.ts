import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import type { UserRole } from "@/lib/types";

export async function POST(request: Request) {
  try {
    ensureSeeded();
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const user = db
      .prepare("SELECT * FROM users WHERE LOWER(email) = ?")
      .get(email) as
      | {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          role: UserRole;
          account_status: string;
          funeral_home_id: string | null;
        }
      | undefined;

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.account_status === "SUSPENDED") {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    if (user.account_status === "PENDING") {
      return NextResponse.json(
        {
          error:
            "Your partner account is awaiting administrator approval before sign-in.",
        },
        { status: 403 }
      );
    }

    await setSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      funeralHomeId: user.funeral_home_id,
    });

    recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "USER_LOGIN",
      targetType: "user",
      targetId: user.id,
    });

    const redirectTo =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.role === "FUNERAL_HOME"
        ? "/partners/dashboard"
        : "/family/dashboard";

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
