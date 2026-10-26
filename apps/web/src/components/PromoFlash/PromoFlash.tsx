'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, asMovieClip } from '@goldlabelapps/flash';
import { SkiddleLogoMC } from './MovieClips/SkiddleLogoMC';
import styles from './PromoFlash.module.css';
import type { PromoFlashProps } from './types';

/**
 * PromoFlash - Interactive promotional experience component powered by @goldlabelapps/flash.
 * Features modular MovieClips, ActionScript timelines, and animates the Skiddle logo with corkscrew ActionScript.
 */
export function PromoFlash({
  id,
  event,
  className,
  style,
  onAnimationComplete,
}: PromoFlashProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (!logoRef.current) return;

    const moviName = asMovieClip(logoRef.current);
    moviName?.corkScrew('in', {
      onComplete: onAnimationComplete,
    });

    return () => {
      moviName?.timeline?.kill();
    };
  }, [onAnimationComplete]);

  const toggleCorkscrew = useCallback(() => {
    if (!logoRef.current) return;
    const moviName = asMovieClip(logoRef.current);
    const nextDir = direction === 'in' ? 'out' : 'in';
    setDirection(nextDir);
    moviName?.corkScrew(nextDir);
  }, [direction]);

  return (
    <div
      data-testid="promo-flash"
      className={`${styles.container} ${className || ''}`}
      style={style}
      onClick={toggleCorkscrew}
      role="button"
      tabIndex={0}
      title="Click to corkscrew logo in/out"
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
