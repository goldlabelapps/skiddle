'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import {
  FacebookShareButton,
  XShareButton,
} from 'react-share';
import { PromoEmailModal } from './PromoEmailModal';
import type { PromoActionButton, PromoActionsMCProps } from '../types';
import styles from './PromoActionsMC.module.css';

export const TwitterShareButton = XShareButton;
export { FacebookShareButton, XShareButton, PromoEmailModal };

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
 * Skiddle SVG Icon with official mark branding.
 */
export function SkiddleIcon({
  size = 22,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      data-testid="skiddle-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      fill={color}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M328.42,205.68l-61.3,34.71l-34.35-19.46l95.67-54.17L328.42,205.68z M301.25,298.36l33.28,18.84
		l-163.07,92.32v-37.69L301.25,298.36z M232.76,259.6l34.35,19.46l-95.67,54.17v-38.91L232.76,259.6z M198.58,201.64l-33.28-18.84
		l163.07-92.32v37.69L198.58,201.64z M362.52,32.58L137.48,160.01v45.56l61.3,34.71L137.48,275v192.42l225.03-127.44v-45.56
		l-61.3-34.72l61.3-34.71L362.52,32.58z"
      />
    </svg>
  );
}

/**
 * Generates the default action buttons configuration:
 * 1. Facebook: "Share to Facebook" (via react-share FacebookShareButton)
 * 2. Twitter (X): "Share to X" (via react-share XShareButton)
 * 3. Email: "Share via Email"
 * 4. Search: "More events" (with Skiddle logo)
 */
export function getDefaultPromoActions(context?: {
  id?: string;
  event?: any;
  shareUrl?: string;
  shareTitle?: string;
}): PromoActionButton[] {
  const eventName = context?.event?.eventname || 'Skiddle Event';
  const url =
    context?.shareUrl ||
    (typeof window !== 'undefined' ? window.location.href : '') ||
    (context?.id ? `https://www.skiddle.com/e/${context.id}/` : 'https://www.skiddle.com');

  return [
    {
      id: 'facebook',
      label: 'Share to Facebook',
      ariaLabel: 'Share to Facebook',
      backgroundColor: '#1877F2',
      color: '#ffffff',
      icon: <FacebookIcon size={22} color="#ffffff" />,
      shareUrl: url,
    },
    {
      id: 'twitter',
      label: 'Share to X',
      ariaLabel: 'Share to Twitter (X)',
      backgroundColor: '#000000',
      color: '#ffffff',
      icon: <TwitterXIcon size={19} color="#ffffff" />,
      shareUrl: url,
      shareTitle: context?.shareTitle || `Check out ${eventName} on Skiddle!`,
    },
    {
      id: 'email',
      label: 'Share via Email',
      ariaLabel: 'Share via Email',
      backgroundColor: '#ea4335',
      color: '#ffffff',
      icon: <MailIcon size={21} color="#ffffff" />,
    },
    {
      id: 'search',
      label: 'More events',
      ariaLabel: 'More events',
      backgroundColor: '#111827',
      color: '#ffffff',
      icon: <SkiddleIcon size={22} color="#ffffff" />,
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
 * Uses react-share for first-class Facebook & Twitter (X) sharing integrations.
 * Email action opens an animated zoom-in email share modal.
 * Search action routes back to the homepage.
 * Supports auto-spaced flex layout and high z-index centered pop-up presentation.
 */
export const PromoActionsMC = forwardRef<HTMLDivElement, PromoActionsMCProps>(
  function PromoActionsMC(
    {
      actions: customActions,
      buttonRefs,
      labelRef,
      shareUrl,
      shareTitle,
      event,
      eventId,
      isEmailModalOpen,
      onEmailModalClose,
      className,
      style,
    },
    ref
  ) {
    const defaultActions = React.useMemo(
      () =>
        getDefaultPromoActions({
          id: eventId,
          event,
          shareUrl,
          shareTitle,
        }),
      [eventId, event, shareUrl, shareTitle]
    );

    const actions = customActions || defaultActions;
    const [clientUrl, setClientUrl] = useState<string>(shareUrl || '');
    const [internalEmailModalOpen, setInternalEmailModalOpen] = useState(false);

    const modalOpen =
      isEmailModalOpen !== undefined ? isEmailModalOpen : internalEmailModalOpen;

    const handleEmailModalClose = () => {
      setInternalEmailModalOpen(false);
      onEmailModalClose?.();
    };

    useEffect(() => {
      if (!shareUrl && typeof window !== 'undefined') {
        setClientUrl(window.location.href);
      }
    }, [shareUrl]);

    const resolvedShareUrl = shareUrl || clientUrl || 'https://www.skiddle.com';

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
          {actions.map((action, index) => {
            const effectiveUrl = action.shareUrl || resolvedShareUrl;
            let buttonElement: React.ReactNode;

            if (action.id === 'facebook') {
              buttonElement = (
                <FacebookShareButton
                  url={effectiveUrl}
                  hashtag={action.shareHashtag}
                  aria-label={action.ariaLabel || action.label}
                  title={action.label}
                  resetButtonStyle={false}
                  className={`${styles.actionButton} ${action.className || ''}`}
                  style={{
                    borderRadius: '50%',
                    backgroundColor: action.backgroundColor || '#1877F2',
                    color: action.color || '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    ...action.style,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.(e);
                  }}
                >
                  {action.icon}
                </FacebookShareButton>
              );
            } else if (action.id === 'twitter' || action.id === 'x') {
              buttonElement = (
                <XShareButton
                  url={effectiveUrl}
                  text={action.shareTitle || shareTitle || 'Check out this event on Skiddle!'}
                  aria-label={action.ariaLabel || action.label}
                  resetButtonStyle={false}
                  className={`${styles.actionButton} ${action.className || ''}`}
                  style={{
                    borderRadius: '50%',
                    backgroundColor: action.backgroundColor || '#000000',
                    color: action.color || '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    ...action.style,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.(e);
                  }}
                >
                  {action.icon}
                </XShareButton>
              );
            } else if (action.id === 'email') {
              buttonElement = (
                <button
                  type="button"
                  aria-label={action.ariaLabel || action.label}
                  title={action.label}
                  className={`${styles.actionButton} ${action.className || ''}`}
                  style={{
                    backgroundColor: action.backgroundColor || '#ea4335',
                    color: action.color || '#ffffff',
                    ...action.style,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInternalEmailModalOpen(true);
                    action.onClick?.(e);
                  }}
                >
                  {action.icon}
                </button>
              );
            } else {
              buttonElement = (
                <button
                  type="button"
                  aria-label={action.ariaLabel || action.label}
                  title={action.label}
                  className={`${styles.actionButton} ${action.className || ''}`}
                  style={{
                    backgroundColor: action.backgroundColor || '#111827',
                    color: action.color || '#ffffff',
                    ...action.style,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (action.onClick) {
                      action.onClick(e);
                    } else if (action.id === 'search' && typeof window !== 'undefined') {
                      window.location.href = '/';
                    }
                  }}
                >
                  {action.icon}
                </button>
              );
            }

            return (
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
                {buttonElement}
              </div>
            );
          })}
        </div>

        {/* Animated Zoom-in Email Overlay Modal */}
        <PromoEmailModal
          isOpen={modalOpen}
          onClose={handleEmailModalClose}
          event={event}
          eventId={eventId}
          shareUrl={resolvedShareUrl}
        />
      </div>
    );
  }
);

export default PromoActionsMC;
