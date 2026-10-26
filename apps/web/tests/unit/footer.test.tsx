import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from '../../src/components/Footer';

describe('Footer Component', () => {
  it('renders footer brand, description, and navigation links', () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain('Skiddle Promo');
    expect(html).toContain('NextJS event microsites from production API');
    expect(html).toContain('Select a real event from Skiddle');
    expect(html).toContain('create a promo page demonstrating modern front-end techniques');

    // Candidate column
    expect(html).toContain('Candidate');
    expect(html).toContain('https://github.com/goldlabelapps/skiddle');
    expect(html).toContain('Code example');
    expect(html).toContain('CV');
    expect(html).toContain('/docs/Chris%20Dorward%20-%20CV.pdf');
    expect(html).toContain('https://goldlabel.pro/contact');
    expect(html).toContain('Contact Chris');
    expect(html).not.toContain('Developer Resources');
    expect(html).not.toContain('SDK Explorer');
    expect(html).not.toContain('API Documentation');
    expect(html).not.toContain('Monorepo Source');

    // Skiddle External Links
    expect(html).toContain('Skiddle.com');
    expect(html).toContain('Promotion Centre');
    expect(html).toContain('Job Description');
    expect(html).toContain('/docs/React%20Developer%20Job%20Spec%20-%20Sep%2026.pdf');
    expect(html).not.toContain("What's On Guide");
    expect(html).not.toContain('Festivals Guide');

    // Copyright notice & back to top
    expect(html).toContain('Goldlabel');
    expect(html).not.toContain('All rights reserved');
    expect(html).toContain('Back to top');
  });
});
