"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";

interface UserNavProps {
  user?: {
    email?: string | null;
    role?: string;
    vipTitle?: string | null;
  };
}

export default function UserNav({ user }: UserNavProps) {
  if (!user) {
    return (
      <Fragment>
        <Link
          href="/login"
          className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)] hover:text-white"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_10px_25px_rgba(43,192,247,0.35)] hover:bg-[var(--color-primary)]"
        >
          Register
        </Link>
      </Fragment>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex flex-col text-[var(--color-text-muted)]">
        <span className="font-medium text-white">
          {user.email}
        </span>
        {user.vipTitle && user.role !== "ADMIN" && (
          <span className="mt-1 inline-flex w-max items-center gap-1 rounded-full bg-[rgba(122,240,192,0.1)] px-3 py-0.5 text-xs font-semibold text-[var(--color-success)]">
            VIP {user.vipTitle}
          </span>
        )}
      </div>
      {user.role === "ADMIN" ? (
        <Link
          href="/admin/dashboard"
          className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] hover:text-white"
        >
          Admin
        </Link>
      ) : (
        <Link
          href="/my/inquiries"
          className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] hover:text-white"
        >
          My Inquiries
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
      >
        Logout
      </button>
    </div>
  );
}
