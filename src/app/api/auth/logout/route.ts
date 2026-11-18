import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

function clearSessionResponse(req: NextRequest, isJsonPreferred: boolean) {
  const loginUrl = new URL("/admin/login", req.url);
  const response = isJsonPreferred
    ? NextResponse.json({ success: true, message: "Logged out", redirectUrl: "/admin/login" })
    : NextResponse.redirect(loginUrl, 303);

  const isLocalhost = req.headers.get("host")?.includes("localhost") || req.headers.get("host")?.includes("127.0.0.1");
  const isSecure = process.env.NODE_ENV === "production" && !isLocalhost;

  // Clear cookie completely
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: isSecure,
  });

  return response;
}

export async function POST(req: NextRequest) {
  // If request specifically asked for application/json and is an XHR / fetch
  const acceptsJson = req.headers.get("accept")?.includes("application/json") &&
    req.headers.get("sec-fetch-dest") !== "document";

  return clearSessionResponse(req, !!acceptsJson);
}

export async function GET(req: NextRequest) {
  // If user accesses /api/auth/logout directly in browser address bar or via link
  return clearSessionResponse(req, false);
}
