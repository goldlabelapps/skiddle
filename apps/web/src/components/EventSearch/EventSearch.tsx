'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './EventSearch.module.css';
import { HighlightText } from './HighlightText';
import { Calendar, MapPin, ArrowRight, Search } from 'lucide-react';

export interface EventListItem {
  id: string | number;
  eventName: string;
  description: string;
  date: string;
  startDate?: string;
  venueName: string;
  venueTown: string;
  imageUrl: string;
  price: string;
  tickets: boolean;
  eventCode: string;
  genres: string[];
  raw: any;
}

export const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'LIVE', label: 'Live Music / Gigs' },
  { value: 'CLUB', label: 'Clubbing & DJ' },
  { value: 'FEST', label: 'Festivals' },
  { value: 'COMEDY', label: 'Comedy' },
  { value: 'THEATRE', label: 'Theatre & Arts' },
  { value: 'SEASONAL', label: 'Seasonal & Family' },
  { value: 'CONF', label: 'Conferences & Talks' },
  { value: 'SPORT', label: 'Sports & Fitness' },
  { value: 'EXHIB', label: 'Exhibitions' },
];

export const TOTAL_SLIDER_DAYS = 365;

export const DATE_PRESETS = [
  { label: 'Next 7 Days', days: 7 },
  { label: 'Next 14 Days', days: 14 },
  { label: 'Next 30 Days', days: 30 },
  { label: 'Next 3 Months', days: 90 },
  { label: 'Full Year', days: 365 },
];

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function stripHtml(html?: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').trim();
}

export function normalizeEvent(raw: any): EventListItem {
  const id = raw.id || raw.listingId || raw.listingid || '';
  const eventName = raw.eventName || raw.eventname || 'Untitled Event';
  const description = stripHtml(raw.description || '');
  const date = raw.date || raw.startdate || raw.startDate || '';
  const venue = raw.venue || {};
  const venueName = venue.name || 'Venue TBA';
  const venueTown = venue.town || venue.cityname || venue.postcode || '';
  const imageUrl = raw.largeImageUrl || raw.largeimageurl || raw.imageUrl || raw.imageurl || '';
  const price = raw.entryPrice || raw.entryprice || 'Price TBA';
  const tickets = Boolean(raw.tickets);
  const eventCode = raw.eventCode || raw.EventCode || raw.eventcode || 'EVENT';

  const genres: string[] = [];
  if (Array.isArray(raw.genres)) {
    for (const g of raw.genres) {
      if (typeof g === 'string') genres.push(g);
      else if (g && typeof g.name === 'string') genres.push(g.name);
    }
  }

  return {
    id,
    eventName,
    description,
    date,
    startDate: raw.startdate || raw.startDate,
    venueName,
    venueTown,
    imageUrl,
    price,
    tickets,
    eventCode,
    genres,
    raw,
  };
}

