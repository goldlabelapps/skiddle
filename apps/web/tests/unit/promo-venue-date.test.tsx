import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PromoVenueDateMC,
  PromoDateChipMC,
  PromoVenueMC,
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
    it('renders PromoDateChipMC date pill with calendar icon and doors open time', () => {
      const html = renderToStaticMarkup(
        <PromoDateChipMC date="2027-04-15" doorsOpen="19:30" />
      );

      expect(html).toContain('data-testid="promo-date-chip-mc"');
      expect(html).toContain('data-testid="promo-date-row"');
      expect(html).toContain('15 Apr 2027');
      expect(html).toContain('Doors 19:30');
    });

    it('renders PromoVenueMC venue pill with map pin icon, venue name, and city', () => {
      const html = renderToStaticMarkup(
        <PromoVenueMC
          venueName="The Stoller Hall"
          venueCity="Manchester"
        />
      );

      expect(html).toContain('data-testid="promo-venue-mc"');
      expect(html).toContain('data-testid="promo-venue-row"');
      expect(html).toContain('The Stoller Hall');
      expect(html).toContain('Manchester');
    });

    it('renders date pill with calendar icon and doors open time in compound PromoVenueDateMC', () => {
      const html = renderToStaticMarkup(
        <PromoVenueDateMC date="2027-04-15" doorsOpen="19:30" />
      );

      expect(html).toContain('data-testid="promo-venue-date-mc"');
      expect(html).toContain('data-testid="promo-date-row"');
      expect(html).toContain('15 Apr 2027');
      expect(html).toContain('Doors 19:30');
    });

    it('renders venue pill with map pin icon, venue name, and city in compound PromoVenueDateMC', () => {
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
    it('renders PromoFlash with date chip above title, flyer image, venue, description, and actions', () => {
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
      expect(html).toContain('data-testid="promo-date-chip-mc"');
      expect(html).toContain('data-testid="promo-title-container"');
      expect(html).toContain('data-testid="flash-image-mc"');
      expect(html).toContain('data-testid="promo-venue-mc"');
      expect(html).toContain('data-testid="promo-date-row"');
      expect(html).toContain('15 Apr 2027');
      expect(html).toContain('Doors 19:30');
      expect(html).toContain('data-testid="promo-venue-row"');
      expect(html).toContain('The Stoller Hall');
      expect(html).toContain('Manchester');
      expect(html).toContain('data-testid="promo-description"');
      expect(html).toContain('data-testid="promo-actions-mc"');

      // Assert visual hierarchy order: Date chip is above title, title is above image, image is above venue
      const dateIndex = html.indexOf('data-testid="promo-date-chip-mc"');
      const titleIndex = html.indexOf('data-testid="promo-title-container"');
      const imageIndex = html.indexOf('data-testid="flash-image-mc"');
      const venueIndex = html.indexOf('data-testid="promo-venue-mc"');

      expect(dateIndex).toBeGreaterThan(-1);
      expect(titleIndex).toBeGreaterThan(-1);
      expect(imageIndex).toBeGreaterThan(-1);
      expect(venueIndex).toBeGreaterThan(-1);

      expect(dateIndex).toBeLessThan(titleIndex);
      expect(titleIndex).toBeLessThan(imageIndex);
      expect(imageIndex).toBeLessThan(venueIndex);
    });

    it('positions dateTarget just under the top and spreads elements out across separatePromoActionScript', async () => {
      const { separatePromoActionScript } = await import(
        '../../src/components/PromoFlash/ActionScript/promoActionScript'
      );
      const mockText = { nodeType: 1, style: {} } as unknown as HTMLElement;
      const mockImage = { nodeType: 1, style: {} } as unknown as HTMLElement;
      const mockDate = { nodeType: 1, style: {} } as unknown as HTMLElement;
      const mockVenue = { nodeType: 1, style: {} } as unknown as HTMLElement;
      const mockDesc = { nodeType: 1, style: {} } as unknown as HTMLElement;

      const tl = separatePromoActionScript({
        textTarget: mockText,
        imageTarget: mockImage,
        dateTarget: mockDate,
        venueTarget: mockVenue,
        descriptionTarget: mockDesc,
        dateY: -308,
        textY: -235,
        imageY: -85,
        venueY: 32,
        descriptionY: 115,
      });

      expect(tl).toBeDefined();
      expect(typeof tl?.to).toBe('function');
      expect(typeof tl?.fromTo).toBe('function');
    });
  });
});
