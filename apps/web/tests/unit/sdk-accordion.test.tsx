import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SdkAccordion } from '../../src/components/SdkAccordion/SdkAccordion';

describe('SdkAccordion Component', () => {
  it('renders all accordion headers with titles and descriptions', () => {
    const html = renderToStaticMarkup(<SdkAccordion />);

    // Header 1: What You Are Looking At
    expect(html).toContain('What You Are Looking At');
    expect(html).toContain('Next.js 15 App Router test harness executing @skiddle/sdk');

    // Header 2: PHP SDK Port
    expect(html).toContain('Porting the PHP SDK to JavaScript / TypeScript');
    expect(html).toContain('Preserving object-oriented ergonomics with native modern Web APIs');

    // Header 3: API Quirks
    expect(html).toContain('Handling Skiddle API Quirks &amp; Packaging');

    // Header 4: Docs reference
    expect(html).toContain('Architecture Documentation &amp; References');
    expect(html).toContain('Comprehensive architectural decision records in the docs/ folder');
  });
});