export function EventSearch() {
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [startDays, setStartDays] = useState(0);
  const [endDays, setEndDays] = useState(TOTAL_SLIDER_DAYS);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max'>('min');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce user input by 350ms
  useEffect(() => {
    // If not interacted and no keyword, do nothing on mount
    if (!keyword && !hasInteracted) {
      return;
    }

    const handler = setTimeout(() => {
      startTransition(() => {
        if (keyword) {
          setHasInteracted(true);
        }
        setDebouncedKeyword(keyword);
      });
    }, 350);

    return () => clearTimeout(handler);
  }, [keyword, hasInteracted]);

  // Debounce date slider range changes by 250ms before triggering API fetch
  useEffect(() => {
    if (!hasInteracted) return;

    const handler = setTimeout(() => {
      startTransition(() => {
        if (isDateFilterActive) {
          const today = getToday();
          setMinDate(formatDateIso(addDays(today, startDays)));
          setMaxDate(formatDateIso(addDays(today, endDays)));
        } else {
          setMinDate('');
          setMaxDate('');
        }
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [hasInteracted, isDateFilterActive, startDays, endDays]);

  // RESTful lookup effect (only fires after interaction)
  useEffect(() => {
    if (!hasInteracted) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function fetchEvents() {
      setLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        const params = new URLSearchParams();
        if (debouncedKeyword.trim()) {
          params.set('keyword', debouncedKeyword.trim());
        }
        if (category && category !== 'all') {
          params.set('eventcode', category);
        }
        if (minDate) {
          params.set('minDate', minDate);
        }
        if (maxDate) {
          params.set('maxDate', maxDate);
        }
        params.set('limit', '24');

        const response = await fetch(`/api/events?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        const normalized = (data.events || []).map(normalizeEvent);

        setEvents(normalized);
        setTotalResults(data.totalresults ?? normalized.length);
        setLatencyMs(Math.round(performance.now() - startTime));
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message || 'Failed to search events.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, [hasInteracted, debouncedKeyword, category, minDate, maxDate]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setHasInteracted(true);
    setDebouncedKeyword(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleCategorySelect = (catValue: string) => {
    setHasInteracted(true);
    setCategory((prev) => (prev === catValue && catValue !== 'all' ? 'all' : catValue));
  };

  const handleStartDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), endDays - 1);
    setStartDays(val);
    setIsDateFilterActive(true);
    setHasInteracted(true);
  };

  const handleEndDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), startDays + 1);
    setEndDays(val);
    setIsDateFilterActive(true);
    setHasInteracted(true);
  };

  const handlePresetClick = (days: number) => {
    setStartDays(0);
    setEndDays(days);
    setIsDateFilterActive(true);
    setHasInteracted(true);
  };

  const handleClear = () => {
    setKeyword('');
    setDebouncedKeyword('');
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setCategory('all');
    setStartDays(0);
    setEndDays(TOTAL_SLIDER_DAYS);
    setIsDateFilterActive(false);
    setMinDate('');
    setMaxDate('');
  };

  const hasActiveFilters = Boolean(
    keyword || (category && category !== 'all') || isDateFilterActive || minDate || maxDate
  );

  const today = getToday();
  const startDate = addDays(today, startDays);
  const endDate = addDays(today, endDays);

  return (
    <div className={styles.container}>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Skiddle Promos</span>
        </div>
      </section>

      {/* RESTful Search Bar & Filters */}
      <form className={styles.searchBoxCard} onSubmit={handleSearchSubmit}>
        <h1 className={styles.title}>Find an event to promote</h1>
        <div className={styles.mainInputRow}>
          <div className={styles.mainInputWrapper}>
            <svg
              className={styles.searchIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className={styles.mainInput}
              placeholder="Search by event title, artist, venue, keyword, or description..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search events"
            />
            {keyword && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                title="Clear search"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <button
            type="submit"
            className={styles.searchSubmitButton}
            title="Search events"
          >
            Search
          </button>
        </div>

        <div className={styles.categorySection}>
          <div className={styles.chipsContainer} role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  className={`${styles.chip}${isSelected ? ` ${styles.chipActive}` : ''}`}
                  onClick={() => handleCategorySelect(cat.value)}
                  aria-pressed={isSelected}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.dateSliderSection}>
          <span className={styles.filterLabel}>Dates</span>

          <div className={styles.rangeDisplayBadge}>
            <Calendar size={15} className={styles.calendarIcon} />
            <span>
              From <strong>{isDateFilterActive && startDays === 0 ? 'Today' : formatDateDisplay(startDate)}</strong> to{' '}
              <strong>{formatDateDisplay(endDate)}</strong>
              <span className={styles.durationTag}>
                ({endDays - startDays === TOTAL_SLIDER_DAYS ? '1 Year' : `${endDays - startDays} days`})
              </span>
            </span>
          </div>

          <div className={styles.dualSliderWrapper}>
            <div className={styles.sliderTrack} />
            <div
              className={styles.sliderHighlight}
              style={{
                left: `calc(${(startDays / TOTAL_SLIDER_DAYS) * 100}% + ${(0.5 - startDays / TOTAL_SLIDER_DAYS) * 22}px)`,
                right: `calc(${(1 - endDays / TOTAL_SLIDER_DAYS) * 100}% + ${(endDays / TOTAL_SLIDER_DAYS - 0.5) * 22}px)`,
              }}
            />
            <input
              id="min-date-slider"
              type="range"
              min={0}
              max={TOTAL_SLIDER_DAYS}
              value={startDays}
              onChange={handleStartDaysChange}
              className={`${styles.rangeInput} ${styles.rangeInputMin}`}
              style={{ zIndex: activeThumb === 'min' || startDays > TOTAL_SLIDER_DAYS - 20 ? 5 : 3 }}
              onPointerDown={() => setActiveThumb('min')}
              aria-label="Start date slider"
            />
            <input
              id="max-date-slider"
              type="range"
              min={0}
              max={TOTAL_SLIDER_DAYS}
              value={endDays}
              onChange={handleEndDaysChange}
              className={`${styles.rangeInput} ${styles.rangeInputMax}`}
              style={{ zIndex: activeThumb === 'max' ? 5 : 4 }}
              onPointerDown={() => setActiveThumb('max')}
              aria-label="End date slider"
            />
          </div>

          <div className={styles.presetChips} role="group" aria-label="Quick date presets">
            {DATE_PRESETS.map((p) => {
              const isActive = isDateFilterActive && startDays === 0 && endDays === p.days;
              return (
                <button
                  key={p.label}
                  type="button"
                  className={`${styles.presetChip}${isActive ? ` ${styles.presetChipActive}` : ''}`}
                  onClick={() => handlePresetClick(p.days)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </form>

      {/* Results, Loading State & Latency (only rendered once user interacts) */}
      {hasInteracted && (
        <>
          {/* Status & Latency Row */}
          <div className={styles.metaRow}>
            <div className={styles.resultsCount}>
              {loading ? (
                <span className={styles.loadingIndicator}>
                  <span className={styles.spinner} />
                  Searching Skiddle API...
                </span>
              ) : (
                <span>
                  Found <strong>{events.length}</strong> event{events.length === 1 ? '' : 's'}
                  {totalResults > events.length && ` (of ${totalResults.toLocaleString()} total)`}
                  {debouncedKeyword && (
                    <>
                      {' '}for &ldquo;<strong>{debouncedKeyword}</strong>&rdquo;
                    </>
                  )}
                  {latencyMs !== null && ` in ${latencyMs}ms`}
                </span>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <strong>Error fetching events:</strong> {error}
              </div>
              <button
                type="button"
                onClick={() => setDebouncedKeyword(keyword + ' ')}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
            </div>
          )}

      {/* Results Grid */}
      {loading && events.length === 0 ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
                <div className={styles.skeletonLine} style={{ width: '80%', height: 20 }} />
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                <div className={styles.skeletonLine} style={{ width: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className={styles.grid}>
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className={styles.card}
              title={`Select ${event.eventName} to edit & promote`}
            >
              <div className={styles.imageWrapper}>
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={event.eventName}
                    className={styles.cardImage}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className={styles.cardImageFallback}>
                    <span>No Image Available</span>
                  </div>
                )}
                <span className={styles.categoryPill}>{event.eventCode}</span>
                {event.tickets ? (
                  <span className={styles.ticketPill}>Tickets On Sale</span>
                ) : (
                  <span className={styles.ticketPillOffSale}>Off Sale</span>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardDate}>
                  <Calendar size={13} style={{ flexShrink: 0 }} />
                  <span>{event.date || 'Date TBD'}</span>
                </div>

                <h2 className={styles.cardTitle}>
                  <HighlightText
                    text={event.eventName}
                    query={debouncedKeyword}
                  />
                </h2>

                <div className={styles.cardVenue}>
                  <MapPin size={13} style={{ flexShrink: 0 }} />
                  <span>
                    <HighlightText
                      text={`${event.venueName}${event.venueTown ? ` (${event.venueTown})` : ''}`}
                      query={debouncedKeyword}
                    />
                  </span>
                </div>

                {event.description && (
                  <p className={styles.cardDescription}>
                    <HighlightText
                      text={event.description}
                      query={debouncedKeyword}
                    />
                  </p>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.priceTag}>
                    {event.price || 'Free / TBA'}
                  </div>
                  <span className={styles.ctaButton}>
                    <span>Promote Event</span>
                    <ArrowRight size={13} style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: 4 }} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Search size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No events found</h3>
            <p className={styles.emptyText}>
              {debouncedKeyword
                ? `No events matched "${debouncedKeyword}". Try adjusting your keywords, changing categories, or clearing filters.`
                : 'No upcoming events match your active filter criteria.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )
      )}
        </>
      )}
    </div>
  );
}
