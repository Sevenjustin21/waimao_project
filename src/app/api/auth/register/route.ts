import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createRateLimiter } from "@/lib/rate-limit";

const burstLimiter = createRateLimiter({
  identifier: "register:burst",
  windowMs: 60 * 1000,
  limit: 5,
});

const dailyLimiter = createRateLimiter({
  identifier: "register:daily",
  windowMs: 24 * 60 * 60 * 1000,
  limit: 20,
});

const MIN_FORM_DURATION_MS = 3000;

function getClientIp(req: Request | NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const honeypot = typeof body.website === "string" ? body.website.trim() : "";
    if (honeypot) {
      return NextResponse.json({ message: "ok" }, { status: 200 });
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : body.password?.toString();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { message: "Password length must be between 8 and 128 characters" },
        { status: 400 },
      );
    }

    const startedAt = Number(body.formStartedAt);
    if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FORM_DURATION_MS) {
      return NextResponse.json(
        { message: "Please spend a little more time on the form" },
        { status: 400 },
      );
    }

    const burstResult = await burstLimiter.check(ip);
    if (!burstResult.success) {
      return NextResponse.json(
        { message: "Too many attempts. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(1, Math.ceil(burstResult.reset / 1000)).toString(),
          },
        },
      );
    }

    const dailyResult = await dailyLimiter.check(ip);
    if (!dailyResult.success) {
      return NextResponse.json(
        { message: "Daily registration limit reached for this IP" },
        { status: 429 },
      );
    }

    const existingUser = await prisma.appUser.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.appUser.create({
      data: {
        email,
        passwordHash,
        role: UserRole.USER,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", (error as Error).message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
