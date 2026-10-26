import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PromoPage, { generateMetadata } from '../../src/app/promo/[id]/page';

describe('PromoPage 3D Venue Experience', () => {
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
    it('returns appropriate title and description for the venue experience', async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ id: '42616476' }) });
      expect(meta.title).toBe('Event #42616476 | Skiddle Venue 3D');
      expect(meta.description).toContain('42616476');
    });
  });

  describe('PromoPage Rendering', () => {
    it('renders responsive iPhone frame and fallback venue when SKIDDLE_API_KEY is not configured', async () => {
      const element = await PromoPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('data-testid="iphone-frame"');
      expect(html).toContain('data-testid="phone-screen"');
      expect(html).toContain('data-testid="phone-dynamic-island"');
      expect(html).toContain('data-testid="phone-status-bar"');
      expect(html).toContain('Back to Event Details');
      expect(html).toContain('href="/events/42616476"');
      expect(html).toContain('Hare And Hounds Kings Heath');
    });

    it('renders event venue coordinates in embed iframe when API resolves successfully', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            results: {
              id: '42616476',
              eventname: 'Manchester Warehouse Techno Rave',
              venue: {
                id: '54321',
                name: 'Depot Mayfield',
                address: '11 Barmouth Street',
                town: 'Manchester',
                postcode: 'M1 2PY',
                countrycode: 'GB',
                latitude: '53.47510000',
                longitude: '-2.22550000',
              },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const element = await PromoPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('data-testid="iphone-frame"');
      expect(html).toContain('Depot Mayfield');
      expect(html).toContain('lat=53.47510000');
      expect(html).toContain('lng=-2.22550000');
      expect(html).toContain('href="/events/42616476"');
    });

    it('falls back gracefully to default venue when API returns an error', async () => {
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

      const element = await PromoPage({ params: Promise.resolve({ id: '99999999' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('data-testid="iphone-frame"');
      expect(html).toContain('Hare And Hounds Kings Heath');
      expect(html).toContain('href="/events/99999999"');
    });
  });
});
