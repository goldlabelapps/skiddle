'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { Stage, CleverText, ImageMC, corkScrew } from '@goldlabelapps/flash';
import { SkiddleLogoMC } from './MovieClips/SkiddleLogoMC';
import styles from './PromoFlash.module.css';
import type { PromoFlashProps } from './types';

/**
 * PromoFlash - Interactive promotional experience component powered by @goldlabelapps/flash.
 * Features modular MovieClips and ActionScript timelines:
 * 1. Skiddle logo corkscrews in.
 * 2. Pauses for 1 second.
 * 3. Skiddle logo fades out.
 * 4. CleverText MovieClip activates, typing the event title with responsive multi-line wrapping.
 */
export function PromoFlash({
  id,
  event,
  className,
  style,
  onAnimationComplete,
}: PromoFlashProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [typingActive, setTypingActive] = useState(false);

  // Use event.imageurl for the visual MovieClip component
  const cardImageUrl = event?.imageurl || event?.largeimageurl;

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
    gsap.set(titleRef.current, { autoAlpha: 0, scale: 0.95 });
    if (imageRef.current) gsap.set(imageRef.current, { autoAlpha: 0, scale: 0.9 });

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
  }, [onAnimationComplete]);

  useEffect(() => {
    playSequence();

    return () => {
      timelineRef.current?.kill();
    };
  }, [playSequence, titleText]);

  return (
    <div
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
              onFinish={onAnimationComplete}
            />
          </div>
          {cardImageUrl && (
            <ImageMC
              ref={imageRef}
              src={cardImageUrl}
              alt={titleText}
              width={260}
              aspectRatio="4/3"
            />
          )}
        </div>
      </Stage>
    </div>
  );
}

export default PromoFlash;
