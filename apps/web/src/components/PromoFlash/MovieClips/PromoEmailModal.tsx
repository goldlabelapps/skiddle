'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { X, Send, Check, AlertCircle, Loader2 } from 'lucide-react';
import { SkiddleLogoMC } from './SkiddleLogoMC';
import styles from './PromoEmailModal.module.css';

export interface PromoEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any;
  eventId?: string;
  shareUrl?: string;
  onSuccess?: () => void;
}

/**
 * PromoEmailModal - Animated zoom-in overlay component displaying the email share form.
 * Leverages the private notification service and prospect light email template.
 */
export function PromoEmailModal({
  isOpen,
  onClose,
  event,
  eventId,
  shareUrl,
  onSuccess,
}: PromoEmailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Animated Zoom-in effect when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset form states on open
    setError(null);
    setSubmitted(false);
    setLoading(false);

    if (cardRef.current && overlayRef.current) {
      gsap.killTweensOf([cardRef.current, overlayRef.current]);

      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );

      gsap.fromTo(
        cardRef.current,
        { scale: 0.72, opacity: 0, y: 16 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.36,
          ease: 'back.out(1.5)',
          onComplete: () => {
            emailInputRef.current?.focus();
          },
        }
      );
    }
  }, [isOpen]);

  // Animated Zoom-out on close
  const handleClose = useCallback(() => {
    if (!cardRef.current || !overlayRef.current) {
      onClose();
      return;
    }

    gsap.killTweensOf([cardRef.current, overlayRef.current]);

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    });

    gsap.to(cardRef.current, {
      scale: 0.78,
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: onClose,
    });
  }, [onClose]);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid recipient email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/promo/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.trim(),
          message: message.trim(),
          event,
          eventId: eventId || event?.id,
          shareUrl:
            shareUrl ||
            (typeof window !== 'undefined' ? window.location.href : ''),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Failed to dispatch email.');
      }

      setSubmitted(true);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const eventTitle =
    event?.eventname ||
    event?.eventName ||
    event?.title ||
    (eventId ? `Event #${eventId}` : 'Skiddle Event');

  return (
    <div
      ref={overlayRef}
      data-testid="promo-email-overlay"
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          handleClose();
        }
      }}
    >
      <div
        ref={cardRef}
        data-testid="promo-email-modal"
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-label="Share Event via Email"
      >
        {/* Dismiss Button */}
        <button
          type="button"
          data-testid="promo-email-close-btn"
          aria-label="Close"
          className={styles.closeButton}
          onClick={handleClose}
        >
          <X size={16} />
        </button>

        {/* Modal Header with Skiddle Logo */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <SkiddleLogoMC size={36} color="#000000" aria-label="Skiddle Logo" />
          </div>
          <h3 className={styles.title}>Share Event via Email</h3>
          {eventTitle && (
            <span className={styles.eventPill} title={eventTitle}>
              {eventTitle}
            </span>
          )}
        </div>

        {/* Modal Body */}
        {submitted ? (
          <div data-testid="promo-email-success" className={styles.successCard}>
            <div className={styles.successIconBadge}>
              <Check size={26} strokeWidth={2.5} />
            </div>
            <h4 className={styles.successTitle}>Email Dispatched!</h4>
            <p className={styles.successDescription}>
              A beautifully styled event preview has been sent to{' '}
              <strong>{email}</strong>.
            </p>
            <button
              type="button"
              data-testid="promo-email-done-btn"
              className={styles.doneButton}
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form
            data-testid="promo-email-form"
            onSubmit={handleSubmit}
            className={styles.form}
          >
            {/* Required Email Input */}
            <div className={styles.fieldGroup}>
              <label htmlFor="promo-email-input" className={styles.label}>
                Recipient Email <span className={styles.requiredStar}>*</span>
              </label>
              <input
                ref={emailInputRef}
                id="promo-email-input"
                data-testid="promo-email-input"
                type="email"
                required
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
            </div>

            {/* Optional Body/Message Input */}
            <div className={styles.fieldGroup}>
              <label htmlFor="promo-message-input" className={styles.label}>
                Message <span className={styles.optionalTag}>(optional)</span>
              </label>
              <textarea
                id="promo-message-input"
                data-testid="promo-message-input"
                placeholder="Check out this event with me!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className={styles.textarea}
                disabled={loading}
              />
            </div>

            {/* Error Message Box */}
            {error && (
              <div data-testid="promo-email-error" className={styles.errorBox}>
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action: "Send" */}
            <button
              type="submit"
              data-testid="promo-email-send-btn"
              disabled={loading}
              className={styles.sendButton}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PromoEmailModal;
