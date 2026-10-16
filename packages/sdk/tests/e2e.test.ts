import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createClient,
  toEFlyerPromotionData,
  SkiddleException,
  type SkiddleEventDetail,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('SDK End-to-End (E2E) Workflows & Contract Suite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executes complete Event Discovery -> Single Event Detail -> eFlyer Promotion workflow', async () => {
    const searchResponse = {
      error: 0,
      totalresults: 1,
      results: [
        {
          id: '42616476',
          eventname: 'Mozart, Made in Manchester',
          date: '2027-04-15',
          venue: { id: '75988', name: 'The Stoller Hall', town: 'Manchester' },
        },
      ],
    };

    const detailResponse: { error: number; results: SkiddleEventDetail } = {
      error: 0,
      results: {
        id: '42616476',
        listingid: '2311883',
        eventname: 'Mozart, Made in Manchester',
        cancelled: '0',
        cancellationDate: '',
        cancellationType: '',
        cancellationReason: '',
        rescheduledDate: '',
        venue: {
          id: '75988',
          name: 'The Stoller Hall',
          address: 'Hunts Bank, Manchester',
          town: 'Manchester',
          postcode: 'M3 1DA',
          countrycode: 'GB',
          cityname: 'Manchester',
          phone: '0333 130 0967',
          latitude: '53.48725000',
          longitude: '-2.24332800',
          link: 'https://www.skiddle.com/whats-on/Manchester/The-Stoller-Hall/',
        },
        imageurl: 'https://example.com/thumb.jpg',
        largeimageurl: 'https://example.com/hero.jpg',
        headerhex: '#080808',
        link: 'https://www.skiddle.com/whats-on/Manchester/The-Stoller-Hall/Mozart-Made-in-Manchester/42616476/',
        date: '2027-04-15',
        dateStart: '2027-04-15 19:30:00',
        dateEnd: '2027-04-15 21:30:00',
        startdate: '2027-04-15T18:30:00+00:00',
        enddate: '2027-04-15T20:30:00+00:00',
        description: 'Live classical performance in Manchester.',
        openingtimes: {
          doorsopen: '19:30',
          doorsclose: '21:30',
          lastentry: '19:15',
        },
        genres: [{ genreid: '37', name: 'Classical' }],
        entryprice: '27.50',
        MinAge: '14',
        going: [],
        imgoing: 0,
        goingtos: 0,
        artists: [],
        ticketStatus: '1',
        tickets: true,
        paymentPlanTCs: null,
        eventVisibility: 'public',
        ticketUrl: 'https://www.skiddle.com/tickets/42616476',
        groupingid: '',
        rep: { enabled: false },
        seatingPlanID: '',
        healthAndSafety: [],
      },
    };

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(searchResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(detailResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const client = createClient({ apiKey: 'e2e_test_key_999', devMode: true });

    // Step 1: Search events with fluent condition builder (API v3)
    client.events
      .addCond('keyword', 'Mozart')
      .addCond('eventCode', 'live')
      .addCond('limit', 5)
      .addCond('offset', 0);

    const listings = await client.events.getListings();
    expect(listings.results).toHaveLength(1);
    const selectedId = listings.results[0].id;
    expect(selectedId).toBe('42616476');

    // Step 2: Fetch full event detail by ID (API v1)
    client.events.clearConditions();
    const detail = await client.events.getListing(selectedId);
    expect(detail.results.venue.name).toBe('The Stoller Hall');

    // Step 3: Transform to eFlyer Promotional ViewModel
    const eflyer = toEFlyerPromotionData(detail.results);
    expect(eflyer.eventId).toBe('42616476');
    expect(eflyer.heroImageUrl).toBe('https://example.com/hero.jpg');
    expect(eflyer.ticketsAvailable).toBe(true);
    expect(eflyer.genres).toEqual(['Classical']);

    // Step 4: Verify debug trace captured both v3 and v1 calls with masked API keys
    const debugTrace = client.events.getDebugInfo();
    expect(debugTrace).toHaveLength(2);
    expect(debugTrace[0].url).toContain('https://api.skiddle.com/v3/events/instant-search/');
    expect(debugTrace[0].url).toContain('apiKey=xxxxxxxxxxxxxxxxxx');
    expect(debugTrace[0].url).toContain('eventCode=LIVE');
    expect(debugTrace[0].url).toContain('page%5Bsize%5D=5');
    expect(debugTrace[1].url).toContain('https://www.skiddle.com/api/v1/events/42616476/');
    expect(debugTrace[1].url).toContain('api_key=xxxxxxxxxxxxxxxxxx');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('recovers cleanly after an upstream API error and succeeds on subsequent retry', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 429, detail: 'Rate limit exceeded' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 0, results: [{ id: '1', eventname: 'Retry Event' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const client = createClient({ apiKey: 'retry_key' });
    client.events.addCond('keyword', 'Retry');

    await expect(client.events.getListings()).rejects.toThrowError(SkiddleException);

    // Retry with same client and conditions
    const secondTry = await client.events.getListings();
    expect(secondTry.results[0].eventname).toBe('Retry Event');
  });

  it('verifies dual ESM/CJS build artifacts exist and export identical runtime contracts when built', async () => {
    const distDir = path.resolve(__dirname, '../dist');
    if (fs.existsSync(path.join(distDir, 'index.js'))) {
      expect(fs.existsSync(path.join(distDir, 'index.cjs'))).toBe(true);
      expect(fs.existsSync(path.join(distDir, 'index.d.ts'))).toBe(true);

      const esmBundle = await import('../dist/index.js');
      expect(typeof esmBundle.createClient).toBe('function');
      expect(typeof esmBundle.SkiddleSession).toBe('function');
      expect(typeof esmBundle.SkiddleRequest).toBe('function');
      expect(typeof esmBundle.Events).toBe('function');
      expect(typeof esmBundle.Artists).toBe('function');
      expect(typeof esmBundle.Venues).toBe('function');
      expect(typeof esmBundle.toEFlyerPromotionData).toBe('function');
    }
  });
});
