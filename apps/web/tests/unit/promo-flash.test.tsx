import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PromoFlash,
  cleanDescription,
  SkiddleLogoMC,
  PromoCtaMC,
  TicketIcon,
  ArrowRightIcon,
  PromoActionsMC,
  FacebookIcon,
  TwitterXIcon,
  MailIcon,
  SearchIcon,
  SkiddleIcon,
  FacebookShareButton,
  TwitterShareButton,
  XShareButton,
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
    // Ensure PromoFlash container is not clickable/does not replay on container click
    expect(html).not.toContain('role="button"');
    expect(html).not.toContain('title="Click to replay');
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
    // Verifies strict 3-line clamp constraints to prevent title overflowing over 3 lines
    expect(html).toContain('-webkit-line-clamp:3');
    expect(html).toContain('line-clamp:3');
    expect(html).toContain('-webkit-box-orient:vertical');
    expect(html).toContain('overflow:hidden');
    expect(html).toContain('text-overflow:ellipsis');
  });

  it('enforces 3-line clamp and scales typography to 1rem for very long event titles (>90 chars)', () => {
    const extraLongTitle =
      'The Ultimate Annual Summer Electronic Dance Festival 2026 - Live in Concert with Special International Guest DJs and Visual Artists';
    const html = renderToStaticMarkup(
      <PromoFlash id="43032215" event={{ eventname: extraLongTitle }} />
    );

    expect(html).toContain('data-testid="promo-title-container"');
    expect(html).toContain('font-size:1rem');
    expect(html).toContain('-webkit-line-clamp:3');
    expect(html).toContain('line-clamp:3');
    expect(html).toContain('-webkit-box-orient:vertical');
    expect(html).toContain('overflow:hidden');
    expect(html).toContain('text-overflow:ellipsis');
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

  it('renders PromoActionsMC with Facebook, Twitter (X), Email, and Skiddle (More events) action buttons at the bottom', () => {
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
    expect(html).toContain('data-testid="skiddle-icon"');
    expect(html).toContain('aria-label="Share to Facebook"');
    expect(html).toContain('aria-label="Share to Twitter (X)"');
    expect(html).toContain('aria-label="Share via Email"');
    expect(html).toContain('aria-label="More events"');
    expect(html).toContain('background-color:#1877F2');
    expect(html).toContain('background-color:#000000');
    expect(html).toContain('background-color:#00d26a');
    expect(html).toContain('background-color:#111827');
    // Verifies round border-radius on Facebook & Twitter buttons
    expect(html).toContain('border-radius:50%');
    // Verifies react-share button component classes
    expect(html).toContain('react-share__ShareButton');
  });

  it('hooks up react-share FacebookShareButton and TwitterShareButton (XShareButton) with shareUrl and title', () => {
    expect(FacebookShareButton).toBeDefined();
    expect(TwitterShareButton).toBeDefined();
    expect(XShareButton).toBeDefined();

    const customUrl = 'https://www.skiddle.com/e/43032215/';
    const customTitle = 'Unmissable Techno Night';

    const html = renderToStaticMarkup(
      <PromoActionsMC
        shareUrl={customUrl}
        shareTitle={customTitle}
        actions={getDefaultPromoActions({
          id: '43032215',
          event: { eventname: customTitle },
          shareUrl: customUrl,
        })}
      />
    );

    expect(html).toContain('data-testid="promo-action-facebook"');
    expect(html).toContain('data-testid="promo-action-twitter"');
    expect(html).toContain('aria-label="Share to Facebook"');
    expect(html).toContain('aria-label="Share to Twitter (X)"');
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

  describe('cleanDescription helper', () => {
    it('strips HTML tags and decodes entities cleanly', () => {
      expect(
        cleanDescription(
          '<p>Underground warehouse techno experience &amp; live visuals &pound;15.</p>'
        )
      ).toBe('Underground warehouse techno experience & live visuals £15.');
      expect(cleanDescription('   <div><span>Test &quot;Quotes&#39;</span></div>   ')).toBe(
        'Test "Quotes\''
      );
      expect(cleanDescription('')).toBe('');
      expect(cleanDescription(undefined)).toBe('');
    });
  });

  describe('Event Description Underneath Featured Image', () => {
    it('renders event description underneath the featured image when provided in event data', () => {
      const html = renderToStaticMarkup(
        <PromoFlash
          id="43032215"
          event={{
            eventname: 'Manchester Warehouse Techno Rave',
            imageurl: 'https://example.com/event.jpg',
            description: '<p>Underground warehouse techno experience in Manchester.</p>',
          }}
        />
      );

      expect(html).toContain('data-testid="flash-image-mc"');
      expect(html).toContain('data-testid="promo-description"');
      expect(html).toContain('Underground warehouse techno experience in Manchester.');
      // When description is present, image width scales to 220px to leave comfortable vertical spacing
      expect(html).toContain('width:220px');
    });

    it('renders custom description prop when provided directly', () => {
      const html = renderToStaticMarkup(
        <PromoFlash
          id="43032215"
          event={{
            eventname: 'Intimate Acoustic Session',
          }}
          description="Special acoustic performance featuring special guests."
        />
      );

      expect(html).toContain('data-testid="promo-description"');
      expect(html).toContain('Special acoustic performance featuring special guests.');
    });

    it('scales down typography for long descriptions exceeding 180 characters', () => {
      const longDescription =
        'Manchester Camerata return to Stoller Hall for an extraordinary evening celebrating the genius of Mozart with full orchestral performance, guest soloists, and exceptional acoustics.';
      const html = renderToStaticMarkup(
        <PromoFlash
          id="43032215"
          event={{
            eventname: 'Mozart Concert',
            description: longDescription,
          }}
        />
      );

      expect(html).toContain('data-testid="promo-description"');
      expect(html).toContain('font-size:0.75rem');
      expect(html).toContain(longDescription);
    });

    it('omits description container when no description is present', () => {
      const html = renderToStaticMarkup(
        <PromoFlash id="43032215" event={{ eventname: 'Event Without Description' }} />
      );

      expect(html).not.toContain('data-testid="promo-description"');
    });

    it('initializes separatePromoActionScript timeline with descriptionTarget', () => {
      const mockText = { nodeType: 1, style: {} } as unknown as HTMLElement;
      const mockImage = { nodeType: 1, style: {} } as unknown as HTMLElement;
      const mockDesc = { nodeType: 1, style: {} } as unknown as HTMLElement;
      const onComplete = vi.fn();

      const tl = separatePromoActionScript({
        textTarget: mockText,
        imageTarget: mockImage,
        descriptionTarget: mockDesc,
        textY: -150,
        imageY: -10,
        descriptionY: 155,
        duration: 0.8,
        delay: 0.2,
        onComplete,
      });

      expect(tl).toBeDefined();
      expect(typeof tl?.to).toBe('function');
    });
  });

  describe('PromoCtaMC High-Impact "Buy Tickets" CTA', () => {
    it('renders PromoCtaMC with label "Buy Tickets" and blank target', () => {
      const html = renderToStaticMarkup(
        <PromoCtaMC
          eventId="43032215"
          event={{
            eventname: 'Manchester Summer Festival',
            link: 'https://www.skiddle.com/e/43032215/',
          }}
        />
      );

      expect(html).toContain('data-testid="promo-cta-mc"');
      expect(html).toContain('data-testid="promo-cta-button"');
      expect(html).toContain('Buy Tickets');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('href="https://www.skiddle.com/e/43032215/"');
      expect(html).toContain('data-testid="promo-cta-ticket-icon"');
      expect(html).toContain('data-testid="promo-cta-arrow-icon"');
    });

    it('falls back to default Skiddle event URL if no explicit link is provided', () => {
      const html = renderToStaticMarkup(
        <PromoCtaMC eventId="998877" />
      );

      expect(html).toContain('href="https://www.skiddle.com/e/998877/"');
    });

    it('applies ready class when isReady is true to trigger looping attention animation', () => {
      const htmlReady = renderToStaticMarkup(
        <PromoCtaMC eventId="43032215" isReady={true} />
      );
      expect(htmlReady).toContain('ready');

      const htmlNotReady = renderToStaticMarkup(
        <PromoCtaMC eventId="43032215" isReady={false} />
      );
      expect(htmlNotReady).not.toContain('ready');
    });

    it('renders PromoCtaMC seamlessly within PromoFlash container', () => {
      const html = renderToStaticMarkup(
        <PromoFlash
          id="43032215"
          event={{
            eventname: 'Warehouse Project Live',
            link: 'https://www.skiddle.com/whats-on/Manchester/Depot-Mayfield/Warehouse-Project/43032215/',
          }}
        />
      );

      expect(html).toContain('data-testid="promo-cta-mc"');
      expect(html).toContain('data-testid="promo-cta-button"');
      expect(html).toContain('Buy Tickets');
      expect(html).toContain('href="https://www.skiddle.com/whats-on/Manchester/Depot-Mayfield/Warehouse-Project/43032215/"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    it('allows custom label and custom buyUrl override', () => {
      const html = renderToStaticMarkup(
        <PromoFlash
          id="43032215"
          buyLabel="Buy Tickets Now"
          buyUrl="https://www.skiddle.com/custom-tickets/"
        />
      );

      expect(html).toContain('Buy Tickets Now');
      expect(html).toContain('href="https://www.skiddle.com/custom-tickets/"');
    });
  });
});
