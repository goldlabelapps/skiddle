'use client';

import React, { useRef, useEffect } from 'react';
import { Stage } from '@goldlabelapps/flash';
import { SkiddleLogoMC } from './MovieClips/SkiddleLogoMC';
import { promoActionScript } from './ActionScript/promoActionScript';
import styles from './PromoFlash.module.css';
import type { PromoFlashProps } from './types';

/**
 * PromoFlash - Interactive promotional experience component powered by @goldlabelapps/flash.
 * Features modular MovieClips, ActionScript timelines, and animates the Skiddle logo centered v & h.
 */
export function PromoFlash({
  id,
  event,
  className,
  style,
  onAnimationComplete,
}: PromoFlashProps) {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;

    const tl = promoActionScript({
      target: logoRef.current,
      onComplete: onAnimationComplete,
    });

    return () => {
      tl?.kill();
    };
  }, [onAnimationComplete]);

  return (
    <div
      data-testid="promo-flash"
      className={`${styles.container} ${className || ''}`}
      style={style}
    >
      <Stage color="transparent" className={styles.stage}>
        <div className={styles.stageContent}>
          <SkiddleLogoMC
            ref={logoRef}
            size={140}
            color="#000000"
            className={styles.logo}
          />
        </div>
      </Stage>
    </div>
  );
}

export default PromoFlash;
