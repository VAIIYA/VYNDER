import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const encoder = new TextEncoder();
  let lastCheck = new Date();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const heartbeat = setInterval(() => {
        sendEvent("ping", { ts: Date.now() });
      }, 15000);

      const poll = setInterval(async () => {
        if (closed) return;
        try {
          const updatedMatches = await Match.find({
            users: session.user.id,
            updatedAt: { $gt: lastCheck },
          })
            .select("_id updatedAt")
            .lean();

          if (updatedMatches.length > 0) {
            lastCheck = new Date();
            sendEvent("refresh", { matches: updatedMatches.length });
          }
        } catch (error) {
          console.error("SSE matches poll error:", error);
        }
      }, 3000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(heartbeat);
        clearInterval(poll);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
