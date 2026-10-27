'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { Stage, CleverText, ImageMC, corkScrew } from '@goldlabelapps/flash';
import {
  SkiddleLogoMC,
  PromoActionsMC,
  PromoVenueDateMC,
  PromoDateChipMC,
  PromoVenueMC,
  PromoCtaMC,
  getDefaultPromoActions,
} from './MovieClips';
import { separatePromoActionScript, promoActionsActionScript } from './ActionScript';
import { cleanDescription } from './utils';
import styles from './PromoFlash.module.css';
import type { PromoFlashProps } from './types';

export { cleanDescription };

/**
 * PromoFlash - Interactive promotional experience component powered by @goldlabelapps/flash.
 * Features modular MovieClips and ActionScript timelines:
 * 1. Skiddle logo corkscrews in.
 * 2. Pauses for 1 second.
 * 3. Skiddle logo fades out.
 * 4. CleverText MovieClip activates, typing the event title with responsive multi-line wrapping.
 * 5. CleverText moves up, large image MovieClip animates into center, and event description
 *    fades in gracefully underneath the featured image.
 * 6. Action buttons slide up 1-by-1 from offscreen bottom, pop up centered with top z-index,
 *    display their text description fading in and out, and shrink down into the auto-spaced bottom row.
 */
export function PromoFlash({
  id,
  event,
  description,
  actions: customActions,
  shareUrl,
  shareTitle,
  buyUrl,
  buyLabel = 'Buy Tickets',
  onBuyClick,
  className,
  style,
  onAnimationComplete,
}: PromoFlashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const venueRef = useRef<HTMLDivElement>(null);
  const venueDateRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [typingActive, setTypingActive] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);

  const defaultActions = useMemo(
    () =>
      getDefaultPromoActions({
        id,
        event,
        shareUrl,
        shareTitle,
      }),
    [id, event, shareUrl, shareTitle]
  );
  const actions = customActions || defaultActions;

  // Prioritize high-resolution large image for the visual MovieClip component
  const cardImageUrl =
    event?.largeimageurl ||
    event?.largeImageUrl ||
    event?.largeimage ||
    event?.imageurl ||
    event?.imageUrl;

  const titleText =
    event?.eventname ||
    event?.eventName ||
    event?.name ||
    event?.title ||
    (id ? `Event #${id}` : 'Skiddle Event');

  // Dynamic typography sizing to ensure multi-line long titles fit comfortably
  // and clamp strictly to a maximum of 3 lines without overflowing
  let fontSize = '1.75rem';
  let lineHeight = 1.25;
  const len = titleText.trim().length;

  if (len > 90) {
    fontSize = '1rem';
    lineHeight = 1.3;
  } else if (len > 60) {
    fontSize = '1.125rem';
    lineHeight = 1.35;
  } else if (len > 35) {
    fontSize = '1.35rem';
    lineHeight = 1.35;
  } else if (len > 20) {
    fontSize = '1.5rem';
    lineHeight = 1.3;
  }

  // Extract, clean and format event description
  const rawDescription =
    description ??
    event?.description ??
    event?.desc ??
    event?.details ??
    '';
  const descriptionText = cleanDescription(rawDescription);

  let descFontSize = '0.8125rem';
  let descLineHeight = 1.45;
  if (descriptionText.length > 180) {
    descFontSize = '0.75rem';
    descLineHeight = 1.4;
  }

  const hasVenueDate = Boolean(
    event?.venue?.name || event?.venueName || event?.date || event?.startdate || event?.dateStart
  );

  const playSequence = useCallback(() => {
    if (!logoRef.current || !titleRef.current) return;

    timelineRef.current?.kill();
    setTypingActive(false);
    setCtaReady(false);

    const tl = gsap.timeline({
      onComplete: onAnimationComplete,
    });

    timelineRef.current = tl;

    // Reset initial states
    gsap.set(titleRef.current, {
      autoAlpha: 0,
      scale: 0.95,
      xPercent: -50,
      yPercent: -50,
      y: 0,
    });
    if (dateRef.current) {
      gsap.set(dateRef.current, {
        autoAlpha: 0,
        scale: 0.92,
        xPercent: -50,
        yPercent: -50,
        y: 0,
      });
    }
    if (imageRef.current) {
      gsap.set(imageRef.current, {
        autoAlpha: 0,
        scale: 0.88,
        xPercent: -50,
        yPercent: -50,
        y: 0,
      });
    }
    if (venueRef.current) {
      gsap.set(venueRef.current, {
        autoAlpha: 0,
        scale: 0.92,
        xPercent: -50,
        yPercent: -50,
        y: 0,
      });
    }
    if (venueDateRef.current) {
      gsap.set(venueDateRef.current, {
        autoAlpha: 0,
        scale: 0.92,
        xPercent: -50,
        yPercent: -50,
        y: 0,
      });
    }
    if (descriptionRef.current) {
      gsap.set(descriptionRef.current, {
        autoAlpha: 0,
        scale: 0.95,
        xPercent: -50,
        yPercent: -50,
        y: 0,
      });
    }
    if (ctaRef.current) {
      gsap.set(ctaRef.current, {
        autoAlpha: 0,
        scale: 0.75,
        y: 35,
      });
    }

    // 1. Logo corkscrews in
    const inTl = corkScrew(logoRef.current, 'in', { duration: 1.0 });
    if (inTl) tl.add(inTl);

    // 2. Hold for 1 second, then fade logo out
    tl.to(
      logoRef.current,
      {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          setTypingActive(true);
        },
      },
      '+=1.0',
    );

    // 3. Fade in the title container as CleverText types out
    tl.to(
      titleRef.current,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      },
      '-=0.1',
    );

    // 4. Animate CleverText, Date chip, large image MovieClip, Venue chip, and description
    const hasDesc = Boolean(descriptionText);
    const hasVenueDate = Boolean(event?.venue?.name || event?.date || event?.startdate);

    if (
      dateRef.current ||
      imageRef.current ||
      venueRef.current ||
      venueDateRef.current ||
      descriptionRef.current
    ) {
      const cHeight = containerRef.current?.clientHeight || 800;
      const isCompact = cHeight < 750;
      // Position Date Chip just under the top (under Dynamic Island / status bar)
      const computedDateY = Math.round(-cHeight / 2 + 64);
      const computedTextY = isCompact
        ? (hasDesc ? (len > 35 ? -225 : -215) : -200)
        : (hasDesc ? (len > 35 ? -245 : -235) : -215);
      const computedImageY = isCompact
        ? (hasDesc ? -75 : -50)
        : (hasDesc ? -85 : -55);
      const computedVenueY = isCompact
        ? (hasDesc ? 28 : 55)
        : (hasDesc ? 32 : 65);
      const computedDescY = isCompact ? 105 : 115;

      const sepTl = separatePromoActionScript({
        textTarget: titleRef.current,
        dateTarget: dateRef.current,
        imageTarget: imageRef.current,
        venueTarget: venueRef.current,
        venueDateTarget: venueDateRef.current,
        descriptionTarget: descriptionRef.current,
        dateY: computedDateY,
        textY: computedTextY,
        imageY: computedImageY,
        venueY: computedVenueY,
        venueDateY: computedVenueY,
        descriptionY: computedDescY,
        duration: 1.0,
        delay: 0.4,
      });
      if (sepTl) tl.add(sepTl);
    }

    // 5. Present action buttons 1 by 1 from bottom offscreen to centered pop up, then shrink to row
    const actionsTl = promoActionsActionScript({
      container: containerRef.current,
      buttons: buttonRefs.current,
      labelTarget: labelRef.current,
      actions,
    });
    if (actionsTl) {
      tl.add(actionsTl, '+=0.2');
    }

    // 6. AND LASTLY: Eye-catching "Buy Tickets" CTA animates in as the final element
    if (ctaRef.current) {
      tl.to(
        ctaRef.current,
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          ease: 'back.out(1.4)',
          onComplete: () => {
            setCtaReady(true);
          },
        },
        '+=0.15',
      );
    }
  }, [actions, descriptionText, buyUrl, buyLabel, onBuyClick, onAnimationComplete]);

  useEffect(() => {
    playSequence();

    return () => {
      timelineRef.current?.kill();
    };
  }, [playSequence, titleText, descriptionText]);

  return (
    <div
      ref={containerRef}
      data-testid="promo-flash"
      className={`${styles.container} ${className || ''}`}
      style={style}
      onClick={playSequence}
      role="button"
      tabIndex={0}
      title="Click to replay corkscrew & CleverText sequence"
    >
      <Stage color="transparent" className={styles.stage}>
        <div className={styles.stageContent}>
          <SkiddleLogoMC
            ref={logoRef}
            size={140}
            color="#000000"
            className={styles.logo}
          />
          {/* Standalone Date & Doors Open Chip positioned at top above event title */}
          <PromoDateChipMC
            ref={dateRef}
            event={event}
          />
          <div
            ref={titleRef}
            data-testid="promo-title-container"
            className={styles.title}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '320px',
              padding: '0 1.25rem',
              textAlign: 'center',
              color: '#000000',
              fontSize,
              fontWeight: 800,
              lineHeight,
              letterSpacing: '-0.025em',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              lineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              boxSizing: 'border-box',
              opacity: 0,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <CleverText
              text={titleText}
              speed={28}
              cursor="|"
              active={typingActive}
              style={{
                fontFamily: 'inherit',
                display: 'inline',
                fontWeight: 800,
                color: '#000000',
              }}
            />
          </div>
          {cardImageUrl && (
            <ImageMC
              ref={imageRef}
              src={cardImageUrl}
              alt={titleText}
              width={
                hasVenueDate
                  ? descriptionText
                    ? 160
                    : 200
                  : descriptionText
                    ? 220
                    : 260
              }
              aspectRatio="1/1"
            />
          )}
          {/* Standalone Venue Location Chip positioned underneath featured flyer image */}
          <PromoVenueMC
            ref={venueRef}
            event={event}
          />
          {descriptionText && (
            <div
              ref={descriptionRef}
              data-testid="promo-description"
              className={styles.description}
              style={{
                fontSize: descFontSize,
                lineHeight: descLineHeight,
              }}
            >
              {descriptionText}
            </div>
          )}
        </div>
      </Stage>

      {/* High-impact "Buy Tickets" CTA MovieClip */}
      <PromoCtaMC
        ref={ctaRef}
        label={buyLabel}
        url={buyUrl}
        event={event}
        eventId={id}
        isReady={ctaReady}
        onClick={onBuyClick}
      />

      {/* Action Buttons MovieClip at the bottom of the Promo page */}
      <PromoActionsMC
        actions={actions}
        buttonRefs={buttonRefs}
        labelRef={labelRef}
        event={event}
        eventId={id}
        shareUrl={shareUrl}
        shareTitle={shareTitle || (event?.eventname ? `Check out ${event.eventname} on Skiddle!` : undefined)}
      />
    </div>
  );
}

export default PromoFlash;
