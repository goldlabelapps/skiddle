import { NextRequest, NextResponse } from 'next/server';
import { createClient, SkiddleException } from '@skiddle/sdk';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Event ID is required.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Skiddle API key is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const client = createClient({ apiKey, devMode: false });
    const response = await client.events.getListing(id);

    return NextResponse.json({
      success: true,
      event: response.results,
      raw: response,
      debugInfo: client.events.getDebugInfo(),
    });
  } catch (err: any) {
    const isSkiddleException = err instanceof SkiddleException;
    return NextResponse.json(
      {
        success: false,
        error: err?.message || `Failed to fetch event listing ${id}.`,
        code: isSkiddleException ? err.code : 500,
      },
      { status: isSkiddleException && err.code >= 400 && err.code < 600 ? err.code : 500 }
    );
  }
}
