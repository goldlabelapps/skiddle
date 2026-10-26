"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_HOST,
  DEFAULT_THEME,
  DEFAULT_BORDER_RADIUS,
} from "./constants";
import type { SkiddleVenueHandle, SkiddleVenueProps } from "./types";
import { buildVenueEmbedUrl, formatDimension, sanitizeHost } from "./utils";
import { defineSkiddleVenueCustomElement } from "./element";

export const SkiddleVenue = forwardRef<SkiddleVenueHandle, SkiddleVenueProps>(
  function SkiddleVenue(
    {
      venue,
      host = DEFAULT_HOST,
      width = "100%",
      height = "500px",
      aspectRatio,
      autoPlay = true,
      theme = DEFAULT_THEME,
      borderRadius = DEFAULT_BORDER_RADIUS,
      allowFullscreen = true,
      title,
      className = "",
      style,
      loading = "lazy",
      onReady,
      onPlay,
      onPause,
      onProgress,
      onError,
    },
    ref
  ) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Register Web Component in background for hybrid environments
    useEffect(() => {
      defineSkiddleVenueCustomElement();
    }, []);

    const embedUrl = React.useMemo(() => {
      if (!venue || !venue.latitude || !venue.longitude) return "";
      try {
        return buildVenueEmbedUrl({ venue, host, autoPlay, theme });
      } catch {
        return "";
      }
    }, [venue, host, autoPlay, theme]);

    // Reliable iframe load detection
    useEffect(() => {
      setIsLoaded(false);
      const iframe = iframeRef.current;

      const handleIframeLoad = () => {
        setIsLoaded(true);
        onReady?.();
      };

      if (iframe) {
        iframe.addEventListener("load", handleIframeLoad);
      }

      const fallbackTimer = setTimeout(handleIframeLoad, 2000);

      return () => {
        if (iframe) {
          iframe.removeEventListener("load", handleIframeLoad);
        }
        clearTimeout(fallbackTimer);
      };
    }, [embedUrl, onReady]);

    const postMessageToAction = useCallback(
      (action: string, extra?: Record<string, unknown>) => {
        if (!iframeRef.current || !iframeRef.current.contentWindow) return;
        const targetOrigin = sanitizeHost(host);
        iframeRef.current.contentWindow.postMessage(
          { type: "gpxroute:action", action, ...extra },
          targetOrigin
        );
      },
      [host]
    );

    useImperativeHandle(
      ref,
      () => ({
        get iframe() {
          return iframeRef.current;
        },
        play: () => postMessageToAction("play"),
        pause: () => postMessageToAction("pause"),
        seek: (progress: number) =>
          postMessageToAction("seek", { progress: Math.max(0, Math.min(1, progress)) }),
      }),
      [postMessageToAction]
    );

    // Listen for postMessage telemetry from the Cesium 3D viewer
    useEffect(() => {
      const handleWindowMessage = (event: MessageEvent) => {
        const expectedOrigin = sanitizeHost(host);
        if (
          expectedOrigin !== "*" &&
          event.origin &&
          event.origin !== expectedOrigin &&
          !event.origin.includes("localhost")
        ) {
          return;
        }

        const data = event.data;
        if (!data || typeof data !== "object") return;

        if (
          data.source !== "gpxroute" &&
          data.type !== "gpxroute:ready" &&
          data.type !== "gpxroute:play" &&
          data.type !== "gpxroute:pause" &&
          data.type !== "gpxroute:progress" &&
          data.type !== "gpxroute:error"
        ) {
          return;
        }

        switch (data.type) {
          case "gpxroute:ready":
            setIsLoaded(true);
            onReady?.();
            break;
          case "gpxroute:play":
            onPlay?.();
            break;
          case "gpxroute:pause":
            onPause?.();
            break;
          case "gpxroute:progress":
            if (typeof data.progress === "number") {
              onProgress?.(data.progress);
            }
            break;
          case "gpxroute:error":
            onError?.(data.error || "An error occurred in GpxRoute viewer");
            break;
        }
      };

      if (typeof window !== "undefined") {
        window.addEventListener("message", handleWindowMessage);
        return () => window.removeEventListener("message", handleWindowMessage);
      }
    }, [host, onReady, onPlay, onPause, onProgress, onError]);

    const formattedWidth = formatDimension(width);
    const formattedHeight = aspectRatio ? undefined : formatDimension(height, "500px");
    const formattedBorderRadius = formatDimension(borderRadius, DEFAULT_BORDER_RADIUS);
    const venueName = venue?.name || "Venue";
    const iframeTitle = title || `Skiddle Venue: ${venueName}`;

    const containerStyle: React.CSSProperties = {
      position: "relative",
      width: formattedWidth,
      height: formattedHeight,
      aspectRatio,
      borderRadius: formattedBorderRadius,
      overflow: "hidden",
      backgroundColor: theme === "light" ? "#f8fafc" : "#020617",
      ...style,
    };

    return (
      <div
        className={`gpxroute-venue-container ${className}`.trim()}
        style={containerStyle}
        data-theme={theme}
      >
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={iframeTitle}
            loading={loading}
            allow={
              allowFullscreen
                ? "accelerometer; autoplay; camera; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                : "accelerometer; autoplay; camera; encrypted-media; gyroscope; picture-in-picture"
            }
            allowFullScreen={allowFullscreen}
            style={{
              width: "100%",
              height: "100%",
              border: 0,
              display: "block",
              borderRadius: formattedBorderRadius,
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "20px",
              textAlign: "center",
              color: "#ef4444",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "13px",
            }}
          >
            A valid venue with latitude and longitude is required.
          </div>
        )}
      </div>
    );
  }
);

export default SkiddleVenue;
