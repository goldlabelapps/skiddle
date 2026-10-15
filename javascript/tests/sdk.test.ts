import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SkiddleSession,
  SkiddleRequest,
  SkiddleBase,
  Events,
  Artists,
  Venues,
  SkiddleException,
  createClient,
} from '../src/index.js';

describe('SkiddleSession', () => {
  const originalEnv = process.env.SKIDDLE_API_KEY;

  beforeEach(() => {
    delete process.env.SKIDDLE_API_KEY;
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
  it('correctly renames keys and translates deprecated limit/offset for API v3 in transformRequestKeys', () => {
    const request = new SkiddleRequest();
    const transformed = request.transformRequestKeys({
      api_key: 'abc',
      keyword: 'Warehouse',
      limit: 10,
      offset: 20,
      eventcode: 'fest',
      ticketsavailable: 1,
    });

    expect(transformed).toEqual({
      apiKey: 'abc',
      keyword: 'Warehouse',
      'page[size]': 10,
      'page[number]': 3,
      eventCode: 'FEST',
      ticketsAvailable: 1,
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

    const result = await request.call('/events/instant-search/', {
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

  it('masks API key in debug logs when devMode is true', async () => {
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
  });
});

describe('SkiddleBase & Conditions', () => {
  it('manages query conditions fluently', () => {
    const base = new SkiddleBase();
    base.addCond('keyword', 'Warehouse')
        .addCond('genres', ['house', 'techno'])
        .addCond('limit', 20);

    expect(base.getConditions()).toEqual({
      keyword: 'Warehouse',
      genres: 'house,techno',
      limit: 20,
    });

    base.delCond('keyword');
    expect(base.getConditions().keyword).toBeUndefined();

    base.clearCond();
    expect(base.getConditions()).toEqual({});
  });

  it('throws an exception when trying to delete a non-existent condition', () => {
    const base = new SkiddleBase();
    expect(() => base.delCond('non_existent')).toThrowError(
      'Trying to delete condition non_existent, but condition not found'
    );
  });

  it('uppercases eventCode quirk automatically', async () => {
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

    events.addCond('eventCode', 'live_music');
    await events.getListings();

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get('eventCode')).toBe('LIVE_MUSIC');
  });
});

describe('Entities: Events, Artists, Venues', () => {
  it('fetches single event by id via getListing', async () => {
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
    expect(result.results.id).toBe('4040');
    expect(result.results.eventname).toBe('Creamfields');
  });

  it('works seamlessly with createClient helper', async () => {
    const client = createClient({ apiKey: 'client_key_123' });
    expect(client.events).toBeInstanceOf(Events);
    expect(client.artists).toBeInstanceOf(Artists);
    expect(client.venues).toBeInstanceOf(Venues);
    expect(client.session.getApiKey()).toBe('client_key_123');
  });
});
