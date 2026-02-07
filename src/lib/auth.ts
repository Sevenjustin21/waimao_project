import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import type { AppUser } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createRateLimiter } from "@/lib/rate-limit";
import { runWithVipColumn } from "@/lib/vip-column";

const loginBurstLimiter = createRateLimiter({
  identifier: "login:burst",
  windowMs: 60 * 1000,
  limit: 10,
});

const loginWindowLimiter = createRateLimiter({
  identifier: "login:window",
  windowMs: 15 * 60 * 1000,
  limit: 50,
});

const accountLimiter = createRateLimiter({
  identifier: "login:account",
  windowMs: 10 * 60 * 1000,
  limit: 8,
});

const cookieSecureOverride = process.env.COOKIE_SECURE;
const preferSecureCookies =
  cookieSecureOverride === "true"
    ? true
    : cookieSecureOverride === "false"
      ? false
      : Boolean(
          process.env.NEXTAUTH_URL?.startsWith("https://") ||
            process.env.APP_URL?.startsWith("https://"),
        );

function extractIp(req?: Request | { headers?: Headers | Record<string, string> }) {
  const headers = req?.headers;
  if (!headers) return "unknown";

  if (headers instanceof Headers) {
    return (
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      "unknown"
    );
  }

  const xf = (headers["x-forwarded-for"] || headers["X-Forwarded-For"]) as string | undefined;
  if (xf) {
    return xf.split(",")[0]?.trim() || "unknown";
  }
  const xr = (headers["x-real-ip"] || headers["X-Real-IP"]) as string | undefined;
  return xr || "unknown";
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const ip = extractIp(req);
        const identifier = ip !== "unknown" ? ip : normalizedEmail;

        const burst = await loginBurstLimiter.check(identifier);
        if (!burst.success) {
          throw new Error("Too many login attempts. Please wait a moment.");
        }

        const windowLimit = await loginWindowLimiter.check(identifier);
        if (!windowLimit.success) {
          throw new Error("Login temporarily locked. Try again later.");
        }

        const accountKey = normalizedEmail || identifier;
        const accountResult = await accountLimiter.check(accountKey);
        if (!accountResult.success) {
          throw new Error("Account locked due to repeated attempts. Please wait.");
        }

        const user = await runWithVipColumn(async (includeVip) => {
          const record = await prisma.appUser.findUnique({
            where: {
              email: normalizedEmail,
            },
            select: {
              id: true,
              email: true,
              passwordHash: true,
              role: true,
              createdAt: true,
              lastLoginAt: true,
              vipTitle: includeVip,
            },
          });
          if (!record) return null;
          return {
            ...record,
            vipTitle: includeVip ? (record as AppUser & { vipTitle?: string | null }).vipTitle ?? null : null,
          } as AppUser & { vipTitle?: string | null };
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          vipTitle: user.vipTitle || null,
        };
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: preferSecureCookies,
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.vipTitle = token.vipTitle ?? null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.vipTitle = user.vipTitle ?? null;
      }
      return token;
    },
  },
};
