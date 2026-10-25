import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient, SkiddleException } from '@skiddle/sdk';
import { PromoteFlashMovieClient } from '../../../../components/PromoteFlashMovie/PromoteFlashMovieClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Promote Event #${id} | Skiddle Flash Experience`,
    description: `Interactive Flash movie promotion generated live from Skiddle Event #${id} API feed.`,
  };
}

export default async function PromoteEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiKey = process.env.SKIDDLE_API_KEY;

  if (!apiKey) {
    return (
      <main
        style={{
          position: 'fixed',
          inset: 0,
          background: '#050811',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#ef4444' }}>
          API Key Missing
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>
          SKIDDLE_API_KEY is not configured in the server environment.
        </p>
        <Link
          href={`/events/${id}`}
          style={{
            color: '#00d26a',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            background: 'rgba(0, 210, 106, 0.1)',
            border: '1px solid rgba(0, 210, 106, 0.3)',
          }}
        >
          &larr; Return to Event Details
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
      <main
        style={{
          position: 'fixed',
          inset: 0,
          background: '#050811',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#f8fafc' }}>
          Unable to Load Event #{id}
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 15 }}>
          {errorMsg}
        </p>
        <Link
          href={`/events/${id}`}
          style={{
            backgroundColor: '#00d26a',
            color: '#000000',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          &larr; Back to Event Details
        </Link>
      </main>
    );
  }

  return (
    <PromoteFlashMovieClient
      id={id}
      event={eventData}
      rawResponse={rawResponse}
      executionTimeMs={executionTimeMs}
    />
  );
}
