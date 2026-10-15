import { SkiddleBase } from './base.js';
import type { SkiddleApiResponse, SkiddleEvent } from './types.js';

/**
 * Handles operations against the Skiddle Events endpoints.
 * Mirrors SkiddleSDK\Events from the PHP SDK.
 */
export class Events extends SkiddleBase {
  public static readonly ENDPOINT = '/events/instant-search/';
  public static readonly SINGLE_ENDPOINT = '/events/';

  /**
   * Fetches event listings using the Skiddle API v3 instant-search endpoint.
   */
  public async getListings(): Promise<SkiddleApiResponse<SkiddleEvent[]>> {
    this.request.setApiVersion(3);
    return this.makeCall<SkiddleApiResponse<SkiddleEvent[]>>(Events.ENDPOINT);
  }

  /**
   * Fetches details for an individual event listing by ID.
   *
   * @param listingId The event / listing ID
   */
  public async getListing(listingId: string | number): Promise<SkiddleApiResponse<SkiddleEvent>> {
    this.request.setApiVersion(1);
    return this.makeCall<SkiddleApiResponse<SkiddleEvent>>(`${Events.SINGLE_ENDPOINT}${listingId}/`);
  }
}
