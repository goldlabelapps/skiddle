import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getEvents } from '../../src/app/api/events/route';
import { GET as getEventById } from '../../src/app/api/events/[id]/route';

describe('Web App Route Handlers (/api/events)', () => {
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

  describe('GET /api/events', () => {
    it('returns 500 when SKIDDLE_API_KEY is not configured', async () => {
      const req = new NextRequest('http://localhost:3000/api/events?keyword=test');
      const response = await getEvents(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Skiddle API key is not configured');
    });

    it('successfully queries events with search parameters and returns formatted results', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_api_key';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            totalresults: 2,
            pagecount: 1,
            results: [
              { id: '101', eventname: 'Warehouse Project' },
              { id: '102', eventname: 'Manchester Camerata' },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new NextRequest(
        'http://localhost:3000/api/events?keyword=Manchester&eventcode=LIVE&date=2027-04-15&limit=30'
      );
      const response = await getEvents(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.events).toHaveLength(2);
      expect(json.events[0].id).toBe('101');
      expect(json.totalresults).toBe(2);
      expect(json.pagecount).toBe(1);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get('keyword')).toBe('Manchester');
      // SDK transforms 'eventcode' to API v3 'eventCode'
      expect(calledUrl.searchParams.get('eventCode')).toBe('LIVE');
      expect(calledUrl.searchParams.get('bdate')).toBe('2027-04-15');
      // SDK transforms 'limit' to API v3 'page[size]'
      expect(calledUrl.searchParams.get('page[size]')).toBe('30');
    });

    it('supports page parameter and parses API v3 meta.totalResults and meta.totalPages', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_api_key';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            meta: { totalResults: 300, totalPages: 13 },
            data: [{ id: '301', eventName: 'Festival Page 2' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new NextRequest('http://localhost:3000/api/events?page=2&limit=24');
      const response = await getEvents(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.totalresults).toBe(300);
      expect(json.pagecount).toBe(13);
      expect(json.page).toBe(2);

      const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get('page[size]')).toBe('24');
      expect(calledUrl.searchParams.get('page[number]')).toBe('2');
    });

    it('forwards minDate and maxDate range parameters to SDK conditions', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_api_key';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            totalresults: 1,
            pagecount: 1,
            results: [{ id: '201', eventname: 'Autumn Festival' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new NextRequest(
        'http://localhost:3000/api/events?minDate=2026-11-01&maxDate=2026-11-15'
      );
      const response = await getEvents(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get('minDate')).toBe('2026-11-01');
      expect(calledUrl.searchParams.get('maxDate')).toBe('2026-11-15');
    });

    it('clamps limit to maximum of 50 and minimum of 1, ignoring eventcode=all', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_api_key';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            totalresults: 0,
            results: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new NextRequest(
        'http://localhost:3000/api/events?keyword=Party&eventcode=all&limit=999'
      );
      const response = await getEvents(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);

      const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
      expect(calledUrl.searchParams.get('page[size]')).toBe('50');
      expect(calledUrl.searchParams.has('eventCode')).toBe(false);
    });

    it('returns error status and json when SDK request fails with SkiddleException', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_api_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 1,
            description: 'Invalid API Key',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new NextRequest('http://localhost:3000/api/events?keyword=test');
      const response = await getEvents(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Invalid API Key');
    });
  });

  describe('GET /api/events/[id]', () => {
    it('returns 400 when id is missing or empty', async () => {
      const req = new NextRequest('http://localhost:3000/api/events/');
      const response = await getEventById(req, { params: Promise.resolve({ id: '' }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Event ID is required');
    });

    it('returns 500 when SKIDDLE_API_KEY is not configured', async () => {
      const req = new NextRequest('http://localhost:3000/api/events/42616476');
      const response = await getEventById(req, { params: Promise.resolve({ id: '42616476' }) });
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Skiddle API key is not configured');
    });

    it('returns event detail and debugInfo on successful query', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_api_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            results: {
              id: '42616476',
              eventname: 'Mozart, Made in Manchester',
              venue: { name: 'The Stoller Hall' },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new NextRequest('http://localhost:3000/api/events/42616476');
      const response = await getEventById(req, { params: Promise.resolve({ id: '42616476' }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.event.id).toBe('42616476');
      expect(json.event.eventname).toBe('Mozart, Made in Manchester');
      expect(json.debugInfo).toBeDefined();
    });

    it('returns 404 status when Skiddle API returns error 404', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_api_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 1,
            description: 'Event not found',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const req = new NextRequest('http://localhost:3000/api/events/99999999');
      const response = await getEventById(req, { params: Promise.resolve({ id: '99999999' }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Event not found');
    });
  });
});
