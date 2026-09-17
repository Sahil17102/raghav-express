import { DelhiveryB2BError, handleDelhiveryB2B } from '@/lib/delhivery-b2b';

export const dynamic = 'force-dynamic';

async function handler(
  request: Request,
  context: { params: Promise<{ segments: string[] }> | { segments: string[] } },
) {
  try {
    const expectedKey = process.env.RAGHAV_INTERNAL_API_KEY?.trim();
    const suppliedKey = request.headers
      .get('authorization')
      ?.replace(/^Bearer\s+/i, '')
      .trim();
    const signedInUser = request.headers.get('oai-authenticated-user-email');
    const local =
      process.env.NODE_ENV !== 'production' &&
      ['localhost', '127.0.0.1'].includes(new URL(request.url).hostname);
    if (
      !local &&
      !signedInUser &&
      (!expectedKey || suppliedKey !== expectedKey)
    )
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    const { segments } = await context.params;
    const result = await handleDelhiveryB2B(request, segments);
    return Response.json({ success: true, ...result });
  } catch (error) {
    const status = error instanceof DelhiveryB2BError ? error.status : 500;
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Delhivery B2B request failed',
        ...(error instanceof DelhiveryB2BError && error.details !== undefined
          ? { details: error.details }
          : {}),
      },
      { status },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
