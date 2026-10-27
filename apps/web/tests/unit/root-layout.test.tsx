import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RootLayout from '../../src/app/layout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@goldlabelapps/notify', () => ({
  Ping: (props: { apiKey?: string; endpoint?: string; metadata?: Record<string, unknown> }) => (
    <div
      data-testid="notify-ping"
      data-api-key={props.apiKey}
      data-endpoint={props.endpoint}
      data-app={String(props.metadata?.app)}
      data-app-version={String(props.metadata?.appVersion)}
    />
  ),
}));

describe('RootLayout Component', () => {
  it('renders Ping component with correct apiKey and metadata', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div data-testid="child-content">Main Page</div>
      </RootLayout>
    );

    expect(html).toContain('data-testid="notify-ping"');
    expect(html).toContain('data-api-key="pk_live_skiddle"');
    expect(html).toContain('data-endpoint="https://private.goldlabel.pro/api/notify/ping"');
    expect(html).toContain('data-app="skiddle"');
    expect(html).toContain('data-app-version="0.3.0"');
    expect(html).toContain('Main Page');
  });
});
