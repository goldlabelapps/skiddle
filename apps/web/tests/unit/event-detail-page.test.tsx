import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import EventDetailPage, { generateMetadata } from '../../src/app/events/[id]/page';

describe('EventDetailPage Component & Metadata', () => {
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
    it('returns appropriate title and description including event id', async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ id: '42616476' }) });
      expect(meta.title).toBe('Promote Event #42616476 | Skiddle');
      expect(meta.description).toContain('42616476');
    });
  });

  describe('EventDetailPage Rendering', () => {
    it('renders API Key Missing screen when SKIDDLE_API_KEY is not configured', async () => {
      const element = await EventDetailPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('API Key Missing');
      expect(html).toContain('SKIDDLE_API_KEY is not configured');
      expect(html).toContain('Return to Event Search');
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

      const element = await EventDetailPage({ params: Promise.resolve({ id: '99999999' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('Unable to Load Event #99999999');
      expect(html).toContain('Listing not found');
      expect(html).toContain('Back to Event Search');
    });

    it('renders EventDetailClient with event data on successful API retrieval', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            results: {
              id: '42616476',
              eventname: 'Mozart, Made in Manchester',
              venue: {
                name: 'The Stoller Hall',
                town: 'Manchester',
                postcode: 'M3 1DA',
              },
              date: '2027-04-15',
              entryprice: '27.50',
              tickets: true,
              description: 'Live performance by Manchester Camerata.',
              genres: [{ name: 'Classical' }],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const element = await EventDetailPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('Mozart, Made in Manchester');
      expect(html).toContain('The Stoller Hall');
      expect(html).toContain('ID: 42616476');
      expect(html).toContain('Back to Event Search');
    });
  });
});
