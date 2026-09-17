import { handleIndiaPost, IndiaPostError } from '@/lib/india-post';

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
    return Response.json({
      success: true,
      ...(await handleIndiaPost(request, segments)),
    });
  } catch (error) {
    const status = error instanceof IndiaPostError ? error.status : 500;
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'India Post request failed',
        ...(error instanceof IndiaPostError && error.details !== undefined
          ? { details: error.details }
          : {}),
      },
      { status },
    );
  }
}

export const GET = handler;
export const POST = handler;
