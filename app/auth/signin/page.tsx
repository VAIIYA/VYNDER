"use client";

import { redirect } from "next/navigation";

export default function SignInPage() {
  // Redirect to wallet auth page
  redirect("/auth/wallet");
}
