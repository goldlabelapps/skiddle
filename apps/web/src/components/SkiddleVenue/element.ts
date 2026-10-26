import {
  DEFAULT_HOST,
  DEFAULT_THEME,
  DEFAULT_BORDER_RADIUS,
  CUSTOM_ELEMENT_TAG,
  GPXROUTE_CUSTOM_ELEMENT_TAG,
} from "./constants";
import { buildEmbedUrl, buildVenueEmbedUrl, formatDimension, sanitizeHost } from "./utils";

const OBSERVED_ATTRIBUTES = [
  "latitude",
  "longitude",
  "name",
  "venue-id",
  "address",
  "town",
  "postcode",
  "link",
  "route-id",
  "host",
  "auto-play",
  "theme",
  "width",
  "height",
  "aspect-ratio",
  "title",
  "border-radius",
  "allow-fullscreen",
] as const;

const BaseElement: {
  new (): HTMLElement;
  prototype: HTMLElement;
} = (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) as any;

export class SkiddleVenueElement extends BaseElement {
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  private _shadowRoot: ShadowRoot | null = null;
  private _iframe: HTMLIFrameElement | null = null;
  private _loadingOverlay: HTMLDivElement | null = null;
  private _boundOnMessage: ((event: MessageEvent) => void) | null = null;

  constructor() {
    super();
    if (typeof this.attachShadow === "function") {
      this._shadowRoot = this.attachShadow({ mode: "open" });
    }
  }

  connectedCallback(): void {
    if (!this._shadowRoot) return;
    this._render();
    this._setupMessageListener();
  }

  disconnectedCallback(): void {
    if (this._boundOnMessage && typeof window !== "undefined") {
      window.removeEventListener("message", this._boundOnMessage);
      this._boundOnMessage = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this._shadowRoot) return;

    if (name === "width" || name === "height" || name === "aspect-ratio" || name === "border-radius") {
      this._updateContainerStyles();
    } else {
      this._render();
    }
  }

  /**
   * Triggers playback of the 3D animation / orbit.
   */
  public play(): void {
    this._postMessage({ type: "gpxroute:action", action: "play" });
  }

  /**
   * Pauses the 3D animation / orbit.
   */
  public pause(): void {
    this._postMessage({ type: "gpxroute:action", action: "pause" });
  }

  /**
   * Seeks progress (0.0 to 1.0).
   */
  public seek(progress: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    this._postMessage({ type: "gpxroute:action", action: "seek", progress: clamped });
  }

  /**
   * Returns the underlying iframe element.
   */
  public get iframe(): HTMLIFrameElement | null {
    return this._iframe;
  }

  private _postMessage(message: Record<string, unknown>): void {
    if (!this._iframe || !this._iframe.contentWindow) return;
    const targetOrigin = sanitizeHost(this.getAttribute("host") || DEFAULT_HOST);
    this._iframe.contentWindow.postMessage(message, targetOrigin);
  }

