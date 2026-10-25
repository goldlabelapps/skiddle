'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Music,
  ExternalLink,
} from 'lucide-react';

interface EventDetailClientProps {
  id: string;
  event: any;
  rawResponse: any;
  executionTimeMs?: number;
}

function formatBritishDate(dateStr?: string): string {
  if (!dateStr || dateStr === 'Date TBA') return dateStr || 'Date TBA';
  try {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(year, month, day));
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function EventDetailClient({
  id,
  event,
  rawResponse,
  executionTimeMs,
}: EventDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'structured' | 'raw' | 'eflyer' | null>(null);

  const eventName = event?.eventname || event?.eventName || `Event #${id}`;
  const imageUrl = event?.largeimageurl || event?.imageurl || event?.largeImageUrl || event?.imageUrl || '';
  const venue = event?.venue || {};
  const venueName = venue.name || 'Venue TBA';
  const venueAddress = [venue.address, venue.town || venue.cityname, venue.postcode].filter(Boolean).join(', ');
  const rawDate = event?.date || event?.startdate || 'Date TBA';
  const date = formatBritishDate(rawDate);
  const entryPrice = event?.entryprice || event?.entryPrice || 'Not specified';
  const minAge = event?.MinAge || event?.minage || 'All ages';
  const description = (event?.description || '').replace(/<[^>]+>/g, '').trim();
  const skiddleUrl = event?.link || `https://www.skiddle.com/e/${id}/`;

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
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href={skiddleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Skiddle event ID: {id}</span>
            <ExternalLink size={12} style={{ opacity: 0.7 }} />
          </a>
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
            <h1
              style={{
                fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 500,
                color: '#0f172a',
                lineHeight: 1.25,
                marginBottom: 8,
              }}
            >
              {eventName}
            </h1>

            {description && (
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#475569',
                  marginBottom: 12,
                }}
              >
                {description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
                <Calendar size={15} />
                <span>{date}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748b', marginBottom: 16 }}>
              <MapPin size={15} style={{ flexShrink: 0, color: '#64748b' }} />
              <span>
                <strong>{venueName}</strong> {venueAddress && `— ${venueAddress}`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#334155' }}>
              <div><strong>Entry Price:</strong> {entryPrice}</div>
              <div><strong>Age Policy:</strong> {minAge}</div>
              {event?.openingtimes?.doorsopen && (
                <div><strong>Doors:</strong> {event.openingtimes.doorsopen}</div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid #f1f5f9',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'structured' ? null : 'structured')}
                style={{
                  height: 48,
                  padding: '0 20px',
                  borderRadius: 12,
                  border: activeTab === 'structured' ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  backgroundColor: activeTab === 'structured' ? '#0f172a' : '#ffffff',
                  color: activeTab === 'structured' ? '#ffffff' : '#64748b',
                  boxShadow: activeTab === 'structured' ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none',
                  boxSizing: 'border-box',
                }}
              >
                API Data
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'raw' ? null : 'raw')}
                style={{
                  height: 48,
                  padding: '0 20px',
                  borderRadius: 12,
                  border: activeTab === 'raw' ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  backgroundColor: activeTab === 'raw' ? '#0f172a' : '#ffffff',
                  color: activeTab === 'raw' ? '#ffffff' : '#64748b',
                  boxShadow: activeTab === 'raw' ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none',
                  boxSizing: 'border-box',
                }}
              >
                API JSON
              </button>
              <Link
                href={`/events/${id}/edit`}
                style={{
                  flex: 1,
                  minWidth: 180,
                  height: 48,
                  padding: '0 24px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: '#00d26a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 210, 106, 0.25)',
                  transition: 'background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                }}
              >
                <span>Promote this event</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 1: API Data */}
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
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} style={{ color: '#0284c7' }} />
                <span>Venue & Location</span>
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
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: '#0284c7' }} />
                <span>Timings & Tickets</span>
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
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Music size={18} style={{ color: '#0284c7' }} />
                <span>Lineup & Genres</span>
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

      {/* Tab 2: API JSON */}
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
