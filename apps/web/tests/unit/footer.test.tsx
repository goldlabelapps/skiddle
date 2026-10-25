import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from '../../src/components/Footer';

describe('Footer Component', () => {
  it('renders footer brand, description, and navigation links', () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain('Skiddle Promo SDK');
    expect(html).toContain('Polyglot SDKs');
    expect(html).toContain('Modern TypeScript, live Skiddle event discovery');

    // Developer resources
    expect(html).toContain('href="/sdk"');
    expect(html).toContain('SDK Explorer');
    expect(html).toContain('href="https://promotioncentre.co.uk"');
    expect(html).toContain('Promotion Centre');
    expect(html).toContain('API Documentation');
    expect(html).toContain('Monorepo Source');

    // Skiddle External Links
    expect(html).toContain('Skiddle.com');
    expect(html).toContain('Festivals Guide');

    // Copyright notice & back to top
    expect(html).toContain('Goldlabel');
    expect(html).toContain('Back to top');
  });
});
