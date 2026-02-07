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
          className="text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Sign Up
        </Link>
      </Fragment>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-sm text-gray-700">
          {user.email}
        </span>
        {user.vipTitle && user.role !== "ADMIN" && (
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-1 w-max">
            VIP {user.vipTitle}
          </span>
        )}
      </div>
      {user.role === "ADMIN" ? (
        <Link
          href="/admin/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Admin
        </Link>
      ) : (
        <Link
          href="/my/inquiries"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          My Inquiries
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm font-medium text-gray-500 hover:text-red-600"
      >
        Logout
      </button>
    </div>
  );
}
