import { DEFAULT_HOST, DEFAULT_THEME, CUSTOM_ELEMENT_TAG } from "./constants";
import type { GpxRouteEmbedOptions, SkiddleVenueEmbedOptions } from "./types";

/**
 * Normalizes host URL by stripping trailing slashes.
 */
export function sanitizeHost(host?: string): string {
  if (!host || typeof host !== "string") return DEFAULT_HOST;
  return host.trim().replace(/\/+$/, "");
}

/**
 * Builds the embeddable iframe URL for a Skiddle venue orbit scene.
 */
export function buildVenueEmbedUrl({
  venue,
  host = DEFAULT_HOST,
  autoPlay = false,
  theme = DEFAULT_THEME,
}: SkiddleVenueEmbedOptions): string {
  if (!venue) {
    throw new Error("venue object is required to construct a SkiddleVenue embed URL");
  }

  const cleanHost = sanitizeHost(host);
  const params = new URLSearchParams();

  const lat =
    typeof venue.latitude === "number"
      ? String(venue.latitude)
      : (venue.latitude || "").trim();
  const lng =
    typeof venue.longitude === "number"
      ? String(venue.longitude)
      : (venue.longitude || "").trim();

  if (!lat || !lng) {
    throw new Error("latitude and longitude are required to construct a SkiddleVenue embed URL");
  }

  params.set("lat", lat);
  params.set("lng", lng);

  if (venue.name) params.set("name", venue.name.trim());
  if (venue.id !== undefined && venue.id !== null) params.set("id", String(venue.id).trim());
  if (venue.address) params.set("address", venue.address.trim());
  if (venue.town || venue.cityname) params.set("city", (venue.town || venue.cityname || "").trim());
  if (venue.postcode) params.set("postcode", venue.postcode.trim());
  if (venue.countrycode) params.set("country", venue.countrycode.trim());
  if (venue.phone) params.set("phone", venue.phone.trim());
  if (venue.link) params.set("link", venue.link.trim());

  if (autoPlay) {
    params.set("autoplay", "1");
  }

  if (theme && theme !== "dark") {
    params.set("theme", theme);
  }

  // Instruct 3D engine to initiate smooth fly-in and 360 orbit
  params.set("orbit", "1");

  const query = params.toString();
  return `${cleanHost}/venue/embed${query ? `?${query}` : ""}`;
}

/**
 * Builds the embeddable iframe URL for a GPX route.
 */
export function buildEmbedUrl({
  routeId,
  host = DEFAULT_HOST,
  autoPlay = false,
  theme = DEFAULT_THEME,
}: GpxRouteEmbedOptions): string {
  if (!routeId) {
    throw new Error("routeId is required to construct a GpxRoute embed URL");
  }

  const cleanHost = sanitizeHost(host);
  const cleanId = encodeURIComponent(routeId.trim());
  const params = new URLSearchParams();

  if (autoPlay) {
    params.set("autoplay", "1");
  }

  if (theme && theme !== "dark") {
    params.set("theme", theme);
  }

  const query = params.toString();
  return `${cleanHost}/${cleanId}/embed${query ? `?${query}` : ""}`;
}

/**
 * Builds the public route or venue link.
 */
export function buildRouteUrl(routeId?: string, host = DEFAULT_HOST): string {
  const cleanHost = sanitizeHost(host);
  if (!routeId) return cleanHost;
  return `${cleanHost}/${encodeURIComponent(routeId.trim())}`;
}

/**
 * Formats a CSS dimension value (e.g. 500 -> "500px", "100%" -> "100%").
 */
export function formatDimension(value?: string | number | null, fallback = "100%"): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "number") return `${value}px`;
  return String(value);
}

/**
 * Checks whether the custom element is already registered in the current environment.
 */
export function isCustomElementDefined(tag = CUSTOM_ELEMENT_TAG): boolean {
  if (typeof window === "undefined" || !("customElements" in window)) {
    return false;
  }
  return Boolean(window.customElements.get(tag));
}
