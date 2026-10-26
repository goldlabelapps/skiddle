import type { CSSProperties, ReactNode } from 'react';

export interface SkiddleLogoMCProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export interface PromoActionScriptOptions {
  target: HTMLElement | null;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
  loop?: boolean;
  speed?: number;
}

export interface SeparatePromoActionScriptOptions {
  textTarget: HTMLElement | null;
  imageTarget: HTMLElement | null;
  textY?: number;
  imageY?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  imageEase?: string;
  onComplete?: () => void;
}

export interface PromoActionButton {
  id: string;
  label: string;
  icon: ReactNode;
  ariaLabel?: string;
  backgroundColor?: string;
  color?: string;
  onClick?: (event: React.MouseEvent, context?: { id?: string; event?: any }) => void;
}

export interface PromoActionsActionScriptOptions {
  container: HTMLElement | null;
  buttons: (HTMLElement | null)[];
  labelTarget: HTMLElement | null;
  actions: PromoActionButton[];
  popScale?: number;
  popLift?: number;
  slideDuration?: number;
  labelFadeDuration?: number;
  labelHoldDuration?: number;
  shrinkDuration?: number;
  onComplete?: () => void;
}

export interface PromoActionsMCProps {
  actions?: PromoActionButton[];
  buttonRefs?: React.MutableRefObject<(HTMLElement | null)[]>;
  labelRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  style?: CSSProperties;
}

export interface PromoFlashProps {
  id?: string;
  event?: any;
  actions?: PromoActionButton[];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onAnimationComplete?: () => void;
}
