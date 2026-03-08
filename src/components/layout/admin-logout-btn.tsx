"use client";
import { signOut } from "next-auth/react";

export default function AdminLogoutBtn() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-[var(--color-border)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-white"
    >
      Logout
    </button>
  );
}
