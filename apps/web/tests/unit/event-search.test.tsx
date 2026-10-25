import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HighlightText } from '../../src/components/EventSearch/HighlightText';
import { EventSearch } from '../../src/components/EventSearch/EventSearch';

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
