import React from "react";
import styles from "./IPhoneFrame.module.css";

interface IPhoneFrameProps {
  children: React.ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div
      data-testid="iphone-frame"
      className={`${styles.frame} relative flex flex-col items-center justify-center w-full h-[100dvh] md:h-[calc(100dvh-32px)] md:max-h-[calc(100vh-32px)] md:aspect-[9/19.5] md:w-auto md:max-w-[calc(100vw-32px)] md:rounded-[50px] md:border-[11px] md:border-slate-900 md:ring-1 md:ring-white/15 md:shadow-[0_0_0_2px_#334155,0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_50px_rgba(0,0,0,0.5)] bg-black transition-all overflow-visible select-none`}
    >
      {/* Side Hardware Buttons (Desktop only) */}
      {/* Action / Mute button */}
      <div
        data-testid="phone-button-action"
        aria-hidden="true"
        className={`${styles.btnAction} hidden md:block absolute -left-[14.5px] top-[11%] w-[3.5px] h-[30px] bg-slate-700/90 rounded-l-sm`}
      />
      {/* Volume Up */}
      <div
        data-testid="phone-button-vol-up"
        aria-hidden="true"
        className={`${styles.btnVolUp} hidden md:block absolute -left-[14.5px] top-[17%] w-[3.5px] h-[56px] bg-slate-700/90 rounded-l-sm`}
      />
      {/* Volume Down */}
      <div
        data-testid="phone-button-vol-down"
        aria-hidden="true"
        className={`${styles.btnVolDown} hidden md:block absolute -left-[14.5px] top-[26%] w-[3.5px] h-[56px] bg-slate-700/90 rounded-l-sm`}
      />
      {/* Power / Lock Button */}
      <div
        data-testid="phone-button-power"
        aria-hidden="true"
        className={`${styles.btnPower} hidden md:block absolute -right-[14.5px] top-[19%] w-[3.5px] h-[72px] bg-slate-700/90 rounded-r-sm`}
      />

      {/* Screen Container */}
      <div
        data-testid="phone-screen"
        className={`${styles.screen} relative w-full h-full rounded-none md:rounded-[39px] overflow-hidden bg-black flex flex-col`}
      >
        {/* iOS Status Bar (Desktop only) */}
        <div
          data-testid="phone-status-bar"
          aria-hidden="true"
          className={`${styles.statusBar} hidden md:flex absolute top-3.5 left-0 right-0 px-7 items-center justify-between z-30 pointer-events-none text-white/90 text-[11px] font-semibold tracking-tight`}
        >
          <span>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Cellular signal */}
            <svg
              style={{ width: "16px", height: "12px", fill: "currentColor" }}
              viewBox="0 0 17 12"
              aria-hidden="true"
            >
              <rect x="0" y="9" width="3" height="3" rx="0.5" />
              <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
              <rect x="9" y="3" width="3" height="9" rx="0.5" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
            </svg>
            {/* Wi-Fi */}
            <svg
              style={{ width: "14px", height: "12px", fill: "currentColor" }}
              viewBox="0 0 16 12"
              aria-hidden="true"
            >
              <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.24-3.18a6.002 6.002 0 0 1 8.48 0 .75.75 0 0 0 1.06-1.06 7.502 7.502 0 0 0-10.6 0 .75.75 0 1 0 1.06 1.06zm-2.12-2.12a9.003 9.003 0 0 1 12.72 0 .75.75 0 1 0 1.06-1.06 10.503 10.503 0 0 0-14.84 0 .75.75 0 0 0 1.06 1.06z" />
            </svg>
            {/* Battery */}
            <div
              style={{
                width: "20px",
                height: "10px",
                borderRadius: "3px",
                border: "1px solid currentColor",
                padding: "1px",
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div style={{ height: "100%", width: "100%", backgroundColor: "currentColor", borderRadius: "1px" }} />
              <div
                style={{
                  width: "1.5px",
                  height: "4px",
                  backgroundColor: "currentColor",
                  position: "absolute",
                  right: "-3px",
                  borderTopRightRadius: "0.5px",
                  borderBottomRightRadius: "0.5px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Island (Desktop only) */}
        <div
          data-testid="phone-dynamic-island"
          aria-hidden="true"
          className={`${styles.dynamicIsland} hidden md:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-[110px] h-[28px] bg-black rounded-full z-30 items-center justify-end px-3 gap-2 pointer-events-none ring-1 ring-white/10 shadow-md`}
        >
          {/* Sensor */}
          <div className={styles.islandSensor} />
          {/* Camera Lens */}
          <div className={styles.islandCamera}>
            <div className={styles.cameraLens} />
          </div>
        </div>

        {/* App Content */}
        <div className={`${styles.appContent} relative w-full h-full flex-1 overflow-hidden`}>
          {children}
        </div>

        {/* Home Indicator (Desktop only) */}
        <div
          data-testid="phone-home-indicator"
          aria-hidden="true"
          className={`${styles.homeIndicator} hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[4px] bg-white/40 rounded-full z-30 pointer-events-none`}
        />
      </div>
    </div>
  );
}

export default IPhoneFrame;
