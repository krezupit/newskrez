import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const acceptsJson = req.headers.get("accept")?.includes("application/json");

  // Determine redirect URL (fallback to /admin/login)
  const loginUrl = new URL("/admin/login", req.url);

  // If client specifically requested JSON, return JSON, otherwise redirect to login page (HTTP 303 See Other)
  const response = acceptsJson
    ? NextResponse.json({ success: true, message: "Logged out" })
    : NextResponse.redirect(loginUrl, 303);

  // Expire session cookie
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export async function GET(req: NextRequest) {
  // If user accesses /api/auth/logout directly in browser address bar
  const loginUrl = new URL("/admin/login", req.url);
  const response = NextResponse.redirect(loginUrl, 303);

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
