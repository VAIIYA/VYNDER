import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      redirect("/swipe");
    } else {
      redirect("/auth/signin");
    }
  } catch (error) {
    // If there's an error (e.g., missing env vars), redirect to signin
    console.error("Error getting session:", error);
    redirect("/auth/signin");
  }
}




