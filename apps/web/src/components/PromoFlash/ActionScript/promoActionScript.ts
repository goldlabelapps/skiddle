import { gsap } from 'gsap';
import { corkscrewActionScript } from '@goldlabelapps/flash';
import type { PromoActionScriptOptions, SeparatePromoActionScriptOptions } from '../types';

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

/**
 * separatePromoActionScript - ActionScript timeline animating CleverText and ImageMC
 * moving up and down respectively until they are nicely separated.
 */
export function separatePromoActionScript({
  textTarget,
  imageTarget,
  textY = -130,
  imageY = 110,
  duration = 1.0,
  delay = 0.4,
  ease = 'power3.inOut',
  imageEase = 'power3.out',
  onComplete,
}: SeparatePromoActionScriptOptions): gsap.core.Timeline | null {
  if (!textTarget) return null;

  const tl = gsap.timeline({ onComplete });

  // Move CleverText / title up
  tl.to(
    textTarget,
    {
      y: textY,
      duration,
      ease,
    },
    `+=${delay}`,
  );

  // Animate the large image MovieClip moving down to separate nicely
  if (imageTarget) {
    tl.fromTo(
      imageTarget,
      {
        autoAlpha: 0,
        scale: 0.88,
        y: 0,
      },
      {
        autoAlpha: 1,
        scale: 1,
        y: imageY,
        duration,
        ease: imageEase,
      },
      '<',
    );
  }

  return tl;
}

export default promoActionScript;
