'use client';

import React, { forwardRef } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import styles from './PromoVenueDateMC.module.css';

export interface PromoDateChipMCProps extends React.HTMLAttributes<HTMLDivElement> {
  event?: any;
  date?: string | Date;
  doorsOpen?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface PromoVenueMCProps extends React.HTMLAttributes<HTMLDivElement> {
  event?: any;
  venueName?: string;
  venueCity?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface PromoVenueDateMCProps extends React.HTMLAttributes<HTMLDivElement> {
  event?: any;
  venueName?: string;
  venueCity?: string;
  date?: string | Date;
  doorsOpen?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Formats a date string or Date object into a readable British format, e.g. "Thu 15 Apr 2027"
 */
export function formatPromoDate(rawDate?: string | Date): string {
  if (!rawDate) return '';
  if (rawDate instanceof Date) {
    if (Number.isNaN(rawDate.getTime())) return '';
    return rawDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const str = String(rawDate).trim();
  const dateOnly = str.slice(0, 10).replace(/\//g, '-');
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map((n) => parseInt(n, 10));
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  const fallback = new Date(str);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return str;
}

/**
 * PromoDateChipMC - MovieClip displaying the standalone date & doors open badge,
 * positioned prominently at the top above the event title.
 */
export const PromoDateChipMC = forwardRef<HTMLDivElement, PromoDateChipMCProps>(
  function PromoDateChipMC(
    {
      event,
      date: explicitDate,
      doorsOpen: explicitDoorsOpen,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const targetDate =
      explicitDate ||
      event?.date ||
      event?.dateStart ||
      event?.startdate ||
      '';

    const doorsOpen =
      explicitDoorsOpen ||
      event?.openingtimes?.doorsopen ||
      event?.doorsOpen ||
      '';

    const formattedDate = formatPromoDate(targetDate);

    if (!formattedDate) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-testid="promo-date-chip-mc"
        className={`${styles.chipContainer} ${className || ''}`}
        style={style}
        {...rest}
      >
        <div className={styles.dateRow} data-testid="promo-date-row">
          <Calendar size={13} className={styles.dateIcon} aria-hidden="true" />
          <span className={styles.dateText}>{formattedDate}</span>
          {doorsOpen && (
            <span className={styles.doorsText}>• Doors {doorsOpen}</span>
          )}
        </div>
      </div>
    );
  },
);

PromoDateChipMC.displayName = 'PromoDateChipMC';

/**
 * PromoVenueMC - MovieClip displaying the venue location badge,
 * positioned underneath the featured image flyer.
 */
export const PromoVenueMC = forwardRef<HTMLDivElement, PromoVenueMCProps>(
  function PromoVenueMC(
    {
      event,
      venueName: explicitVenueName,
      venueCity: explicitVenueCity,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const venueName =
      explicitVenueName ||
      event?.venue?.name ||
      event?.venueName ||
      (event?.venue && typeof event.venue === 'string' ? event.venue : '');

    const venueCity =
      explicitVenueCity ||
      event?.venue?.town ||
      event?.venue?.cityname ||
      event?.venueCity ||
      '';

    if (!venueName) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-testid="promo-venue-mc"
        className={`${styles.chipContainer} ${className || ''}`}
        style={style}
        {...rest}
      >
        <div className={styles.venueRow} data-testid="promo-venue-row">
          <MapPin size={13} className={styles.venuePin} aria-hidden="true" />
          <span className={styles.venueNameText}>{venueName}</span>
          {venueCity && (
            <span className={styles.venueCityText}>• {venueCity}</span>
          )}
        </div>
      </div>
    );
  },
);

PromoVenueMC.displayName = 'PromoVenueMC';

/**
 * PromoVenueDateMC - Compound MovieClip cleanly presenting both the event's date
 * and venue location.
 */
export const PromoVenueDateMC = forwardRef<HTMLDivElement, PromoVenueDateMCProps>(
  function PromoVenueDateMC(
    {
      event,
      venueName: explicitVenueName,
      venueCity: explicitVenueCity,
      date: explicitDate,
      doorsOpen: explicitDoorsOpen,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const venueName =
      explicitVenueName ||
      event?.venue?.name ||
      event?.venueName ||
      (event?.venue && typeof event.venue === 'string' ? event.venue : '');

    const venueCity =
      explicitVenueCity ||
      event?.venue?.town ||
      event?.venue?.cityname ||
      event?.venueCity ||
      '';

    const targetDate =
      explicitDate ||
      event?.date ||
      event?.dateStart ||
      event?.startdate ||
      '';

    const doorsOpen =
      explicitDoorsOpen ||
      event?.openingtimes?.doorsopen ||
      event?.doorsOpen ||
      '';

    const formattedDate = formatPromoDate(targetDate);

    // If neither venue nor date is available, do not render
    if (!venueName && !formattedDate) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-testid="promo-venue-date-mc"
        className={`${styles.container} ${className || ''}`}
        style={style}
        {...rest}
      >
        {/* Date & Doors Open Pill */}
        {formattedDate && (
          <div className={styles.dateRow} data-testid="promo-date-row">
            <Calendar size={13} className={styles.dateIcon} aria-hidden="true" />
            <span className={styles.dateText}>{formattedDate}</span>
            {doorsOpen && (
              <span className={styles.doorsText}>• Doors {doorsOpen}</span>
            )}
          </div>
        )}

        {/* Venue Location Pill */}
        {venueName && (
          <div className={styles.venueRow} data-testid="promo-venue-row">
            <MapPin size={13} className={styles.venuePin} aria-hidden="true" />
            <span className={styles.venueNameText}>{venueName}</span>
            {venueCity && (
              <span className={styles.venueCityText}>• {venueCity}</span>
            )}
          </div>
        )}
      </div>
    );
  },
);

PromoVenueDateMC.displayName = 'PromoVenueDateMC';
export default PromoVenueDateMC;
