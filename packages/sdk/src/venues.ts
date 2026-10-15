import { SkiddleBase } from './base.js';
import type { SkiddleApiResponse, SkiddleVenue } from './types.js';

/**
 * Handles operations against the Skiddle Venues endpoints.
 * Mirrors SkiddleSDK\Venues from the PHP SDK.
 */
export class Venues extends SkiddleBase {
  public static readonly ENDPOINT = '/venues/';

  /**
   * Fetches venue listings based on current query conditions.
   */
  public async getListings(): Promise<SkiddleApiResponse<SkiddleVenue[]>> {
    this.request.setApiVersion(1);
    return this.makeCall<SkiddleApiResponse<SkiddleVenue[]>>(Venues.ENDPOINT);
  }
}
