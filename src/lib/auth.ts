import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "newskrez-production-super-secret-encryption-key-2026-global-intelligence"
);

export const SESSION_COOKIE_NAME = "newskrez_session";

export interface UserSessionPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export async function createSessionToken(payload: UserSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const verified = await verifySessionToken(token);
    if (!verified) return null;

    // Verify user is still active in database
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, verified.userId),
      columns: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) return null;

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    return null;
  }
}

export async function verifyUserCredentials(email: string, passwordPlain: string) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email.toLowerCase().trim()),
  });

  if (!user || !user.isActive) return null;

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
