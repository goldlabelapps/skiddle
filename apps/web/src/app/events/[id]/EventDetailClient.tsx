'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface EventDetailClientProps {
  id: string;
  event: any;
  rawResponse: any;
  executionTimeMs?: number;
}

export function EventDetailClient({
  id,
  event,
  rawResponse,
  executionTimeMs,
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'structured' | 'raw' | 'eflyer'>('structured');
  const [copied, setCopied] = useState(false);

  const eventName = event?.eventname || event?.eventName || `Event #${id}`;
  const imageUrl = event?.largeimageurl || event?.imageurl || event?.largeImageUrl || event?.imageUrl || '';
  const venue = event?.venue || {};
  const venueName = venue.name || 'Venue TBA';
  const venueAddress = [venue.address, venue.town || venue.cityname, venue.postcode].filter(Boolean).join(', ');
  const date = event?.date || event?.startdate || 'Date TBA';
  const entryPrice = event?.entryprice || event?.entryPrice || 'Not specified';
  const minAge = event?.MinAge || event?.minage || 'All ages';
  const ticketsAvailable = Boolean(event?.tickets);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 16px 80px',
        color: '#0f172a',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Top Navigation */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#475569',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: 8,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            transition: 'all 0.15s ease',
          }}
        >
          <span>&larr;</span>
          <span>Back to Event Search</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '4px 12px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            Ready to Promote
          </span>
          <span
            style={{
              background: '#f1f5f9',
              color: '#475569',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            ID: {id}
          </span>
        </div>
      </div>

      {/* Hero Event Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: imageUrl ? 'minmax(280px, 360px) 1fr' : '1fr',
            gap: 0,
          }}
        >
          {imageUrl && (
            <div
              style={{
                position: 'relative',
                minHeight: 260,
                background: '#0f172a',
              }}
            >
              <Image
                src={imageUrl}
                alt={eventName}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </div>
          )}

          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 4,
                  letterSpacing: 0.5,
                }}
              >
                Selected Event
              </span>
              <span style={{ fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
                📅 {date}
              </span>
              {ticketsAvailable ? (
                <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                  🎟 Tickets On Sale
                </span>
              ) : (
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                  Off Sale / Sold Out
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                marginBottom: 12,
              }}
            >
              {eventName}
            </h1>

            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
              📍 <strong>{venueName}</strong> {venueAddress && `— ${venueAddress}`}
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#334155' }}>
              <div><strong>Entry Price:</strong> {entryPrice}</div>
              <div><strong>Age Policy:</strong> {minAge}</div>
              {event?.openingtimes?.doorsopen && (
                <div><strong>Doors:</strong> {event.openingtimes.doorsopen}</div>
              )}
              {event?.link && (
                <div>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View on Skiddle.com &nearr;
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Actions Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('structured')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === 'structured' ? '#0f172a' : '#ffffff',
              color: activeTab === 'structured' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'structured' ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none',
            }}
          >
            Structured Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === 'raw' ? '#0f172a' : '#ffffff',
              color: activeTab === 'raw' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'raw' ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none',
            }}
          >
            Raw API Response (JSON)
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopyJson}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            backgroundColor: copied ? '#00d26a' : '#ffffff',
            color: copied ? '#ffffff' : '#0f172a',
            border: '1px solid #cbd5e1',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy JSON'}</span>
        </button>
      </div>

      {/* Tab 1: Structured Overview */}
      {activeTab === 'structured' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section: Description */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>
              Event Description
            </h3>
            {event?.description ? (
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#334155',
                  maxHeight: 280,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            ) : (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 14 }}>
                No description provided for this listing.
              </p>
            )}
          </div>

          {/* Section: Data Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {/* Venue & Location Box */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>
                📍 Venue & Location
              </h3>
              <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 12px', fontSize: 13 }}>
                <dt style={{ color: '#64748b' }}>Venue Name:</dt>
                <dd style={{ fontWeight: 600 }}>{venue.name || 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Address:</dt>
                <dd>{venue.address || 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Town / City:</dt>
                <dd>{venue.town || venue.cityname || 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Postcode:</dt>
                <dd>{venue.postcode || 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Coordinates:</dt>
                <dd>{venue.latitude && venue.longitude ? `${venue.latitude}, ${venue.longitude}` : 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Phone:</dt>
                <dd>{venue.phone || 'N/A'}</dd>
              </dl>
            </div>

            {/* Timings & Ticketing Box */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>
                ⏰ Timings & Tickets
              </h3>
              <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 12px', fontSize: 13 }}>
                <dt style={{ color: '#64748b' }}>Event Date:</dt>
                <dd style={{ fontWeight: 600 }}>{date}</dd>

                <dt style={{ color: '#64748b' }}>Doors Open:</dt>
                <dd>{event?.openingtimes?.doorsopen || 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Doors Close:</dt>
                <dd>{event?.openingtimes?.doorsclose || 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Last Entry:</dt>
                <dd>{event?.openingtimes?.lastentry || 'N/A'}</dd>

                <dt style={{ color: '#64748b' }}>Entry Price:</dt>
                <dd style={{ fontWeight: 600, color: '#059669' }}>{entryPrice}</dd>

                <dt style={{ color: '#64748b' }}>Min Age:</dt>
                <dd>{minAge}</dd>
              </dl>
            </div>

            {/* Artists & Genres Box */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>
                🎵 Lineup & Genres
              </h3>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                  Genres
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Array.isArray(event?.genres) && event.genres.length > 0 ? (
                    event.genres.map((g: any, i: number) => (
                      <span
                        key={i}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: 12,
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {typeof g === 'string' ? g : g.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>No genre tags</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                  Artists
                </div>
                {Array.isArray(event?.artists) && event.artists.length > 0 ? (
                  <ul style={{ paddingLeft: 18, fontSize: 13, color: '#334155', margin: 0 }}>
                    {event.artists.map((artist: any, i: number) => (
                      <li key={i}>{typeof artist === 'string' ? artist : artist.name}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>No artists listed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Complete Raw API Response */}
      {activeTab === 'raw' && (
        <div
          style={{
            background: '#0b0f19',
            border: '1px solid #1f2937',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 18px',
              background: '#080c14',
              borderBottom: '1px solid #1f2937',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: '#94a3b8',
              fontFamily: 'monospace',
            }}
          >
            <span>GET /api/v1/events/{id}/</span>
            <span>
              {executionTimeMs ? `${executionTimeMs}ms` : ''} &bull; {JSON.stringify(rawResponse).length.toLocaleString()} bytes
            </span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 20,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#38bdf8',
              backgroundColor: '#0b0f19',
              overflowX: 'auto',
              maxHeight: 650,
            }}
          >
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
