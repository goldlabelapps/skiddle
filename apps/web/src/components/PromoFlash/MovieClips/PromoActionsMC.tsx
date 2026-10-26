import React, { forwardRef } from 'react';
import type { PromoActionButton, PromoActionsMCProps } from '../types';
import styles from './PromoActionsMC.module.css';

/**
 * Facebook SVG Icon with standard white Facebook "f" branding.
 */
export function FacebookIcon({
  size = 22,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.52-.14-2.763-.14-2.8 0-4.737 1.71-4.737 4.88V9.5H7v4h3v10.5h4V13.5z" />
    </svg>
  );
}

/**
 * Twitter (X) SVG Icon with official clean geometric X path.
 */
export function TwitterXIcon({
  size = 20,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Email SVG Icon with crisp envelope design.
 */
export function MailIcon({
  size = 21,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/**
 * Search SVG Icon with clean magnifying glass design.
 */
export function SearchIcon({
  size = 22,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * Generates the default action buttons configuration:
 * 1. Facebook: "Share to Facebook"
 * 2. Twitter (X): "Share to X"
 * 3. Email: "Share via Email"
 * 4. Search: "More events"
 */
export function getDefaultPromoActions(context?: {
  id?: string;
  event?: any;
}): PromoActionButton[] {
  const eventName = context?.event?.eventname || 'Skiddle Event';

  return [
    {
      id: 'facebook',
      label: 'Share to Facebook',
      ariaLabel: 'Share to Facebook',
      backgroundColor: '#1877F2',
      color: '#ffffff',
      icon: <FacebookIcon size={22} color="#ffffff" />,
      onClick: (e) => {
        e.stopPropagation();
        if (typeof window === 'undefined') return;
        const currentUrl = window.location.href;
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
      },
    },
    {
      id: 'twitter',
      label: 'Share to X',
      ariaLabel: 'Share to Twitter (X)',
      backgroundColor: '#000000',
      color: '#ffffff',
      icon: <TwitterXIcon size={19} color="#ffffff" />,
      onClick: (e) => {
        e.stopPropagation();
        if (typeof window === 'undefined') return;
        const currentUrl = window.location.href;
        const text = `Check out ${eventName} on Skiddle!`;
        const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
      },
    },
    {
      id: 'email',
      label: 'Share via Email',
      ariaLabel: 'Share via Email',
      backgroundColor: '#ea4335',
      color: '#ffffff',
      icon: <MailIcon size={21} color="#ffffff" />,
      onClick: (e) => {
        e.stopPropagation();
        if (typeof window === 'undefined') return;
        const currentUrl = window.location.href;
        const subject = encodeURIComponent(`Check out: ${eventName}`);
        const body = encodeURIComponent(
          `Hey,\n\nI thought you might want to check out this event on Skiddle:\n\n${eventName}\n${currentUrl}\n`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
    {
      id: 'search',
      label: 'More events',
      ariaLabel: 'More events',
      backgroundColor: '#111827',
      color: '#ffffff',
      icon: <SearchIcon size={22} color="#ffffff" />,
      onClick: (e) => {
        e.stopPropagation();
        if (typeof window === 'undefined') return;
        window.location.href = '/';
      },
    },
  ];
}

/**
 * PromoActionsMC - Modular MovieClip rendering action button icons at the bottom of the Promo page.
 * Supports auto-spaced flex layout and high z-index centered pop-up presentation.
 */
export const PromoActionsMC = forwardRef<HTMLDivElement, PromoActionsMCProps>(
  function PromoActionsMC(
    {
      actions = [],
      buttonRefs,
      labelRef,
      className,
      style,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        data-testid="promo-actions-mc"
        className={`${styles.container} ${className || ''}`}
        style={style}
      >
        {/* Centered presentation text description pill */}
        <div
          ref={labelRef}
          data-testid="promo-actions-label"
          className={styles.labelPill}
          aria-live="polite"
        />

        {/* Bottom row of icon buttons auto-spaced according to action count */}
        <div
          data-testid="promo-actions-row"
          className={styles.actionsRow}
        >
          {actions.map((action, index) => (
            <div
              key={action.id}
              ref={(el) => {
                if (buttonRefs) {
                  buttonRefs.current[index] = el;
                }
              }}
              data-testid={`promo-action-${action.id}`}
              className={styles.buttonWrapper}
            >
              <button
                type="button"
                aria-label={action.ariaLabel || action.label}
                title={action.label}
                className={styles.actionButton}
                style={{
                  backgroundColor: action.backgroundColor || '#111827',
                  color: action.color || '#ffffff',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.(e);
                }}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default PromoActionsMC;
