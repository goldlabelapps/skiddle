import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppShell } from '../../src/components/AppShell';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('AppShell Layout Component', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('renders Header, children, and Footer on standard routes', () => {
    mockPathname = '/events/43032215';
    const html = renderToStaticMarkup(
      <AppShell>
        <div data-testid="page-content">Event Content</div>
      </AppShell>
    );

    expect(html).toContain('Event Content');
    expect(html).toContain('aria-label="Skiddle Homepage"');
    expect(html).toContain('Skiddle Promo');
    expect(html).toContain('Candidate');
  });

  it('omits Header and Footer on promo routes (/promo/[id])', () => {
    mockPathname = '/promo/43032215';
    const html = renderToStaticMarkup(
      <AppShell>
        <div data-testid="promo-content">Promo 3D Experience</div>
      </AppShell>
    );

    expect(html).toContain('Promo 3D Experience');
    // Header elements should NOT be rendered
    expect(html).not.toContain('aria-label="Skiddle Homepage"');
    expect(html).not.toContain('@skiddle/sdk');
    // Footer elements should NOT be rendered
    expect(html).not.toContain('Candidate');
    expect(html).not.toContain('Back to top');
  });
});
