import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HighlightText } from '../../src/components/EventSearch/HighlightText';
import {
  EventSearch,
  CATEGORIES,
  stripHtml,
  normalizeEvent,
  addDays,
  formatDateIso,
  formatBritishDate,
  TOTAL_SLIDER_DAYS,
  DATE_PRESETS,
  getPaginationRange,
} from '../../src/components/EventSearch/EventSearch';

describe('EventSearch Component & Helpers', () => {
  describe('HighlightText', () => {
    it('renders normal text without marks when query is empty', () => {
      const html = renderToStaticMarkup(<HighlightText text="Warehouse Project" query="" />);
      expect(html).toBe('<span>Warehouse Project</span>');
    });

    it('highlights matching term case-insensitively', () => {
      const html = renderToStaticMarkup(<HighlightText text="The Warehouse Project Live" query="warehouse" />);
      expect(html).toContain('<mark');
      expect(html).toContain('Warehouse</mark>');
    });

    it('safely handles special regex characters in query string', () => {
      const html = renderToStaticMarkup(<HighlightText text="Event [Special Edition] (2026)" query="[Special" />);
      expect(html).toContain('<mark');
      expect(html).toContain('[Special</mark>');
    });

    it('returns null gracefully when text is null or undefined', () => {
      const html = renderToStaticMarkup(<HighlightText text={null} query="music" />);
      expect(html).toBe('');
    });
  });

  describe('CATEGORIES Configuration', () => {
    it('defines standard Skiddle event categories including All, LIVE, and CLUB', () => {
      const values = CATEGORIES.map((c) => c.value);
      expect(values).toContain('all');
      expect(values).toContain('LIVE');
      expect(values).toContain('CLUB');
      expect(values).toContain('FEST');
      expect(values).toContain('COMEDY');
      expect(values).toContain('THEATRE');
      expect(values).toContain('SPORT');
    });
  });

  describe('Date Slider Configuration and Helpers', () => {
    it('has a 365-day (1 year) range and standard quick presets', () => {
      expect(TOTAL_SLIDER_DAYS).toBe(365);
      expect(DATE_PRESETS.length).toBeGreaterThanOrEqual(4);
      expect(DATE_PRESETS.map((p) => p.label)).toContain('Next 7 Days');
      expect(DATE_PRESETS.map((p) => p.label)).toContain('Full Year');
    });

    it('correctly calculates future dates and formats ISO YYYY-MM-DD strings', () => {
      const base = new Date(2026, 9, 25); // 2026-10-25
      const future = addDays(base, 14);
      expect(formatDateIso(future)).toBe('2026-11-08');
    });
  });

  describe('getPaginationRange Helper', () => {
    it('returns all page numbers when totalPages is 7 or fewer', () => {
      expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getPaginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('returns start-anchored range with trailing ellipsis when currentPage is near the start', () => {
      expect(getPaginationRange(2, 20)).toEqual([1, 2, 3, 4, 5, '...', 20]);
      expect(getPaginationRange(4, 20)).toEqual([1, 2, 3, 4, 5, '...', 20]);
    });

    it('returns end-anchored range with leading ellipsis when currentPage is near the end', () => {
      expect(getPaginationRange(18, 20)).toEqual([1, '...', 16, 17, 18, 19, 20]);
    });

    it('returns middle window with both ellipses when currentPage is in the middle', () => {
      expect(getPaginationRange(10, 20)).toEqual([1, '...', 9, 10, 11, '...', 20]);
    });
  });

  describe('formatBritishDate Helper', () => {
    it('formats ISO YYYY-MM-DD date into British standard (day Month year)', () => {
      expect(formatBritishDate('2027-04-15')).toBe('15 April 2027');
      expect(formatBritishDate('2026-11-20')).toBe('20 November 2026');
    });

    it('formats ISO date with timestamp correctly into British standard', () => {
      expect(formatBritishDate('2026-08-05T20:00:00')).toBe('5 August 2026');
    });

    it('gracefully handles missing, empty, or fallback date strings', () => {
      expect(formatBritishDate('')).toBe('Date TBD');
      expect(formatBritishDate(undefined)).toBe('Date TBD');
      expect(formatBritishDate('Date TBA')).toBe('Date TBA');
    });
  });

  describe('stripHtml Helper', () => {
    it('removes tags and trims whitespace', () => {
      expect(stripHtml('<p>Live at <strong>Depot Mayfield</strong></p>')).toBe('Live at Depot Mayfield');
      expect(stripHtml('   <div><span>Test Text</span></div>   ')).toBe('Test Text');
    });

    it('handles empty or undefined strings cleanly', () => {
      expect(stripHtml('')).toBe('');
      expect(stripHtml(undefined)).toBe('');
    });
  });

  describe('normalizeEvent Helper', () => {
    it('transforms raw Skiddle API v1 payload into normalized EventListItem', () => {
      const rawV1 = {
        id: '42616476',
        eventname: 'Mozart, Made in Manchester',
        description: '<b>Manchester Camerata</b> performs live.',
        date: '2027-04-15',
        venue: {
          name: 'The Stoller Hall',
          town: 'Manchester',
          postcode: 'M3 1DA',
        },
        largeimageurl: 'https://example.com/large.jpg',
        entryprice: '27.50',
        tickets: true,
        eventcode: 'LIVE',
        genres: [{ name: 'Classical' }, { name: 'Orchestral' }],
      };

      const item = normalizeEvent(rawV1);
      expect(item.id).toBe('42616476');
      expect(item.eventName).toBe('Mozart, Made in Manchester');
      expect(item.description).toBe('Manchester Camerata performs live.');
      expect(item.date).toBe('2027-04-15');
      expect(item.venueName).toBe('The Stoller Hall');
      expect(item.venueTown).toBe('Manchester');
      expect(item.imageUrl).toBe('https://example.com/large.jpg');
      expect(item.price).toBe('27.50');
      expect(item.tickets).toBe(true);
      expect(item.eventCode).toBe('LIVE');
      expect(item.genres).toEqual(['Classical', 'Orchestral']);
    });

    it('transforms raw Skiddle API v3 payload with camelCase and fallback fields', () => {
      const rawV3 = {
        listingId: '98765',
        eventName: 'Warehouse Session',
        description: 'Nightclub event',
        startDate: '2026-11-20',
        venue: {
          cityname: 'Leeds',
        },
        imageUrl: 'https://example.com/thumb.jpg',
        entryPrice: '15.00',
        tickets: 0,
        EventCode: 'CLUB',
        genres: ['House', 'Techno'],
      };

      const item = normalizeEvent(rawV3);
      expect(item.id).toBe('98765');
      expect(item.eventName).toBe('Warehouse Session');
      expect(item.venueName).toBe('Venue TBA');
      expect(item.venueTown).toBe('Leeds');
      expect(item.price).toBe('15.00');
      expect(item.tickets).toBe(false);
      expect(item.eventCode).toBe('CLUB');
      expect(item.genres).toEqual(['House', 'Techno']);
    });

    it('supplies defaults when properties are completely empty', () => {
      const item = normalizeEvent({});
      expect(item.id).toBe('');
      expect(item.eventName).toBe('Untitled Event');
      expect(item.description).toBe('');
      expect(item.venueName).toBe('Venue TBA');
      expect(item.venueTown).toBe('');
      expect(item.price).toBe('Price TBA');
      expect(item.tickets).toBe(false);
      expect(item.eventCode).toBe('EVENT');
      expect(item.genres).toEqual([]);
    });
  });

  describe('EventSearch Initial State', () => {
    it('renders search controls, initial loading state, and skeletons on mount', () => {
      const html = renderToStaticMarkup(<EventSearch />);
      // Should render the search box card
      expect(html).toContain("Select a real event from Skiddle&#x27;s production API");
      expect(html).toContain('Search by event title, artist, venue, keyword, or description...');
      expect(html).toContain('From');
      expect(html).toContain('To');

      // Should render initial loading state and skeletons while fetching default results
      expect(html).toContain('Searching Skiddle API');
      expect(html).not.toContain('No events found');
    });

    it('renders category chips for interactive filtering', () => {
      const html = renderToStaticMarkup(<EventSearch />);
      expect(html).toContain('All');
      expect(html).toContain('Live Music / Gigs');
      expect(html).toContain('Clubbing &amp; DJ');
      expect(html).toContain('Festivals');
      expect(html).toContain('aria-pressed="true"'); // "All" is initially selected
    });

    it('renders date range slider with 1-year timeline and From/To controls', () => {
      const html = renderToStaticMarkup(<EventSearch />);
      expect(html).toContain('From');
      expect(html).toContain('To');
      expect(html).toContain('id="min-date-slider"');
      expect(html).toContain('id="max-date-slider"');
      expect(html).toContain('type="range"');
      // Dates header and Next pill buttons are removed to reduce hero height
      expect(html).not.toContain('Quick date presets');
      expect(html).not.toContain('Next 7 Days');
      // Scale labels underneath the slider are removed
      expect(html).not.toContain('+3 Months');
      expect(html).not.toContain('+6 Months');
    });
  });
});
