import { DelhiveryError, handleDelhiveryB2C } from "@/lib/delhivery-b2c";

export const dynamic = "force-dynamic";

async function handler(request: Request, context: { params: Promise<{ segments: string[] }> | { segments: string[] } }) {
  try {
    const expectedKey = process.env.RAGHAV_INTERNAL_API_KEY?.trim();
    const suppliedKey = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    const signedInUser = request.headers.get("oai-authenticated-user-email");
    const local = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname);
    if (!local && !signedInUser && (!expectedKey || suppliedKey !== expectedKey))
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const body = ["POST", "PUT", "PATCH"].includes(request.method)
      ? await request.json().catch(() => ({})) as Record<string, unknown>
      : {};
    const result = await handleDelhiveryB2C(request.method, params.segments, new URL(request.url), body);
    return Response.json({ success: true, ...result });
  } catch (error) {
    const status = error instanceof DelhiveryError ? error.status : 500;
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Delhivery request failed" }, { status });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
