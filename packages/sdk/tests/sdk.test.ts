import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SkiddleSession,
  SkiddleRequest,
  SkiddleBase,
  Events,
  Artists,
  Venues,
  SkiddleException,
  createClient,
  toEFlyerPromotionData,
  type SkiddleEventDetail,
  type SkiddleSingleEventExecutionResult,
} from '../src/index.js';

describe('SkiddleException', () => {
  it('constructs with message, code, details, and preserves instanceof chain', () => {
    const details = { field: 'api_key', reason: 'expired' };
    const err = new SkiddleException('Unauthorized key', 401, details);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(SkiddleException);
    expect(err.name).toBe('SkiddleException');
    expect(err.message).toBe('Unauthorized key');
    expect(err.code).toBe(401);
    expect(err.details).toEqual(details);
  });

  it('defaults code to 0 when omitted', () => {
    const err = new SkiddleException('Validation error');
    expect(err.code).toBe(0);
    expect(err.details).toBeUndefined();
  });
});

describe('SkiddleSession', () => {
  const originalEnv = process.env.SKIDDLE_API_KEY;

  beforeEach(() => {
    delete process.env.SKIDDLE_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SKIDDLE_API_KEY = originalEnv;
    } else {
      delete process.env.SKIDDLE_API_KEY;
    }
  });

  it('initializes successfully with an explicit apiKey', () => {
    const session = new SkiddleSession({ apiKey: 'test_key_123', devMode: true });
    expect(session.getApiKey()).toBe('test_key_123');
    expect(session.isDevMode()).toBe(true);
  });

  it('falls back to SKIDDLE_API_KEY environment variable when no key is passed', () => {
    process.env.SKIDDLE_API_KEY = 'env_secret_key';
    const session = new SkiddleSession();
    expect(session.getApiKey()).toBe('env_secret_key');
  });

  it('throws a SkiddleException when no API key is provided', () => {
    expect(() => new SkiddleSession({})).toThrowError(SkiddleException);
    expect(() => new SkiddleSession({})).toThrowError('API Key is missing');
  });

  it('allows toggling devMode', () => {
    const session = new SkiddleSession({ apiKey: 'key' });
    expect(session.isDevMode()).toBe(false);
    session.setDevMode(true);
    expect(session.isDevMode()).toBe(true);
  });
});

