import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import GpxRouteSkiddleVenuePage, { metadata } from '../../src/app/gpxroute/skiddle-venue/page';
import {
  buildVenueEmbedUrl,
  sanitizeHost,
  formatDimension,
  DEFAULT_HOST,
} from '../../src/components/SkiddleVenue';

describe('GpxRoute Skiddle Venue Subpage', () => {
  describe('Metadata', () => {
    it('provides valid SEO metadata for Hare and Hounds venue', () => {
      expect(metadata.title).toBe('Hare And Hounds Kings Heath | Skiddle Venue');
      expect(metadata.description).toBe('Skiddle venue 3D view');
    });
  });

  describe('Page Rendering', () => {
    it('renders the SkiddleVenue iframe with Hare and Hounds embed parameters', () => {
      const html = renderToStaticMarkup(<GpxRouteSkiddleVenuePage />);

      expect(html).toContain('title="Skiddle Venue: Hare And Hounds Kings Heath"');
      expect(html).toContain('/venue/embed?');
      expect(html).toContain('lat=52.43462200');
      expect(html).toContain('lng=-1.89298000');
      expect(html).toContain('orbit=1');
      expect(html).toContain('name=Hare+And+Hounds+Kings+Heath');
      expect(html).toContain('id=38952');
      expect(html).toContain('gpxroute-venue-container');
    });

    it('renders the responsive iPhone frame structure with hardware buttons and dynamic island', () => {
      const html = renderToStaticMarkup(<GpxRouteSkiddleVenuePage />);

      expect(html).toContain('data-testid="iphone-frame"');
      expect(html).toContain('data-testid="phone-screen"');
      expect(html).toContain('data-testid="phone-status-bar"');
      expect(html).toContain('9:41');
      expect(html).toContain('data-testid="phone-dynamic-island"');
      expect(html).toContain('data-testid="phone-home-indicator"');

      // Hardware buttons
      expect(html).toContain('data-testid="phone-button-action"');
      expect(html).toContain('data-testid="phone-button-vol-up"');
      expect(html).toContain('data-testid="phone-button-vol-down"');
      expect(html).toContain('data-testid="phone-button-power"');
    });
  });

  describe('GpxRoute / SkiddleVenue Utilities', () => {
    it('sanitizes host URLs properly', () => {
      expect(sanitizeHost('https://gpxroute.pro/')).toBe('https://gpxroute.pro');
      expect(sanitizeHost('')).toBe(DEFAULT_HOST);
    });

    it('formats dimensions with fallback', () => {
      expect(formatDimension(500)).toBe('500px');
      expect(formatDimension('100%')).toBe('100%');
      expect(formatDimension(undefined, '100%')).toBe('100%');
    });

    it('throws error when building embed URL without coordinates', () => {
      expect(() =>
        buildVenueEmbedUrl({
          venue: { name: 'Test', latitude: '', longitude: '' },
        })
      ).toThrow(/latitude and longitude are required/);
    });
  });
});
