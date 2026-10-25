import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient, SkiddleException } from '@skiddle/sdk';
import { EventDetailClient } from './EventDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Promote Event #${id} | Skiddle`,
    description: `Review API response and configure promotion settings for Skiddle Event #${id}`,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiKey = process.env.SKIDDLE_API_KEY;

  if (!apiKey) {
    return (
      <main style={{ maxWidth: 800, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#dc2626' }}>
          API Key Missing
        </h1>
        <p style={{ color: '#475569', marginBottom: 20 }}>
          SKIDDLE_API_KEY is not configured in the server environment.
        </p>
        <Link href="/" style={{ color: '#0284c7', fontWeight: 600 }}>
          &larr; Return to Event Search
        </Link>
      </main>
    );
  }

  let eventData: any = null;
  let rawResponse: any = null;
  let executionTimeMs = 0;
  let errorMsg: string | null = null;

  try {
    const client = createClient({ apiKey, devMode: false });
    const startTime = Date.now();
    const response = await client.events.getListing(id);
    executionTimeMs = Date.now() - startTime;
    rawResponse = response;
    eventData = response.results;

    if (!eventData) {
      errorMsg = `No listing details found for event ID ${id}.`;
    }
  } catch (err: any) {
    const isSkiddleException = err instanceof SkiddleException;
    errorMsg = isSkiddleException
      ? `Skiddle API Error (${err.code}): ${err.message}`
      : (err.message || 'Failed to fetch event listing from Skiddle.');
  }

  if (errorMsg || !eventData) {
    return (
      <main style={{ maxWidth: 800, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>
          Unable to Load Event #{id}
        </h1>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 16 }}>
          {errorMsg}
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          &larr; Back to Event Search
        </Link>
      </main>
    );
  }

  return (
    <main style={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
      <EventDetailClient
        id={id}
        event={eventData}
        rawResponse={rawResponse}
        executionTimeMs={executionTimeMs}
      />
    </main>
  );
}
