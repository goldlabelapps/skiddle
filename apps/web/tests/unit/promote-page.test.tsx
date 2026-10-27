import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PromoPage, { generateMetadata } from '../../src/app/promo/[id]/page';

describe('PromoPage PromoFlash Experience', () => {
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
    it('returns appropriate title and description fallback when API key is missing', async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ id: '42616476' }) });
      expect(meta.title).toBe('Event #42616476 | Skiddle Promo');
      expect(meta.description).toContain('42616476');
    });

    it('returns event title, description, and large image for OpenGraph and Twitter cards when API succeeds', async () => {
      process.env.SKIDDLE_API_KEY = 'mock_key';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 0,
            results: {
              id: '42616476',
              eventname: 'Manchester Warehouse Techno Rave',
              description: '<p>Underground warehouse techno experience.</p>',
              largeimageurl: 'https://example.com/large.jpg',
              imageurl: 'https://example.com/thumb.jpg',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const meta = await generateMetadata({ params: Promise.resolve({ id: '42616476' }) });
      expect(meta.title).toBe('Manchester Warehouse Techno Rave');
      expect(meta.description).toBe('Underground warehouse techno experience.');
      expect(meta.openGraph?.title).toBe('Manchester Warehouse Techno Rave');
      expect(meta.openGraph?.description).toBe('Underground warehouse techno experience.');
      expect(meta.openGraph?.images).toEqual([
        {
          url: 'https://example.com/large.jpg',
          alt: 'Manchester Warehouse Techno Rave',
        },
      ]);
      const twitter = meta.twitter as { card?: string; title?: string; description?: string; images?: string[] };
      expect(twitter?.card).toBe('summary_large_image');
      expect(twitter?.title).toBe('Manchester Warehouse Techno Rave');
      expect(twitter?.description).toBe('Underground warehouse techno experience.');
      expect(twitter?.images).toEqual(['https://example.com/large.jpg']);
    });
  });

  describe('PromoPage Rendering', () => {
    it('renders responsive iPhone frame with PromoFlash and white background without back button', async () => {
      const element = await PromoPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('data-testid="iphone-frame"');
      expect(html).toContain('data-testid="phone-screen"');
      expect(html).toContain('data-testid="phone-dynamic-island"');
      expect(html).toContain('data-testid="phone-status-bar"');
      expect(html).toContain('bg-white');
      expect(html).toContain('background-color:#ffffff');
      expect(html).toContain('md:p-8');

      // PromoFlash component rendered inside the view area
      expect(html).toContain('data-testid="promo-flash"');
      expect(html).toContain('data-testid="skiddle-logo-mc"');

      // Back to event details button is removed
      expect(html).not.toContain('Back to Event Details');
      expect(html).not.toContain('href="/events/42616476"');
    });

    it('renders PromoFlash when API resolves successfully', async () => {
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
              },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const element = await PromoPage({ params: Promise.resolve({ id: '42616476' }) });
      const html = renderToStaticMarkup(element);

      expect(html).toContain('data-testid="iphone-frame"');
      expect(html).toContain('data-testid="promo-flash"');
      expect(html).toContain('data-testid="skiddle-logo-mc"');
      expect(html).not.toContain('Back to Event Details');
    });

    it('falls back gracefully when API returns an error', async () => {
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
      expect(html).toContain('data-testid="promo-flash"');
      expect(html).toContain('data-testid="skiddle-logo-mc"');
      expect(html).not.toContain('Back to Event Details');
    });
  });
});
