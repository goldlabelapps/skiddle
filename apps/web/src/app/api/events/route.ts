import { NextRequest, NextResponse } from 'next/server';
import { createClient, SkiddleException } from '@skiddle/sdk';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';
  const eventcode = searchParams.get('eventcode') || '';
  const date = searchParams.get('date') || '';
  const minDate = searchParams.get('minDate') || '';
  const maxDate = searchParams.get('maxDate') || '';
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 24, 1), 50) : 24;

  const apiKey = process.env.SKIDDLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Skiddle API key is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const client = createClient({ apiKey, devMode: false });
    if (keyword.trim()) {
      client.events.addCond('keyword', keyword.trim());
    }
    if (eventcode && eventcode !== 'all') {
      client.events.addCond('eventcode', eventcode);
    }
    if (minDate.trim()) {
      client.events.addCond('minDate', minDate.trim());
    }
    if (maxDate.trim()) {
      client.events.addCond('maxDate', maxDate.trim());
    }
    if (date.trim() && !minDate.trim() && !maxDate.trim()) {
      client.events.addCond('bdate', date.trim());
    }
    client.events.addCond('limit', limit);

    const response = await client.events.getListings();
    const rawEvents = Array.isArray(response.data)
      ? response.data
      : (Array.isArray(response.results) ? response.results : []);

    return NextResponse.json({
      success: true,
      events: rawEvents,
      totalresults: response.meta?.totalresults ?? response.totalresults ?? rawEvents.length,
      pagecount: response.pagecount ?? response.meta?.pagecount ?? 1,
    });
  } catch (err: any) {
    const isSkiddleException = err instanceof SkiddleException;
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to fetch events from Skiddle API.',
        code: isSkiddleException ? err.code : 500,
      },
      { status: isSkiddleException && err.code >= 400 && err.code < 600 ? err.code : 500 }
    );
  }
}
