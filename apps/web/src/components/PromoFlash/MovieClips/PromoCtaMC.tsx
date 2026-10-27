'use client';

import React, { forwardRef } from 'react';
import type { PromoCtaMCProps } from '../types';
import styles from './PromoCtaMC.module.css';

/**
 * Ticket SVG Icon for the primary Buy Tickets CTA.
 */
export function TicketIcon({
  size = 22,
  color = 'currentColor',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      data-testid="promo-cta-ticket-icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 11v2" />
      <path d="M13 17v2" />
    </svg>
  );
}

/**
 * Arrow Right SVG Icon for the primary Buy Tickets CTA.
 */
export function ArrowRightIcon({
  size = 20,
  color = 'currentColor',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      data-testid="promo-cta-arrow-icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/**
 * PromoCtaMC - High-impact, eye-catching Call-To-Action MovieClip.
 *
 * Prominently presents "Buy Tickets", opening the Skiddle purchasing URL in a new blank tab.
 * Acts as the final element to animate into the scene with a spring bounce,
 * followed by an attention-grabbing heartbeat pulse, sonar aura ring, and light shimmer
 * repeating every few seconds to invite the click.
 */
export const PromoCtaMC = forwardRef<HTMLDivElement, PromoCtaMCProps>(
  function PromoCtaMC(
    {
      label = 'Buy Tickets',
      url,
      event,
      eventId,
      isReady = false,
      className,
      style,
      onClick,
      ariaLabel,
    },
    ref
  ) {
    const resolvedUrl =
      url ||
      event?.link ||
      event?.ticketUrl ||
      (eventId || event?.id
        ? `https://www.skiddle.com/e/${eventId || event?.id}/`
        : 'https://www.skiddle.com');

    const titleText =
      event?.eventname ||
      event?.eventName ||
      event?.name ||
      event?.title ||
      'Skiddle Event';

    const computedAriaLabel = ariaLabel || `${label} for ${titleText}`;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.stopPropagation();
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        data-testid="promo-cta-mc"
        className={`${styles.container} ${isReady ? styles.ready : ''} ${className || ''}`}
        style={style}
      >
        <span className={styles.pulseRing} aria-hidden="true" />
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="promo-cta-button"
          className={styles.ctaButton}
          aria-label={computedAriaLabel}
          onClick={handleClick}
        >
          <span className={styles.shimmer} aria-hidden="true" />
          <TicketIcon size={22} className={styles.ticketIcon} />
          <span className={styles.label}>{label}</span>
          <ArrowRightIcon size={20} className={styles.arrowIcon} />
        </a>
      </div>
    );
  }
);

export default PromoCtaMC;
