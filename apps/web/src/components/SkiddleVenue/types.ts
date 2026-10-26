import type { CSSProperties } from "react";

export type GpxRouteTheme = "dark" | "light";

export interface SkiddleVenueData {
  /** Skiddle venue ID */
  id?: string | number;
  /** Venue name (e.g. "Hare And Hounds Kings Heath") */
  name: string;
  /** Street address */
  address?: string;
  /** Town name */
  town?: string;
  /** UK Postcode */
  postcode?: string;
  /** Country code (e.g. "GB") */
  countrycode?: string;
  /** City name */
  cityname?: string;
  /** Phone number */
  phone?: string;
  /** Latitude coordinate */
  latitude: string | number;
  /** Longitude coordinate */
  longitude: string | number;
  /** Skiddle link URL */
  link?: string;
}

export interface SkiddleVenueEmbedOptions {
  venue: SkiddleVenueData;
  host?: string;
  autoPlay?: boolean;
  theme?: GpxRouteTheme;
}

export interface SkiddleVenueProps {
  /** Skiddle Venue data object containing lat/lng and venue metadata */
  venue: SkiddleVenueData;
  /** Host URL for GpxRoute service (defaults to https://gpxroute.pro) */
  host?: string;
  /** Width of the embed container (defaults to "100%") */
  width?: string | number;
  /** Height of the embed container (defaults to "500px") */
  height?: string | number;
  /** Aspect ratio fallback (e.g. "16/9") */
  aspectRatio?: string;
  /** Automatically start the 3D orbit / fly animation */
  autoPlay?: boolean;
  /** Color theme for the viewer overlay */
  theme?: GpxRouteTheme;
  /** Corner radius styling (defaults to "16px") */
  borderRadius?: string | number;
  /** Allow fullscreen mode */
  allowFullscreen?: boolean;
  /** Accessible title for the iframe */
  title?: string;
  /** Optional class name applied to container */
  className?: string;
  /** Optional inline styles */
  style?: CSSProperties;
  /** Loading attribute for iframe ("lazy" | "eager") */
  loading?: "lazy" | "eager";
  /** Event fired when the 3D viewer has loaded and initialized */
  onReady?: () => void;
  /** Event fired when animation playback starts */
  onPlay?: () => void;
  /** Event fired when animation playback pauses */
  onPause?: () => void;
  /** Event fired when orbit progress changes (0.0 to 1.0) */
  onProgress?: (progress: number) => void;
  /** Event fired when an error occurs loading the 3D scene */
  onError?: (error: Error | string) => void;
}

export interface SkiddleVenueHandle {
  /** The underlying HTMLIFrameElement */
  iframe: HTMLIFrameElement | null;
  /** Play the 3D animation / orbit */
  play: () => void;
  /** Pause the 3D animation / orbit */
  pause: () => void;
  /** Seek to a specific normalized progress (0.0 to 1.0) */
  seek: (progress: number) => void;
}

export interface GpxRouteEmbedOptions {
  routeId: string;
  host?: string;
  autoPlay?: boolean;
  theme?: GpxRouteTheme;
  title?: string;
}

export interface GpxRouteProps {
  /** The route ID or slug on gpxroute.pro (e.g. "gaswrx-digbeth" or Firestore doc ID) */
  routeId?: string;
  /** Optional venue object for venue orbit view */
  venue?: SkiddleVenueData;
  /** Host URL for GpxRoute service (defaults to https://gpxroute.pro) */
  host?: string;
  /** Width of the embed container (defaults to "100%") */
  width?: string | number;
  /** Height of the embed container (defaults to "500px") */
  height?: string | number;
  /** Aspect ratio fallback (e.g. "16/9") */
  aspectRatio?: string;
  /** Automatically start the 3D route animation playback */
  autoPlay?: boolean;
  /** Color theme for the viewer overlay */
  theme?: GpxRouteTheme;
  /** Corner radius styling (defaults to "16px") */
  borderRadius?: string | number;
  /** Allow fullscreen mode */
  allowFullscreen?: boolean;
  /** Accessible title for the iframe */
  title?: string;
  /** Optional class name applied to container */
  className?: string;
  /** Optional inline styles */
  style?: CSSProperties;
  /** Loading attribute for iframe ("lazy" | "eager") */
  loading?: "lazy" | "eager";
  /** Event fired when the 3D viewer has loaded and initialized */
  onReady?: () => void;
  /** Event fired when route playback starts */
  onPlay?: () => void;
  /** Event fired when route playback pauses */
  onPause?: () => void;
  /** Event fired when route progress changes (0.0 to 1.0) */
  onProgress?: (progress: number) => void;
  /** Event fired when an error occurs loading the route */
  onError?: (error: Error | string) => void;
}

export type GpxRouteHandle = SkiddleVenueHandle;

export interface GpxRouteMessage {
  source?: string;
  type: "gpxroute:ready" | "gpxroute:play" | "gpxroute:pause" | "gpxroute:progress" | "gpxroute:error" | string;
  routeId?: string;
  venueId?: string;
  progress?: number;
  error?: string;
  [key: string]: unknown;
}

export interface SkiddleVenueElementAttributes {
  "venue-id"?: string;
  name?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  town?: string;
  postcode?: string;
  link?: string;
  host?: string;
  theme?: GpxRouteTheme;
  "auto-play"?: boolean | string;
  width?: string;
  height?: string;
  "aspect-ratio"?: string;
  title?: string;
  "border-radius"?: string;
  "allow-fullscreen"?: boolean | string;
}

export interface GpxRouteElementAttributes extends SkiddleVenueElementAttributes {
  "route-id"?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "skiddle-venue": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & SkiddleVenueElementAttributes,
        HTMLElement
      >;
      "gpx-route": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & GpxRouteElementAttributes,
        HTMLElement
      >;
    }
  }
}
