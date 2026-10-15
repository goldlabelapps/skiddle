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

export interface SkiddleApiResponse<T = unknown> {
  error: number | string;
  totalresults?: number;
  page?: number;
  pagecount?: number;
  results: T;
  [key: string]: unknown;
}

export interface SkiddleEvent {
  id: string;
  EventCode?: string;
  eventname: string;
  description: string;
  date: string;
  startdate: string;
  enddate?: string;
  venue: {
    id: number | string;
    name: string;
    address: string;
    town: string;
    postcode_lookup?: string;
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
  minage?: number | string;
  entryprice?: string;
  imageurl?: string;
  largeimageurl?: string;
  link?: string;
  artists?: Array<{
    artistid: string;
    name: string;
    imageurl?: string;
  }>;
  genres?: Array<{
    name: string;
    id: string;
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
