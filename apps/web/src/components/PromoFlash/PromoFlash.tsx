'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { Stage, CleverText, ImageMC, corkScrew } from '@goldlabelapps/flash';
import { SkiddleLogoMC, PromoActionsMC, getDefaultPromoActions } from './MovieClips';
import { separatePromoActionScript, promoActionsActionScript } from './ActionScript';
import styles from './PromoFlash.module.css';
import type { PromoFlashProps } from './types';

/**
 * PromoFlash - Interactive promotional experience component powered by @goldlabelapps/flash.
 * Features modular MovieClips and ActionScript timelines:
 * 1. Skiddle logo corkscrews in.
 * 2. Pauses for 1 second.
 * 3. Skiddle logo fades out.
 * 4. CleverText MovieClip activates, typing the event title with responsive multi-line wrapping.
 * 5. CleverText moves up and the large image MovieClip animates in moving down until nicely separated.
 * 6. Action buttons slide up 1-by-1 from offscreen bottom, pop up centered with top z-index,
 *    display their text description fading in and out, and shrink down into the auto-spaced bottom row.
 */
export function PromoFlash({
  id,
  event,
  actions: customActions,
  className,
  style,
  onAnimationComplete,
}: PromoFlashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [typingActive, setTypingActive] = useState(false);

  const defaultActions = useMemo(
    () => getDefaultPromoActions({ id, event }),
    [id, event]
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
  let fontSize = '1.75rem';
  let lineHeight = 1.25;
  const len = titleText.trim().length;

  if (len > 60) {
    fontSize = '1.125rem';
    lineHeight = 1.4;
  } else if (len > 35) {
    fontSize = '1.35rem';
    lineHeight = 1.35;
  } else if (len > 20) {
    fontSize = '1.5rem';
    lineHeight = 1.3;
  }

  const playSequence = useCallback(() => {
    if (!logoRef.current || !titleRef.current) return;

    timelineRef.current?.kill();
    setTypingActive(false);

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
    if (imageRef.current) {
      gsap.set(imageRef.current, {
        autoAlpha: 0,
        scale: 0.88,
        xPercent: -50,
        yPercent: -50,
        y: 0,
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

    // 4. Animate CleverText and large image MovieClips separating up and down respectively
    if (imageRef.current) {
      const sepTl = separatePromoActionScript({
        textTarget: titleRef.current,
        imageTarget: imageRef.current,
        textY: -130,
        imageY: 110,
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
  }, [actions, onAnimationComplete]);

  useEffect(() => {
    playSequence();

    return () => {
      timelineRef.current?.kill();
    };
  }, [playSequence, titleText]);

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
          <div
            ref={titleRef}
            data-testid="promo-title-container"
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
              width={260}
              aspectRatio="1/1"
            />
          )}
        </div>
      </Stage>

      {/* Action Buttons MovieClip at the bottom of the Promo page */}
      <PromoActionsMC
        actions={actions}
        buttonRefs={buttonRefs}
        labelRef={labelRef}
      />
    </div>
  );
}

export default PromoFlash;
