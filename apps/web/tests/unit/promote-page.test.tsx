import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PromoteEventPage, { generateMetadata } from '../../src/app/events/[id]/edit/page';

describe('PromoteEventPage Flash Movie Experience', () => {
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

  describe('generateMetadata', () => {
    it('returns appropriate title and description for Flash experience', async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ id: '42616476' }) });
      expect(meta.title).toBe('Promote Event #42616476 | Skiddle Flash Experience');
      expect(meta.description).toContain('42616476');
    });
  });

  describe('PromoteEventPage Rendering', () => {
    it('renders API Key Missing screen when SKIDDLE_API_KEY is not configured', async () => {
      const element = await PromoteEventPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('API Key Missing');
      expect(html).toContain('SKIDDLE_API_KEY is not configured');
      expect(html).toContain('Return to Event Details');
    });

    it('renders error screen when event listing details are not returned or API fails', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 1,
            description: 'Listing not found',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const element = await PromoteEventPage({ params: Promise.resolve({ id: '99999999' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('Unable to Load Event #99999999');
      expect(html).toContain('Listing not found');
      expect(html).toContain('Back to Event Details');
    });

    it('renders PromoteFlashMovieClient with live event data on successful API retrieval', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            results: {
              id: '42616476',
              eventname: 'Manchester Warehouse Techno Rave',
              venue: {
                name: 'Depot Mayfield',
                town: 'Manchester',
                postcode: 'M1 2PY',
              },
              date: '2027-10-31',
              entryprice: '35.00',
              openingtimes: {
                doorsopen: '22:00',
              },
              MinAge: '18',
              description: 'Massive live rave at Depot Mayfield.',
              artists: [{ name: 'Bicep' }, { name: 'Four Tet' }],
              genres: [{ name: 'Electronic' }, { name: 'Techno' }],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const element = await PromoteEventPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('Manchester Warehouse Techno Rave');
      expect(html).toContain('Depot Mayfield');
      expect(html).toContain('35.00');
      expect(html).toContain('18+');
      expect(html).toContain('Skiddle Live API');
      expect(html).toContain('Get Tickets on Skiddle');
      expect(html).toContain('Share Event');
      expect(html).toContain('@goldlabelapps/flash');
      expect(html).toContain('data-stage="true"');
    });
  });
});
