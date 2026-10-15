import { SkiddleBase } from './base.js';
import type { SkiddleApiResponse, SkiddleArtist } from './types.js';

/**
 * Handles operations against the Skiddle Artists endpoints.
 * Mirrors SkiddleSDK\Artists from the PHP SDK.
 */
export class Artists extends SkiddleBase {
  public static readonly ENDPOINT = '/artists/';

  /**
   * Fetches artist listings based on current query conditions.
   */
  public async getListings(): Promise<SkiddleApiResponse<SkiddleArtist[]>> {
    this.request.setApiVersion(1);
    return this.makeCall<SkiddleApiResponse<SkiddleArtist[]>>(Artists.ENDPOINT);
  }
}
