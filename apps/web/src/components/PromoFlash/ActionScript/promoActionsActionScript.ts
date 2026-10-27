import { gsap } from 'gsap';
import type { PromoActionsActionScriptOptions } from '../types';

/**
 * promoActionsActionScript - ActionScript timeline presenting action buttons 1 by 1:
 * 1. Slides in from offscreen bottom, centered horizontally in the Promo component ("right in the middle horx").
 * 2. Pops up just a little bit higher than where it ends up (y: -popLift) with highest z-index above all clips.
 * 3. Text label describing what the button does fades in and out right above the popped-up icon.
 * 4. Button shrinks down into its designated slot in the auto-spaced row of icon buttons.
 */
export function promoActionsActionScript({
  container,
  buttons,
  labelTarget,
  actions,
  popScale = 1.35,
  popLift = 68,
  slideDuration = 0.45,
  labelFadeDuration = 0.22,
  labelHoldDuration = 0.65,
  shrinkDuration = 0.45,
  onComplete,
}: PromoActionsActionScriptOptions): gsap.core.Timeline | null {
  if (!container || !buttons || buttons.length === 0) return null;

  const validButtons = buttons.filter((b): b is HTMLElement => b !== null);
  if (validButtons.length === 0) return null;

  const tl = gsap.timeline({ onComplete });

  // Measure container geometry
  const cRect =
    typeof container.getBoundingClientRect === 'function'
      ? container.getBoundingClientRect()
      : { width: 390, height: 800, left: 0, top: 0 };
  const containerWidth = cRect.width || 390;
  const containerHeight = cRect.height || 800;
  const containerLeft = cRect.left || 0;
  const containerTop = cRect.top || 0;

  const centerX = containerWidth / 2;

  // Initialize initial offscreen states (horizontally centered, offscreen bottom)
  validButtons.forEach((btn) => {
    const btnRect =
      typeof btn.getBoundingClientRect === 'function'
        ? btn.getBoundingClientRect()
        : {
            left: containerLeft + centerX - 24,
            top: containerTop + containerHeight - 60,
            width: 48,
            height: 48,
          };
    const btnCenterX = btnRect.left + (btnRect.width || 48) / 2 - containerLeft;
    const btnCenterY = btnRect.top + (btnRect.height || 48) / 2 - containerTop;

    const deltaX = centerX - btnCenterX;
    const offscreenY = containerHeight - btnCenterY + 120;

    gsap.set(btn, {
      x: deltaX,
      y: offscreenY,
      scale: 0.8,
      autoAlpha: 0,
      zIndex: 1000,
      pointerEvents: 'none',
    });
  });

  if (labelTarget) {
    gsap.set(labelTarget, {
      autoAlpha: 0,
      y: 8,
      zIndex: 10001,
      pointerEvents: 'none',
    });
  }

  // Sequence each action button one by one
  validButtons.forEach((btn, index) => {
    const action = actions[index];
    if (!action) return;

    const btnRect =
      typeof btn.getBoundingClientRect === 'function'
        ? btn.getBoundingClientRect()
        : {
            left: containerLeft + centerX - 24,
            top: containerTop + containerHeight - 60,
            width: 48,
            height: 48,
          };
    const btnCenterX = btnRect.left + (btnRect.width || 48) / 2 - containerLeft;
    const deltaX = centerX - btnCenterX;

    // 1. Slide up from offscreen bottom, right in the middle horizontally,
    // popping up only a little bit higher than where it ends up (-popLift)
    tl.to(btn, {
      x: deltaX,
      y: -popLift,
      scale: popScale,
      autoAlpha: 1,
      duration: slideDuration,
      ease: 'back.out(1.15)',
    });

    // 2. Once popped up, text describing what it does fades in and out
    if (labelTarget) {
      tl.call(() => {
        labelTarget.textContent = action.label;
      });

      tl.to(labelTarget, {
        autoAlpha: 1,
        y: 0,
        duration: labelFadeDuration,
        ease: 'power2.out',
      });

      tl.to({}, { duration: labelHoldDuration });

      tl.to(labelTarget, {
        autoAlpha: 0,
        y: -6,
        duration: labelFadeDuration,
        ease: 'power2.in',
      });
    }

    // 3. Once done, icon button shrinks down into its auto-spaced slot in the row
    tl.to(btn, {
      x: 0,
      y: 0,
      scale: 1.0,
      duration: shrinkDuration,
      ease: 'power3.out',
      onComplete: () => {
        gsap.set(btn, { zIndex: 10, pointerEvents: 'auto' });
      },
    });

    // Brief breath before next button slides up
    if (index < validButtons.length - 1) {
      tl.to({}, { duration: 0.1 });
    }
  });

  return tl;
}

export default promoActionsActionScript;
