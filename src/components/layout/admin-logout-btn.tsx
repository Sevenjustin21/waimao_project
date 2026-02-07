"use client";
import { signOut } from "next-auth/react";

export default function AdminLogoutBtn() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-xs text-slate-400 hover:text-white transition-colors border border-slate-700 px-2 py-1 rounded"
    >
      Logout
    </button>
  );
}
