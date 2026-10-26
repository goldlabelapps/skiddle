import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PromoFlash,
  SkiddleLogoMC,
  promoActionScript,
} from '../../src/components/PromoFlash';

describe('PromoFlash Modular Component Architecture', () => {
  it('renders PromoFlash with Flash Stage and SkiddleLogoMC MovieClip', () => {
    const html = renderToStaticMarkup(
      <PromoFlash id="43032215" event={{ eventname: 'Test Event' }} />
    );

    expect(html).toContain('data-testid="promo-flash"');
    expect(html).toContain('data-stage="true"');
    expect(html).toContain('data-testid="skiddle-logo-mc"');
    expect(html).toContain('aria-label="Skiddle Logo"');
    expect(html).toContain('viewBox="0 0 500 500"');
    expect(html).toContain('data-testid="promo-title-container"');
    expect(html).toContain('data-testid="clever-text"');
    expect(html).toContain('aria-label="Test Event"');
  });

  it('renders CleverText MovieClip scaling down typography for long multi-line titles', () => {
    const longTitle = 'Mozart, Made in Manchester - An Evening of Classical Masterpieces with Full Orchestra';
    const html = renderToStaticMarkup(
      <PromoFlash id="43032215" event={{ eventname: longTitle }} />
    );

    expect(html).toContain('data-testid="promo-title-container"');
    expect(html).toContain('data-testid="clever-text"');
    expect(html).toContain('aria-label="Mozart, Made in Manchester - An Evening of Classical Masterpieces with Full Orchestra"');
    // Verifies dynamic autoSize scaling to 1.125rem for >60 chars
    expect(html).toContain('font-size:1.125rem');
    expect(html).toContain('word-break:break-word');
  });

  it('renders SkiddleLogoMC MovieClip with customized size and color', () => {
    const html = renderToStaticMarkup(
      <SkiddleLogoMC size={200} color="#111827" aria-label="Dark Logo" />
    );

    expect(html).toContain('data-testid="skiddle-logo-mc"');
    expect(html).toContain('aria-label="Dark Logo"');
    expect(html).toContain('width:200px');
    expect(html).toContain('height:200px');
    expect(html).toContain('fill="#111827"');
    // Verifies path coordinate from skiddle-logo-dark.svg
    expect(html).toContain('M328.42,205.68');
  });

  it('initializes promoActionScript GSAP timeline for vertical and horizontal centering', () => {
    const mockElement = { nodeType: 1, style: {} } as unknown as HTMLElement;
    const onComplete = vi.fn();

    const tl = promoActionScript({
      target: mockElement,
      duration: 0.5,
      delay: 0,
      onComplete,
    });

    expect(tl).toBeDefined();
    expect(typeof tl?.to).toBe('function');
  });

  it('renders ImageMC MovieClip when imageurl is provided in event data', () => {
    const html = renderToStaticMarkup(
      <PromoFlash
        id="43032215"
        event={{
          eventname: 'Manchester Warehouse Techno Rave',
          imageurl: 'https://example.com/event-thumb.jpg',
          largeimageurl: 'https://example.com/event-large.jpg',
        }}
      />
    );

    expect(html).toContain('data-testid="flash-image-mc"');
    expect(html).toContain('src="https://example.com/event-thumb.jpg"');
    expect(html).toContain('alt="Manchester Warehouse Techno Rave"');
  });
});
