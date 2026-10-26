import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PromoFlash,
  SkiddleLogoMC,
  PromoActionsMC,
  FacebookIcon,
  TwitterXIcon,
  MailIcon,
  SearchIcon,
  getDefaultPromoActions,
  promoActionScript,
  separatePromoActionScript,
  promoActionsActionScript,
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

  it('initializes separatePromoActionScript timeline moving CleverText up and ImageMC down', () => {
    const mockText = { nodeType: 1, style: {} } as unknown as HTMLElement;
    const mockImage = { nodeType: 1, style: {} } as unknown as HTMLElement;
    const onComplete = vi.fn();

    const tl = separatePromoActionScript({
      textTarget: mockText,
      imageTarget: mockImage,
      textY: -130,
      imageY: 110,
      duration: 0.8,
      delay: 0.2,
      onComplete,
    });

    expect(tl).toBeDefined();
    expect(typeof tl?.to).toBe('function');
  });

  it('renders ImageMC MovieClip prioritizing largeimageurl when provided in event data', () => {
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
    expect(html).toContain('src="https://example.com/event-large.jpg"');
    expect(html).toContain('alt="Manchester Warehouse Techno Rave"');
    expect(html).toContain('aspect-ratio:1/1');
  });

  it('falls back to imageurl when largeimageurl is not provided', () => {
    const html = renderToStaticMarkup(
      <PromoFlash
        id="43032215"
        event={{
          eventname: 'Intimate Acoustic Session',
          imageurl: 'https://example.com/fallback-thumb.jpg',
        }}
      />
    );

    expect(html).toContain('data-testid="flash-image-mc"');
    expect(html).toContain('src="https://example.com/fallback-thumb.jpg"');
    expect(html).toContain('alt="Intimate Acoustic Session"');
  });

  it('renders PromoActionsMC with Facebook, Twitter (X), Email, and Search action buttons at the bottom', () => {
    const html = renderToStaticMarkup(
      <PromoFlash id="43032215" event={{ eventname: 'Action Buttons Event' }} />
    );

    expect(html).toContain('data-testid="promo-actions-mc"');
    expect(html).toContain('data-testid="promo-actions-row"');
    expect(html).toContain('data-testid="promo-actions-label"');
    expect(html).toContain('data-testid="promo-action-facebook"');
    expect(html).toContain('data-testid="promo-action-twitter"');
    expect(html).toContain('data-testid="promo-action-email"');
    expect(html).toContain('data-testid="promo-action-search"');
    expect(html).toContain('aria-label="Share to Facebook"');
    expect(html).toContain('aria-label="Share to Twitter (X)"');
    expect(html).toContain('aria-label="Share via Email"');
    expect(html).toContain('aria-label="More events"');
    expect(html).toContain('background-color:#1877F2');
    expect(html).toContain('background-color:#000000');
    expect(html).toContain('background-color:#ea4335');
    expect(html).toContain('background-color:#111827');
  });

  it('renders custom action buttons in PromoActionsMC when passed', () => {
    const customActions = [
      ...getDefaultPromoActions(),
      {
        id: 'whatsapp',
        label: 'Share to WhatsApp',
        ariaLabel: 'Share to WhatsApp',
        backgroundColor: '#25D366',
        color: '#ffffff',
        icon: <span data-testid="whatsapp-icon">WA</span>,
      },
    ];

    const html = renderToStaticMarkup(
      <PromoActionsMC actions={customActions} />
    );

    expect(html).toContain('data-testid="promo-action-facebook"');
    expect(html).toContain('data-testid="promo-action-search"');
    expect(html).toContain('data-testid="promo-action-whatsapp"');
    expect(html).toContain('data-testid="whatsapp-icon"');
    expect(html).toContain('background-color:#25D366');
  });

  it('initializes promoActionsActionScript GSAP timeline for 1-by-1 presentation', () => {
    const mockContainer = {
      getBoundingClientRect: () => ({ width: 390, height: 800, left: 0, top: 0 }),
      nodeType: 1,
      style: {},
    } as unknown as HTMLElement;

    const mockBtn1 = {
      getBoundingClientRect: () => ({ width: 48, height: 48, left: 140, top: 740 }),
      nodeType: 1,
      style: {},
    } as unknown as HTMLElement;

    const mockBtn2 = {
      getBoundingClientRect: () => ({ width: 48, height: 48, left: 200, top: 740 }),
      nodeType: 1,
      style: {},
    } as unknown as HTMLElement;

    const mockLabel = {
      textContent: '',
      nodeType: 1,
      style: {},
    } as unknown as HTMLElement;

    const onComplete = vi.fn();
    const actions = getDefaultPromoActions();

    const tl = promoActionsActionScript({
      container: mockContainer,
      buttons: [mockBtn1, mockBtn2],
      labelTarget: mockLabel,
      actions,
      onComplete,
    });

    expect(tl).toBeDefined();
    expect(typeof tl?.to).toBe('function');
  });
});