describe('SkiddleRequest', () => {
  it('gets and sets apiVersion accurately', () => {
    const request = new SkiddleRequest();
    expect(request.getApiVersion()).toBe(1);
    request.setApiVersion(3);
    expect(request.getApiVersion()).toBe(3);
  });

  it('correctly renames keys and translates deprecated limit/offset for API v3 in transformRequestKeys', () => {
    const request = new SkiddleRequest();
    const transformed = request.transformRequestKeys({
      api_key: 'abc',
      keyword: 'Warehouse',
      limit: 10,
      offset: 20,
      eventcode: 'fest',
      ticketsavailable: 1,
      b: '99',
      venueid: '555',
      order: 'random',
    });

    expect(transformed).toEqual({
      apiKey: 'abc',
      keyword: 'Warehouse',
      'page[size]': 10,
      'page[number]': 3,
      eventCode: 'FEST',
      ticketsAvailable: 1,
      brandId: '99',
      venueIds: '555',
    });
  });

  it('uses default pageSize of 20 when offset is provided without limit in transformRequestKeys', () => {
    const request = new SkiddleRequest();
    const transformed = request.transformRequestKeys({
      api_key: 'abc',
      offset: 40,
      tickets: true,
      venueId: '777',
    });

    expect(transformed).toEqual({
      apiKey: 'abc',
      'page[number]': 3,
      ticketsAvailable: true,
      venueIds: '777',
    });
  });

  it('constructs v3 endpoint and headers when apiVersion is 3', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ error: 0, results: [{ id: '101', eventname: 'Glastonbury' }] }),
      headers: new Headers(),
    });

    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);
    request.setApiVersion(3);

    const result = await request.call('events/instant-search/', {
      api_key: 'secret123',
      keyword: 'Festival',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.origin).toBe('https://api.skiddle.com');
    expect(calledUrl.pathname).toBe('/v3/events/instant-search/');
    expect(calledUrl.searchParams.get('apiKey')).toBe('secret123');
    expect(calledUrl.searchParams.get('keyword')).toBe('Festival');
    expect((result as any).results[0].eventname).toBe('Glastonbury');
  });

  it('throws SkiddleException when endpoint is empty', async () => {
    const request = new SkiddleRequest();
    await expect(request.call('')).rejects.toThrow('API Endpoint not set');
  });

  it('throws SkiddleException when native fetch fails with network transport error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('DNS lookup failed'));
    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);

    await expect(request.call('/events/', { api_key: 'test' })).rejects.toThrow(
      'Network transport error: DNS lookup failed'
    );
  });

  it('parses API v1 error format properly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: 1, errormessage: 'Invalid date parameter' }),
      headers: new Headers(),
    });

    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);

    await expect(request.call('/events/', { api_key: 'test' })).rejects.toThrow(
      'Invalid date parameter'
    );
  });

  it('parses API v3 error format properly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ status: 404, detail: 'Resource not found' }),
      headers: new Headers(),
    });

    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);
    request.setApiVersion(3);

    await expect(request.call('/events/99999', { api_key: 'test' })).rejects.toThrow(
      'Resource not found'
    );
  });

  it('handles non-JSON upstream error responses gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => '<html>Bad Gateway</html>',
      headers: new Headers(),
    });

    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);

    await expect(request.call('/events/', { api_key: 'test' })).rejects.toThrow(
      'An unknown error occurred - <html>Bad Gateway</html> - 502'
    );
  });

  it('throws SkiddleException when 200 OK body is malformed JSON', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'not-valid-json{{{',
      headers: new Headers(),
    });

    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);

    await expect(request.call('/events/', { api_key: 'test' })).rejects.toThrow(
      'Error parsing server response'
    );
  });

  it('masks API key in debug logs when devMode is true and supports clearDebugInfo', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ error: 0, results: [] }),
      headers: new Headers(),
    });

    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);
    request.devMode = true;

    await request.call('/events/instant-search/', { api_key: 'SUPER_SECRET_KEY' });
    const debug = request.getDebugInfo();
    expect(debug.length).toBe(1);
    expect(debug[0].url).toContain('xxxxxxxxxxxxxxxxxx');
    expect(debug[0].url).not.toContain('SUPER_SECRET_KEY');

    request.clearDebugInfo();
    expect(request.getDebugInfo()).toEqual([]);
  });
});

describe('SkiddleBase & Conditions', () => {
  it('validates session in setSession and propagates devMode', () => {
    const base = new SkiddleBase();
    expect(() => base.setSession(null as any)).toThrowError('Skiddle API Session not set correctly');
    expect(() => base.setSession({} as any)).toThrowError('Skiddle API Session not set correctly');

    const devSession = new SkiddleSession({ apiKey: 'dev_key', devMode: true });
    base.setSession(devSession);
    expect(base.getDebugInfo()).toEqual([]);
  });

  it('throws when makeCall is invoked before setSession', async () => {
    const events = new Events();
    await expect(events.getListings()).rejects.toThrowError('Skiddle API Session not set');
  });

  it('manages query conditions fluently and returns isolated copy in getConditions', () => {
    const base = new SkiddleBase();
    base
      .addCond('keyword', 'Warehouse')
      .addCond('genres', ['house', 'techno'])
      .addCond('limit', 20);

    const conds = base.getConditions();
    expect(conds).toEqual({
      keyword: 'Warehouse',
      genres: 'house,techno',
      limit: 20,
    });

    // Mutating returned object must not mutate internal state
    conds.keyword = 'Mutated';
    expect(base.getConditions().keyword).toBe('Warehouse');

    base.delCond('keyword');
    expect(base.getConditions().keyword).toBeUndefined();

    base.clearCond();
    expect(base.getConditions()).toEqual({});

    base.addCond('limit', 10);
    expect(base.getConditions()).toEqual({ limit: 10 });
    base.clearConditions();
    expect(base.getConditions()).toEqual({});
  });

  it('throws an exception when trying to delete a non-existent condition', () => {
    const base = new SkiddleBase();
    expect(() => base.delCond('non_existent')).toThrowError(
      'Trying to delete condition non_existent, but condition not found'
    );
  });

  it('uppercases eventCode and eventcode quirks automatically', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ error: 0, results: [] }),
      headers: new Headers(),
    });

    const session = new SkiddleSession({ apiKey: 'key123' });
    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);
    const events = new Events(request);
    events.setSession(session);

    events.addCond('eventcode', 'live_music');
    await events.getListings();

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('eventCode')).toBe('LIVE_MUSIC');
  });

  it('normalizes legacy keys in formatForLog with unset=false and unset=true', () => {
    const base = new SkiddleBase();
    const rawItems = [
      {
        id: '100',
        eventname: 'Warehouse Project',
        entryprice: '25.00',
        venue: { id: '50', name: 'Depot Mayfield', town: 'Manchester' },
        openingtimes: { doorsopen: '20:00', doorsclose: '04:00' },
      },
    ];

    const kept = base.formatForLog(rawItems, false);
    expect(kept[0].iListingInstance).toBe('100');
    expect(kept[0].EventName).toBe('Warehouse Project');
    expect(kept[0].EntryPrice).toBe('25.00');
    expect(kept[0].Name).toBe('Depot Mayfield');
    expect(kept[0].Town).toBe('Manchester');
    expect(kept[0].DoorsOpen).toBe('20:00');
    expect(kept[0].id).toBe('100');

    const removed = base.formatForLog(rawItems, true);
    expect(removed[0].iListingInstance).toBe('100');
    expect(removed[0].id).toBeUndefined();
    expect(removed[0].eventname).toBeUndefined();
  });
});

