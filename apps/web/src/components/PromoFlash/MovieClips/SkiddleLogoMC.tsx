import React, { forwardRef } from 'react';
import type { SkiddleLogoMCProps } from '../types';

/**
 * SkiddleLogoMC - Vector MovieClip created from the black Skiddle logo
 * (/apps/web/public/skiddle-logo-dark.svg).
 */
export const SkiddleLogoMC = forwardRef<HTMLDivElement, SkiddleLogoMCProps>(
  function SkiddleLogoMC(
    {
      size = 140,
      color = '#000000',
      className,
      style,
      'aria-label': ariaLabel = 'Skiddle Logo',
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label={ariaLabel}
        data-testid="skiddle-logo-mc"
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          userSelect: 'none',
          willChange: 'transform, opacity',
          ...style,
        }}
        {...rest}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 500 500"
          width="100%"
          height="100%"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <path
            fill={color}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M328.42,205.68l-61.3,34.71l-34.35-19.46l95.67-54.17L328.42,205.68z M301.25,298.36l33.28,18.84
		l-163.07,92.32v-37.69L301.25,298.36z M232.76,259.6l34.35,19.46l-95.67,54.17v-38.91L232.76,259.6z M198.58,201.64l-33.28-18.84
		l163.07-92.32v37.69L198.58,201.64z M362.52,32.58L137.48,160.01v45.56l61.3,34.71L137.48,275v192.42l225.03-127.44v-45.56
		l-61.3-34.72l61.3-34.71L362.52,32.58z"
          />
        </svg>
      </div>
    );
  }
);

SkiddleLogoMC.displayName = 'SkiddleLogoMC';
export default SkiddleLogoMC;
