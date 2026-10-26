import { gsap } from 'gsap';
import { corkscrewActionScript } from '@goldlabelapps/flash';
import type { PromoActionScriptOptions } from '../types';

/**
 * promoActionScript - ActionScript timeline animating the Skiddle logo
 * to be centered vertically and horizontally with a corkscrew motion from @goldlabelapps/flash.
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

  // Center coordinates on the stage
  gsap.set(target, {
    position: 'absolute',
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
  });

  return corkscrewActionScript({
    target,
    direction: 'in',
    duration,
    delay,
    onComplete,
    loop,
    speed,
  });
}

export default promoActionScript;
