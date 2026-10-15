/**
 * Skiddle SDK for JavaScript & TypeScript
 * Modern port of the Skiddle PHP SDK
 */

export * from './types.js';
export * from './errors.js';
export * from './session.js';
export * from './request.js';
export * from './base.js';
export * from './events.js';
export * from './artists.js';
export * from './venues.js';

import { SkiddleSession } from './session.js';
import { Events } from './events.js';
import { Artists } from './artists.js';
import { Venues } from './venues.js';
import type { SkiddleSessionConfig } from './types.js';

/**
 * Convenience factory to create pre-configured entity instances.
 *
 * @example
 * ```ts
 * import { createClient } from 'skiddle-sdk';
 *
 * const client = createClient({ apiKey: 'YOUR_KEY' });
 * client.events.addCond('keyword', 'Warehouse Project');
 * const results = await client.events.getListings();
 * ```
 */
export function createClient(config: SkiddleSessionConfig = {}) {
  const session = new SkiddleSession(config);

  const events = new Events();
  events.setSession(session);

  const artists = new Artists();
  artists.setSession(session);

  const venues = new Venues();
  venues.setSession(session);

  return {
    session,
    events,
    artists,
    venues,
  };
}
