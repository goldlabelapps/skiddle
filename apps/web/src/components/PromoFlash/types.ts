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

export interface PromoFlashProps {
  id?: string;
  event?: any;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onAnimationComplete?: () => void;
}
