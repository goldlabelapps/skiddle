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
import styles from './EventDetail.module.css';

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
    <div className={styles.container}>
      {/* Top Navigation */}
      <div className={styles.topNav}>
        <Link
          href="/"
          className={styles.backLink}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href={skiddleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.idBadge}
          >
            <span>Skiddle event ID: {id}</span>
            <ExternalLink size={12} style={{ opacity: 0.7 }} />
          </a>
        </div>
      </div>

      {/* Hero Event Banner */}
      <div className={styles.heroCard}>
        <div className={imageUrl ? styles.heroGrid : styles.heroGridNoImage}>
          {imageUrl && (
            <div className={styles.imageWrapper}>
              <Image
                src={imageUrl}
                alt={eventName}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </div>
          )}

          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              {eventName}
            </h1>

            {description && (
              <p className={styles.description}>
                {description}
              </p>
            )}

            <div className={styles.metaRow}>
              <span className={styles.dateBadge}>
                <Calendar size={15} />
                <span>{date}</span>
              </span>
            </div>

            <div className={styles.venueRow}>
              <MapPin size={15} style={{ flexShrink: 0, marginTop: 2, color: '#64748b' }} />
              <span>
                <strong>{venueName}</strong> {venueAddress && `— ${venueAddress}`}
              </span>
            </div>

            <div className={styles.pillGroup}>
              <div><strong>Entry Price:</strong> {entryPrice}</div>
              <div><strong>Age Policy:</strong> {minAge}</div>
              {event?.openingtimes?.doorsopen && (
                <div><strong>Doors:</strong> {event.openingtimes.doorsopen}</div>
              )}
            </div>

            <div className={styles.actionsRow}>
              <div className={styles.tabButtonGroup}>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'structured' ? null : 'structured')}
                  className={`${styles.tabButton} ${activeTab === 'structured' ? styles.tabButtonActive : ''}`}
                >
                  API Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'raw' ? null : 'raw')}
                  className={`${styles.tabButton} ${activeTab === 'raw' ? styles.tabButtonActive : ''}`}
                >
                  API JSON
                </button>
              </div>
              <Link
                href={`/promo/${id}`}
                className={styles.promoButton}
              >
                <span>Create Promo</span>
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
          <div className={styles.dataGrid}>
            {/* Venue & Location Box */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <MapPin size={18} style={{ color: '#0284c7' }} />
                <span>Venue & Location</span>
              </h3>
              <dl className={styles.dlGrid}>
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
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Clock size={18} style={{ color: '#0284c7' }} />
                <span>Timings & Tickets</span>
              </h3>
              <dl className={styles.dlGrid}>
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
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
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