describe('Entities: Events, Artists, Venues', () => {
  it('fetches single event by id via Events.getListing on API v1', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ error: 0, results: { id: '4040', eventname: 'Creamfields' } }),
      headers: new Headers(),
    });

    const session = new SkiddleSession({ apiKey: 'key' });
    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);
    const events = new Events(request);
    events.setSession(session);

    const result = await events.getListing('4040');
    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.origin).toBe('https://www.skiddle.com');
    expect(calledUrl.pathname).toBe('/api/v1/events/4040/');
    expect(result.results.id).toBe('4040');
    expect(result.results.eventname).toBe('Creamfields');
  });

  it('fetches artists via Artists.getListings on API v1', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ error: 0, results: [{ id: '888', name: 'Bicep' }] }),
      headers: new Headers(),
    });

    const session = new SkiddleSession({ apiKey: 'artist_key' });
    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);
    const artists = new Artists(request);
    artists.setSession(session).addCond('keyword', 'Bicep');

    const result = await artists.getListings();
    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.pathname).toBe('/api/v1/artists/');
    expect(calledUrl.searchParams.get('keyword')).toBe('Bicep');
    expect(result.results[0].name).toBe('Bicep');
  });

  it('fetches venues via Venues.getListings on API v1', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ error: 0, results: [{ id: '75988', name: 'The Stoller Hall' }] }),
      headers: new Headers(),
    });

    const session = new SkiddleSession({ apiKey: 'venue_key' });
    const request = new SkiddleRequest(mockFetch as unknown as typeof fetch);
    const venues = new Venues(request);
    venues.setSession(session).addCond('keyword', 'Manchester');

    const result = await venues.getListings();
    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.pathname).toBe('/api/v1/venues/');
    expect(calledUrl.searchParams.get('keyword')).toBe('Manchester');
    expect(result.results[0].name).toBe('The Stoller Hall');
  });

  it('works seamlessly with createClient helper', () => {
    const client = createClient({ apiKey: 'client_key_123' });
    expect(client.events).toBeInstanceOf(Events);
    expect(client.artists).toBeInstanceOf(Artists);
    expect(client.venues).toBeInstanceOf(Venues);
    expect(client.session.getApiKey()).toBe('client_key_123');
  });
});

