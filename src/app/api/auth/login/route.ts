import { NextRequest, NextResponse } from "next/server";
import { verifyUserCredentials, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { db, schema } from "@/db";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password format", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await verifyUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Record audit log
    try {
      await db.insert(schema.auditLogs).values({
        userId: user.userId,
        userEmail: user.email,
        action: "login",
        module: "users",
        entityId: String(user.userId),
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: req.headers.get("user-agent") || "unknown",
        details: JSON.stringify({ role: user.role, timestamp: new Date().toISOString() }),
      });
    } catch (e) {
      console.error("Audit log error:", e);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    const isLocalhost = req.headers.get("host")?.includes("localhost") || req.headers.get("host")?.includes("127.0.0.1");
    const isSecure = process.env.NODE_ENV === "production" && !isLocalhost;

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
