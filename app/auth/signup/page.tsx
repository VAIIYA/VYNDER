"use client";

import { redirect } from "next/navigation";

export default function SignUpPage() {
  // Redirect to wallet auth page (wallet connection creates account automatically)
  redirect("/auth/wallet");
}