describe('eFlyer Promotion & Single Event Shape', () => {
  const sampleEventDetail: SkiddleEventDetail = {
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
    imageurl: 'https://d31fr2pwly4c4s.cloudfront.net/b/d/b/2311883_a4cd0fe3_mozart-made-in-manchester_th.jpg',
    largeimageurl: 'https://d31fr2pwly4c4s.cloudfront.net/b/d/b/2311883_a4cd0fe3_mozart-made-in-manchester.jpg',
    headerhex: '#080808',
    link: 'https://www.skiddle.com/whats-on/Manchester/The-Stoller-Hall/Mozart-Made-in-Manchester/42616476/',
    date: '2027-04-15',
    dateStart: '2027-04-15 19:30:00',
    dateEnd: '2027-04-15 21:30:00',
    startdate: '2027-04-15T18:30:00+00:00',
    enddate: '2027-04-15T20:30:00+00:00',
    description: 'Manchester Camerata return to Stoller Hall for another concert celebrating the genius of Mozart - this time with an operatic twist.',
    openingtimes: {
      doorsopen: '19:30',
      doorsclose: '21:30',
      lastentry: '',
    },
    genres: [
      {
        genreid: '37',
        name: 'Classical',
      },
      {
        genreid: '100',
        name: 'Orchestral',
      },
    ],
    entryprice: '27.50',
    MinAge: '',
    going: [],
    imgoing: 0,
    goingtos: 0,
    artists: [],
    ticketStatus: '',
    tickets: false,
    paymentPlanTCs: null,
    eventVisibility: 'public',
    ticketUrl: '',
    groupingid: '',
    rep: {
      enabled: false,
    },
    seatingPlanID: '',
    healthAndSafety: [],
  };

  it('correctly maps single event detail to eFlyer promotion model', () => {
    const eflyer = toEFlyerPromotionData(sampleEventDetail);

    expect(eflyer.eventId).toBe('42616476');
    expect(eflyer.listingId).toBe('2311883');
    expect(eflyer.eventName).toBe('Mozart, Made in Manchester');
    expect(eflyer.accentColor).toBe('#080808');
    expect(eflyer.heroImageUrl).toBe(
      'https://d31fr2pwly4c4s.cloudfront.net/b/d/b/2311883_a4cd0fe3_mozart-made-in-manchester.jpg'
    );
    expect(eflyer.venueName).toBe('The Stoller Hall');
    expect(eflyer.venueCity).toBe('Manchester');
    expect(eflyer.venuePostcode).toBe('M3 1DA');
    expect(eflyer.doorsOpen).toBe('19:30');
    expect(eflyer.doorsClose).toBe('21:30');
    expect(eflyer.entryPrice).toBe('27.50');
    expect(eflyer.genres).toEqual(['Classical', 'Orchestral']);
    expect(eflyer.isCancelled).toBe(false);
  });

  it('handles cancelled events and fallback fields properly in eFlyer model', () => {
    const cancelledEvent: SkiddleEventDetail = {
      ...sampleEventDetail,
      cancelled: '1',
      cancellationReason: 'Artist illness',
      largeimageurl: '',
      headerhex: '',
      MinAge: '18',
      openingtimes: {
        doorsopen: '20:00',
        doorsclose: '23:00',
        lastentry: '21:00',
      },
    };

    const eflyer = toEFlyerPromotionData(cancelledEvent);
    expect(eflyer.isCancelled).toBe(true);
    expect(eflyer.cancellationReason).toBe('Artist illness');
    expect(eflyer.heroImageUrl).toBe(sampleEventDetail.imageurl);
    expect(eflyer.accentColor).toBe('#080808');
    expect(eflyer.minAge).toBe('18');
    expect(eflyer.lastEntry).toBe('21:00');
  });

  it('validates full single event execution result typing', () => {
    const executionResult: SkiddleSingleEventExecutionResult = {
      success: true,
      data: {
        error: 0,
        totalcount: 1,
        pagecount: 1,
        results: sampleEventDetail,
        requestId: 'api_6ad28c99442da2.10194034',
      },
      conditionsSent: {},
      debugInfo: [
        {
          timestamp: '2026-10-16T20:44:09.263Z',
          url: 'https://www.skiddle.com/api/v1/events/42616476/?api_key=xxxxxxxxxxxxxxxxxx',
          method: 'GET',
          durationMs: 51,
          status: 200,
          headers: { server: 'Apache' },
          responseSnippet: '{"error":0}',
        },
      ],
      executionTimeMs: 52,
      resource: 'event-single',
    };

    expect(executionResult.success).toBe(true);
    expect(executionResult.data.results.eventname).toBe('Mozart, Made in Manchester');
    expect(executionResult.debugInfo?.[0].status).toBe(200);
  });
});
