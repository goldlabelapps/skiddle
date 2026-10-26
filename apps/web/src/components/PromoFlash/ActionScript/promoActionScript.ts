import { gsap } from 'gsap';
import type { PromoActionScriptOptions } from '../types';

/**
 * promoActionScript - ActionScript timeline animating the Skiddle logo
 * to be centered vertically and horizontally with smooth easing.
 */
export function promoActionScript({
  target,
  duration = 1.0,
  delay = 0.2,
  onComplete,
  loop = false,
  speed = 1,
}: PromoActionScriptOptions) {
  if (!target) return null;

  const tl = gsap.timeline({
    repeat: loop ? -1 : 0,
    onComplete,
  });

  tl.timeScale(speed);

  // Initial state: centered coordinates, scaled down and transparent
  gsap.set(target, {
    position: 'absolute',
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    scale: 0.3,
    rotation: -12,
  });

  // Animate in to centered scale 1 with smooth bounce ease
  tl.to(target, {
    autoAlpha: 1,
    scale: 1,
    rotation: 0,
    duration,
    delay,
    ease: 'back.out(1.7)',
  });

  return tl;
}

export default promoActionScript;
