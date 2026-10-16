import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkServerConfig, executeSkiddleQuery } from '../../src/app/actions.js';

describe('Web Server Actions Unit Tests (actions.ts)', () => {
  const originalEnv = process.env.SKIDDLE_API_KEY;

  beforeEach(() => {
    delete process.env.SKIDDLE_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalEnv !== undefined) {
      process.env.SKIDDLE_API_KEY = originalEnv;
    } else {
      delete process.env.SKIDDLE_API_KEY;
    }
  });

  it('checkServerConfig reports whether SKIDDLE_API_KEY is configured in environment', async () => {
    expect(await checkServerConfig()).toEqual({ hasServerApiKey: false });
    process.env.SKIDDLE_API_KEY = 'server_env_key';
    expect(await checkServerConfig()).toEqual({ hasServerApiKey: true });
  });

  it('returns 401 error result when neither custom apiKey nor SKIDDLE_API_KEY is provided', async () => {
    const res = await executeSkiddleQuery({
      resource: 'events',
      conditions: { keyword: 'Manchester' },
    });

    expect(res.success).toBe(false);
    expect(res.errorCode).toBe(401);
    expect(res.error).toContain('Skiddle API Key is not configured');
    expect(res.resource).toBe('events');
  });

  it('executes events query, filters blank conditions, and returns debug telemetry', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 0,
          totalresults: 1,
          results: [{ id: '123', eventname: 'Manchester Live' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const res = await executeSkiddleQuery({
      resource: 'events',
      conditions: {
        keyword: 'Manchester',
        eventCode: 'live',
        emptyField: '   ',
      },
      apiKey: 'custom_test_key',
      devMode: true,
    });

    expect(res.success).toBe(true);
    expect(res.conditionsSent).toEqual({
      keyword: 'Manchester',
      eventCode: 'live',
    });
    expect(res.data.results[0].eventname).toBe('Manchester Live');
    expect(res.debugInfo).toHaveLength(1);
    expect(res.debugInfo?.[0].url).toContain('apiKey=xxxxxxxxxxxxxxxxxx');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('executes event-single query with default ID 42616476 when singleId is omitted', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: 0,
          results: { id: '42616476', eventname: 'Mozart, Made in Manchester' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    process.env.SKIDDLE_API_KEY = 'env_key_123';
    const res = await executeSkiddleQuery({
      resource: 'event-single',
      conditions: {},
    });

    expect(res.success).toBe(true);
    expect(res.data.results.id).toBe('42616476');
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/api/v1/events/42616476/');
  });

  it('executes venues and artists queries against API v1 endpoints', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 0, results: [{ id: '75988', name: 'The Stoller Hall' }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 0, results: [{ id: '999', name: 'Bicep' }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const venueRes = await executeSkiddleQuery({
      resource: 'venues',
      conditions: { keyword: 'Manchester' },
      apiKey: 'test_key',
    });
    expect(venueRes.success).toBe(true);
    expect(venueRes.data.results[0].name).toBe('The Stoller Hall');

    const artistRes = await executeSkiddleQuery({
      resource: 'artists',
      conditions: { keyword: 'Bicep' },
      apiKey: 'test_key',
    });
    expect(artistRes.success).toBe(true);
    expect(artistRes.data.results[0].name).toBe('Bicep');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('catches SkiddleException and returns structured error payload with HTTP status code', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ status: 403, detail: 'Invalid API key provided' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const res = await executeSkiddleQuery({
      resource: 'events',
      conditions: { keyword: 'Test' },
      apiKey: 'invalid_key',
    });

    expect(res.success).toBe(false);
    expect(res.errorCode).toBe(403);
    expect(res.error).toBe('Invalid API key provided');
  });

  it('rejects unsupported resource types gracefully', async () => {
    const res = await executeSkiddleQuery({
      resource: 'invalid-resource' as any,
      conditions: {},
      apiKey: 'test_key',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Unsupported resource: invalid-resource');
  });
});