  private _setupMessageListener(): void {
    if (this._boundOnMessage) return;

    this._boundOnMessage = (event: MessageEvent) => {
      const targetOrigin = sanitizeHost(this.getAttribute("host") || DEFAULT_HOST);
      if (
        targetOrigin !== "*" &&
        event.origin &&
        event.origin !== targetOrigin &&
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

      if (data.type === "gpxroute:ready" && this._loadingOverlay) {
        this._loadingOverlay.style.display = "none";
        if (this._iframe) this._iframe.style.opacity = "1";
      }

      const eventName = data.type.replace(/^gpxroute:/, "");
      this.dispatchEvent(
        new CustomEvent(eventName, {
          detail: data,
          bubbles: true,
          composed: true,
        })
      );
    };

    if (typeof window !== "undefined") {
      window.addEventListener("message", this._boundOnMessage);
    }
  }

  private _getEmbedUrl(): string {
    const lat = this.getAttribute("latitude");
    const lng = this.getAttribute("longitude");
    const host = this.getAttribute("host") || DEFAULT_HOST;
    const autoPlay = this.hasAttribute("auto-play") && this.getAttribute("auto-play") !== "false";
    const theme = (this.getAttribute("theme") as "dark" | "light") || DEFAULT_THEME;

    if (lat && lng) {
      try {
        return buildVenueEmbedUrl({
          venue: {
            id: this.getAttribute("venue-id") || undefined,
            name: this.getAttribute("name") || "Venue",
            address: this.getAttribute("address") || undefined,
            town: this.getAttribute("town") || undefined,
            postcode: this.getAttribute("postcode") || undefined,
            link: this.getAttribute("link") || undefined,
            latitude: lat,
            longitude: lng,
          },
          host,
          autoPlay,
          theme,
        });
      } catch {
        return "";
      }
    }

    const routeId = this.getAttribute("route-id");
    if (routeId) {
      try {
        return buildEmbedUrl({ routeId, host, autoPlay, theme });
      } catch {
        return "";
      }
    }

    return "";
  }

  private _updateContainerStyles(): void {
    if (!this._shadowRoot) return;
    const container = this._shadowRoot.querySelector(".gpxroute-wrapper") as HTMLElement | null;
    if (!container) return;

    const width = this.getAttribute("width");
    const height = this.getAttribute("height");
    const aspectRatio = this.getAttribute("aspect-ratio");
    const borderRadius = this.getAttribute("border-radius");

    container.style.width = formatDimension(width, "100%");
    container.style.height = aspectRatio ? "auto" : formatDimension(height, "500px");
    if (aspectRatio) container.style.aspectRatio = aspectRatio;
    container.style.borderRadius = formatDimension(borderRadius, DEFAULT_BORDER_RADIUS);
  }

  private _render(): void {
    if (!this._shadowRoot) return;

    const embedUrl = this._getEmbedUrl();
    const title = this.getAttribute("title") || this.getAttribute("name") || "3D Viewer";
    const allowFullscreen = this.getAttribute("allow-fullscreen") !== "false";
    const theme = this.getAttribute("theme") || DEFAULT_THEME;
    const borderRadius = formatDimension(this.getAttribute("border-radius"), DEFAULT_BORDER_RADIUS);
    const width = formatDimension(this.getAttribute("width"), "100%");
    const height = this.getAttribute("aspect-ratio")
      ? "auto"
      : formatDimension(this.getAttribute("height"), "500px");
    const aspectRatio = this.getAttribute("aspect-ratio") || "auto";

    const bgColor = theme === "light" ? "#f8fafc" : "#020617";
    const textColor = theme === "light" ? "#64748b" : "#94a3b8";

    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${width};
        }
        .gpxroute-wrapper {
          position: relative;
          width: 100%;
          height: ${height};
          aspect-ratio: ${aspectRatio};
          border-radius: ${borderRadius};
          overflow: hidden;
          background-color: ${bgColor};
          box-sizing: border-box;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
          border-radius: ${borderRadius};
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
        }
        .loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          z-index: 1;
          pointer-events: none;
          color: ${textColor};
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
        }
        .spinner {
          width: 28px;
          height: 28px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .empty-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;
          color: #ef4444;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
          text-align: center;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="gpxroute-wrapper">
        ${
          embedUrl
            ? `
          <div class="loading-overlay">
            <div class="spinner"></div>
            <span>Loading 3D View…</span>
          </div>
          <iframe
            src="${embedUrl}"
            title="${title}"
            allow="${
              allowFullscreen
                ? "accelerometer; autoplay; camera; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                : "accelerometer; autoplay; camera; encrypted-media; gyroscope; picture-in-picture"
            }"
            ${allowFullscreen ? "allowfullscreen" : ""}
          ></iframe>
        `
            : `
          <div class="empty-placeholder">
            A valid venue with latitude and longitude is required.
          </div>
        `
        }
      </div>
    `;

    this._iframe = this._shadowRoot.querySelector("iframe");
    this._loadingOverlay = this._shadowRoot.querySelector(".loading-overlay");

    if (this._iframe) {
      const handleLoad = () => {
        if (this._loadingOverlay) this._loadingOverlay.style.display = "none";
        if (this._iframe) this._iframe.style.opacity = "1";
        this.dispatchEvent(new CustomEvent("ready", { bubbles: true, composed: true }));
      };
      this._iframe.addEventListener("load", handleLoad);
      setTimeout(handleLoad, 2000);
    }
  }
}

export const GpxRouteElement = SkiddleVenueElement;

/**
 * Registers the <skiddle-venue> Custom Element.
 */
export function defineSkiddleVenueCustomElement(tag = CUSTOM_ELEMENT_TAG): void {
  if (typeof window === "undefined" || !("customElements" in window)) {
    return;
  }
  if (!window.customElements.get(tag)) {
    window.customElements.define(tag, SkiddleVenueElement);
  }
}

/**
 * Registers the <gpx-route> Custom Element.
 */
export function defineGpxRouteCustomElement(tag = GPXROUTE_CUSTOM_ELEMENT_TAG): void {
  if (typeof window === "undefined" || !("customElements" in window)) {
    return;
  }
  if (!window.customElements.get(tag)) {
    window.customElements.define(tag, GpxRouteElement);
  }
}
