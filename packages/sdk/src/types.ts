/**
 * TypeScript definitions for Skiddle API responses and entities.
 */

export interface SkiddleSessionConfig {
  apiKey?: string;
  devMode?: boolean;
}

export interface SkiddleRequestOptions {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timeoutMs?: number;
}

export interface DebugEntry {
  timestamp: string;
  url: string;
  method: string;
  durationMs: number;
  status: number;
  headers: Record<string, string>;
  responseSnippet: string;
}

export interface SkiddleApiResponse<T = unknown> {
  error?: number | string;
  totalresults?: number;
  totalcount?: number;
  page?: number;
  pagecount?: number;
  results?: T;
  data?: T;
  meta?: {
    totalresults?: number;
    count?: number;
    [key: string]: unknown;
  };
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Detailed venue structure returned by the single event endpoint (/api/v1/events/{id}/).
 */
export interface SkiddleEventDetailVenue {
  id: string;
  name: string;
  address: string;
  town: string;
  postcode: string;
  countrycode: string;
  cityname: string;
  phone: string;
  latitude: string;
  longitude: string;
  link: string;
  [key: string]: unknown;
}

/**
 * Opening times structure for an event.
 */
export interface SkiddleEventOpeningTimes {
  doorsopen: string;
  doorsclose: string;
  lastentry: string;
  [key: string]: unknown;
}

/**
 * Genre entry for single event details.
 */
export interface SkiddleEventGenreDetail {
  genreid: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Rep / brand ambassador settings on an event.
 */
export interface SkiddleEventRep {
  enabled: boolean;
  [key: string]: unknown;
}

/**
 * Artist structure inside single event details.
 */
export interface SkiddleEventArtistDetail {
  artistid?: string;
  name?: string;
  imageurl?: string;
  [key: string]: unknown;
}

/**
 * Complete single event detail shape as returned by Skiddle API v1 (/api/v1/events/{id}/)
 * and utilized for generating eFlyer promotional materials.
 */
export interface SkiddleEventDetail {
  id: string;
  listingid: string;
  eventname: string;
  cancelled: '0' | '1' | string;
  cancellationDate?: string;
  cancellationType?: string;
  cancellationReason?: string;
  rescheduledDate?: string;
  venue: SkiddleEventDetailVenue;
  imageurl: string;
  largeimageurl: string;
  headerhex: string;
  link: string;
  date: string;
  dateStart: string;
  dateEnd: string;
  startdate: string;
  enddate: string;
  description: string;
  openingtimes: SkiddleEventOpeningTimes;
  genres: SkiddleEventGenreDetail[];
  entryprice: string;
  MinAge: string | number;
  going?: unknown[];
  imgoing?: number;
  goingtos?: number;
  artists?: Array<SkiddleEventArtistDetail | unknown>;
  ticketStatus?: string;
  tickets: boolean;
  paymentPlanTCs?: string | null;
  eventVisibility?: 'public' | 'private' | string;
  ticketUrl?: string;
  groupingid?: string;
  rep?: SkiddleEventRep;
  seatingPlanID?: string;
  healthAndSafety?: unknown[];
  [key: string]: unknown;
}

/**
 * Standard envelope for the single event API response.
 */
export interface SkiddleSingleEventApiResponse<T = SkiddleEventDetail> {
  error: number | string;
  totalcount: number;
  pagecount: number;
  results: T;
  requestId: string;
  [key: string]: unknown;
}

/**
 * Full execution result envelope for single event queries, including latency & debug traces.
 */
export interface SkiddleSingleEventExecutionResult<T = SkiddleEventDetail> {
  success: boolean;
  data: SkiddleSingleEventApiResponse<T>;
  conditionsSent: Record<string, string | number | boolean>;
  debugInfo?: DebugEntry[];
  executionTimeMs: number;
  resource: 'event-single' | string;
}

/**
 * Normalized ViewModel specifically structured for generating eFlyer promotional materials.
 */
export interface EFlyerPromotionData {
  eventId: string;
  listingId: string;
  eventName: string;
  description: string;
  heroImageUrl: string;
  thumbnailImageUrl: string;
  accentColor: string;
  skiddleUrl: string;
  eventDate: string;
  doorsOpen: string;
  doorsClose: string;
  lastEntry?: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venuePostcode: string;
  venuePhone?: string;
  venueLink?: string;
  entryPrice: string;
  minAge?: string;
  ticketsAvailable: boolean;
  ticketUrl?: string;
  genres: string[];
  isCancelled: boolean;
  cancellationReason?: string;
}

export interface SkiddleEvent {
  id: string | number;
  EventCode?: string;
  eventCode?: string;
  eventname?: string;
  eventName?: string;
  description: string;
  date: string;
  startdate?: string;
  startDate?: string;
  enddate?: string;
  endDate?: string;
  venue?: {
    id?: number | string;
    name?: string;
    address?: string;
    town?: string;
    postcode_lookup?: string;
    postcodeLookup?: string;
    postcode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    [key: string]: unknown;
  };
  openingtimes?: {
    doorsopen?: string;
    doorsclose?: string;
    lastentry?: string;
  };
  openingTimes?: {
    doorsOpen?: string;
    doorsClose?: string;
    lastEntry?: string;
  };
  minage?: number | string;
  MinAge?: number | string;
  entryprice?: string;
  entryPrice?: string;
  imageurl?: string;
  imageUrl?: string;
  largeimageurl?: string;
  largeImageUrl?: string;
  headerhex?: string;
  headerHex?: string;
  link?: string;
  artists?: Array<{
    artistid?: string;
    id?: string;
    name: string;
    imageurl?: string;
    imageUrl?: string;
    [key: string]: unknown;
  }>;
  genres?: Array<{
    name: string;
    id: string;
    [key: string]: unknown;
  }>;
  tickets?: boolean;
  ticketcount?: number;
  [key: string]: unknown;
}

export interface SkiddleVenue {
  id: string | number;
  name: string;
  address: string;
  town: string;
  postcode: string;
  country: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  rating?: number;
  imageurl?: string;
  [key: string]: unknown;
}

export interface SkiddleArtist {
  id: string | number;
  name: string;
  imageurl?: string;
  spotifyartisturl?: string;
  genres?: string[];
  [key: string]: unknown;
}

export type QueryConditions = Record<string, string | number | boolean | string[]>;
