import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Match from "@/models/Match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const match = await Match.findById(params.matchId);
  if (!match || !match.users.includes(session.user.id as any)) {
    return new Response("Match not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let lastMessageAt = new Date();
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
          const messages = await Message.find({
            match: params.matchId,
            createdAt: { $gt: lastMessageAt },
          })
            .populate("sender", "username photos")
            .sort({ createdAt: 1 })
            .lean();

          if (messages.length > 0) {
            lastMessageAt = new Date(messages[messages.length - 1].createdAt);
            sendEvent("messages", { messages });
          }
        } catch (error) {
          console.error("SSE message poll error:", error);
        }
      }, 2000);

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
