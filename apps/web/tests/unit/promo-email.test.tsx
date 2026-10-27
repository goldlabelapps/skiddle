import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PromoEmailModal } from '../../src/components/PromoFlash/MovieClips/PromoEmailModal';
import {
  PromoActionsMC,
  getDefaultPromoActions,
} from '../../src/components/PromoFlash';
import { POST } from '../../src/app/api/promo/email/route';

// Mock sendTemplatedEmail so no live network calls happen during test
vi.mock('@goldlabelapps/notify', async () => {
  const actual = await vi.importActual<any>('@goldlabelapps/notify');
  return {
    ...actual,
    sendTemplatedEmail: vi.fn().mockResolvedValue({ id: 'mock-notify-id' }),
  };
});

describe('Search Button & Email Sharing Flow', () => {
  let prevWindow: any;

  beforeEach(() => {
    vi.clearAllMocks();
    prevWindow = (globalThis as any).window;
    (globalThis as any).window = {
      location: { href: '/promo/43032215' },
    };
  });

  afterEach(() => {
    (globalThis as any).window = prevWindow;
  });

  describe('Search Action Button', () => {
    it('configures the search button with default action to route back to homepage', () => {
      const actions = getDefaultPromoActions();
      const searchAction = actions.find((a) => a.id === 'search');

      expect(searchAction).toBeDefined();
      expect(searchAction?.label).toBe('More events');
      expect(searchAction?.ariaLabel).toBe('More events');
      expect(searchAction?.backgroundColor).toBe('#111827');
      expect(typeof searchAction?.onClick).toBe('function');

      const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
      searchAction?.onClick?.(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect((globalThis as any).window.location.href).toBe('/');
    });

    it('renders the search button with More events accessible label in PromoActionsMC', () => {
      const html = renderToStaticMarkup(<PromoActionsMC />);
      expect(html).toContain('data-testid="promo-action-search"');
      expect(html).toContain('aria-label="More events"');
    });
  });

  describe('PromoEmailModal Component', () => {
    it('returns null when isOpen is false', () => {
      const html = renderToStaticMarkup(
        <PromoEmailModal isOpen={false} onClose={vi.fn()} />
      );
      expect(html).toBe('');
    });

    it('renders modal with Skiddle logo, required email input, optional message, and Send button when open', () => {
      const event = {
        id: '43032215',
        eventname: 'Teletech Manchester Showcase',
      };

      const html = renderToStaticMarkup(
        <PromoEmailModal
          isOpen={true}
          onClose={vi.fn()}
          event={event}
          eventId="43032215"
          shareUrl="https://www.skiddle.com/e/43032215/"
        />
      );

      // Verify overlay and dialog
      expect(html).toContain('data-testid="promo-email-overlay"');
      expect(html).toContain('data-testid="promo-email-modal"');
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');

      // Verify Skiddle logo in modal header
      expect(html).toContain('data-testid="skiddle-logo-mc"');
      expect(html).toContain('aria-label="Skiddle Logo"');

      // Verify title and event pill
      expect(html).toContain('Share Event via Email');
      expect(html).toContain('Teletech Manchester Showcase');

      // Verify dismiss close button
      expect(html).toContain('data-testid="promo-email-close-btn"');
      expect(html).toContain('aria-label="Close"');

      // Verify required email field
      expect(html).toContain('data-testid="promo-email-input"');
      expect(html).toContain('type="email"');
      expect(html).toContain('required=""');
      expect(html).toContain('Recipient Email');

      // Verify optional message field
      expect(html).toContain('data-testid="promo-message-input"');
      expect(html).toContain('(optional)');

      // Verify action button labeled "Send"
      expect(html).toContain('data-testid="promo-email-send-btn"');
      expect(html).toContain('Send');
    });
  });

  describe('/api/promo/email Route Handler', () => {
    it('rejects requests with missing or invalid email address with HTTP 400', async () => {
      const invalidReq = new Request('http://localhost:3000/api/promo/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'invalid-email',
          event: { eventname: 'Warehouse Project' },
        }),
      });

      const res = await POST(invalidReq);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('valid email address is required');
    });

    it('builds Promo Share template and dispatches email via sendTemplatedEmail', async () => {
      const { sendTemplatedEmail } = await import('@goldlabelapps/notify');

      const validReq = new Request('http://localhost:3000/api/promo/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'raver@example.com',
          message: 'Can you believe this lineup? We have to go!',
          event: {
            id: '43032215',
            eventname: 'Warehouse Project Opening',
            imageurl: 'https://example.com/whp.jpg',
            link: 'https://www.skiddle.com/e/43032215/',
          },
          shareUrl: 'https://www.skiddle.com/promo/43032215',
        }),
      });

      const res = await POST(validReq);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Email dispatched successfully.');

      // Verify sendTemplatedEmail was invoked with the promo share template
      expect(sendTemplatedEmail).toHaveBeenCalledTimes(1);
      const callArg = (sendTemplatedEmail as any).mock.calls[0][0];

      expect(callArg.defaultSenderName).toBe('Skiddle Promo');
      expect(callArg.payload.to).toBe('raver@example.com');
      expect(callArg.payload.subject).toBe('Check out Warehouse Project Opening on Skiddle!');
      expect(callArg.payload.html).toContain('Warehouse Project Opening');
      expect(callArg.payload.html).toContain('Can you believe this lineup? We have to go!');

      // Full-size image (max-width:536px, width:100%, not 48x48 icon)
      expect(callArg.payload.html).toContain('https://example.com/whp.jpg');
      expect(callArg.payload.html).toContain('max-width:536px;');
      expect(callArg.payload.html).not.toContain('width="48" height="48"');

      // Center-aligned message
      expect(callArg.payload.html).toContain('text-align:center;');

      // CTA label changed from "View Event on Skiddle" to "View Promo"
      expect(callArg.payload.html).toContain('View Promo');
      expect(callArg.payload.html).not.toContain('View Event on Skiddle');

      // CTA button color matches Skiddle homepage search button (#00d26a)
      expect(callArg.payload.html).toContain('background-color:#00d26a');

      expect(callArg.payload.html).toContain('https://www.skiddle.com/promo/43032215');
      expect(callArg.payload.html).toContain('Skiddle');
    });

    it('handles optional message gracefully when body is omitted', async () => {
      const { sendTemplatedEmail } = await import('@goldlabelapps/notify');

      const reqWithoutBody = new Request('http://localhost:3000/api/promo/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'friend@example.com',
          event: {
            eventname: 'Defected London',
          },
        }),
      });

      const res = await POST(reqWithoutBody);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);

      const callArg = (sendTemplatedEmail as any).mock.calls[0][0];
      expect(callArg.payload.to).toBe('friend@example.com');
      expect(callArg.payload.subject).toBe('Check out Defected London on Skiddle!');
      // Verifies fallback invitation message when message is omitted
      expect(callArg.payload.html).toContain("You&#39;ve been invited to check out Defected London on Skiddle.");
    });
  });
});
