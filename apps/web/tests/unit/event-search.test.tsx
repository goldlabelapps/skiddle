import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HighlightText } from '../../src/components/EventSearch/HighlightText';
import {
  EventSearch,
  CATEGORIES,
  stripHtml,
  normalizeEvent,
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
    it('does not render any events or results row before user interaction', () => {
      const html = renderToStaticMarkup(<EventSearch />);
      // Should render the hero and search box card
      expect(html).toContain('Find an Event to Promote');
      expect(html).toContain('Search by event title, artist, venue, keyword, or description...');
      expect(html).toContain('Category / Event Code');
      expect(html).toContain('Event Date');

      // Should NOT render results, meta row, spinner, or empty state initially
      expect(html).not.toContain('Found');
      expect(html).not.toContain('Searching Skiddle API');
      expect(html).not.toContain('Promote Event');
      expect(html).not.toContain('No events found');
    });
  });
});
