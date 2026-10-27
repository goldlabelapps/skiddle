import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PromoVenueDateMC,
  formatPromoDate,
} from '../../src/components/PromoFlash/MovieClips/PromoVenueDateMC';
import { PromoFlash } from '../../src/components/PromoFlash';

describe('PromoVenueDateMC Venue & Date Display', () => {
  describe('formatPromoDate Utility', () => {
    it('formats YYYY-MM-DD date string to readable format with weekday', () => {
      const formatted = formatPromoDate('2027-04-15');
      expect(formatted).toContain('15 Apr 2027');
    });

    it('formats native Date object correctly', () => {
      const date = new Date(2027, 3, 15);
      const formatted = formatPromoDate(date);
      expect(formatted).toContain('15 Apr 2027');
    });

    it('handles ISO strings with timestamps', () => {
      const formatted = formatPromoDate('2027-04-15T19:30:00Z');
      expect(formatted).toContain('15 Apr 2027');
    });

    it('returns empty string for undefined or empty inputs', () => {
      expect(formatPromoDate(undefined)).toBe('');
      expect(formatPromoDate('')).toBe('');
    });
  });

  describe('Component Rendering', () => {
    it('renders date pill with calendar icon and doors open time', () => {
      const html = renderToStaticMarkup(
        <PromoVenueDateMC date="2027-04-15" doorsOpen="19:30" />
      );

      expect(html).toContain('data-testid="promo-venue-date-mc"');
      expect(html).toContain('data-testid="promo-date-row"');
      expect(html).toContain('15 Apr 2027');
      expect(html).toContain('Doors 19:30');
    });

    it('renders venue pill with map pin icon, venue name, and city', () => {
      const html = renderToStaticMarkup(
        <PromoVenueDateMC
          venueName="The Stoller Hall"
          venueCity="Manchester"
        />
      );

      expect(html).toContain('data-testid="promo-venue-date-mc"');
      expect(html).toContain('data-testid="promo-venue-row"');
      expect(html).toContain('The Stoller Hall');
      expect(html).toContain('Manchester');
    });

    it('extracts venue and date from Skiddle event detail object', () => {
      const mockEvent = {
        venue: {
          id: '75988',
          name: 'Depot Mayfield',
          town: 'Manchester',
        },
        date: '2027-04-15',
        openingtimes: {
          doorsopen: '20:00',
        },
      };

      const html = renderToStaticMarkup(<PromoVenueDateMC event={mockEvent} />);

      expect(html).toContain('data-testid="promo-venue-date-mc"');
      expect(html).toContain('data-testid="promo-date-row"');
      expect(html).toContain('15 Apr 2027');
      expect(html).toContain('Doors 20:00');
      expect(html).toContain('data-testid="promo-venue-row"');
      expect(html).toContain('Depot Mayfield');
      expect(html).toContain('Manchester');
    });

    it('omits rendering when neither venue nor date is provided', () => {
      const html = renderToStaticMarkup(<PromoVenueDateMC event={{}} />);
      expect(html).toBe('');
    });
  });

  describe('PromoFlash Integration', () => {
    it('renders PromoFlash with event title, flyer image, venue, date, description, and actions', () => {
      const mockEvent = {
        id: '43032215',
        eventname: 'Mozart, Made in Manchester',
        venue: {
          id: '75988',
          name: 'The Stoller Hall',
          town: 'Manchester',
        },
        date: '2027-04-15',
        openingtimes: {
          doorsopen: '19:30',
        },
        imageurl: 'https://example.com/flyer.jpg',
        description: 'Spectacular classical concert in Manchester.',
      };

      const html = renderToStaticMarkup(
        <PromoFlash id="43032215" event={mockEvent} />
      );

      expect(html).toContain('data-testid="promo-flash"');
      expect(html).toContain('data-testid="promo-title-container"');
      expect(html).toContain('data-testid="flash-image-mc"');
      expect(html).toContain('data-testid="promo-venue-date-mc"');
      expect(html).toContain('data-testid="promo-date-row"');
      expect(html).toContain('15 Apr 2027');
      expect(html).toContain('Doors 19:30');
      expect(html).toContain('data-testid="promo-venue-row"');
      expect(html).toContain('The Stoller Hall');
      expect(html).toContain('Manchester');
      expect(html).toContain('data-testid="promo-description"');
      expect(html).toContain('data-testid="promo-actions-mc"');
    });
  });
});
