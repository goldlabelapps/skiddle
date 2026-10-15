import { SkiddleException } from './errors.js';
import { SkiddleRequest } from './request.js';
import { SkiddleSession } from './session.js';
import type { QueryConditions } from './types.js';

/**
 * Base class providing shared condition builders, session management,
 * and request forwarding across all Skiddle entities.
 * Mirrors SkiddleSDK\SkiddleBase from the PHP SDK.
 */
export class SkiddleBase {
  protected request: SkiddleRequest;
  protected session?: SkiddleSession;
  protected conditions: Record<string, string | number | boolean> = {};

  constructor(request?: SkiddleRequest) {
    this.request = request || new SkiddleRequest();
  }

  /**
   * Binds an authenticated session to this entity.
   */
  public setSession(session: SkiddleSession): this {
    if (!session || !(session instanceof SkiddleSession)) {
      throw new SkiddleException('Skiddle API Session not set correctly');
    }
    this.session = session;

    if (session.isDevMode()) {
      this.request.devMode = true;
    }
    return this;
  }

  /**
   * Adds a query condition to filter listings.
   * Arrays are automatically comma-separated (e.g. ['house', 'techno'] -> 'house,techno').
   */
  public addCond(key: string, val: string | number | boolean | string[]): this {
    if (Array.isArray(val)) {
      this.conditions[key] = val.join(',');
    } else {
      this.conditions[key] = val;
    }
    return this;
  }

  /**
   * Removes a previously registered query condition.
   * Throws if the condition does not exist (mirroring PHP SDK behavior).
   */
  public delCond(key: string): this {
    if (Object.prototype.hasOwnProperty.call(this.conditions, key)) {
      delete this.conditions[key];
    } else {
      throw new SkiddleException(`Trying to delete condition ${key}, but condition not found`);
    }
    return this;
  }

  /**
   * Resets all registered query conditions.
   */
  public clearCond(): this {
    this.conditions = {};
    return this;
  }

  /**
   * Retrieves the current conditions map.
   */
  public getConditions(): Record<string, string | number | boolean> {
    return { ...this.conditions };
  }

  /**
   * Legacy utility to normalize result keys for internal logging.
   * Kept for 1:1 parity with the PHP SDK.
   */
  public formatForLog(data: Array<Record<string, any>> = [], unset = false): Array<Record<string, any>> {
    const reformat: Record<string, string> = {
      promotorid: 'PromotorID',
      listingid: 'ListingID',
      eventname: 'EventName',
      description: 'EventDesc',
      cancelled: 'Cancelled',
      goingtocount: 'goingto',
      id: 'iListingInstance',
      date: 'iEventDate',
      tickets: 'ticketsAdded',
      minage: 'MinAge',
      entryprice: 'EntryPrice',
      promotorId: 'promotorID',
      listingId: 'ListingID',
      eventName: 'EventName',
      goingToCount: 'goingto',
      minAge: 'MinAge',
      entryPrice: 'EntryPrice',
      largeImageUrl: 'largeimageurl',
    };

    const reformatVenues: Record<string, string> = {
      name: 'Name',
      id: 'EntID',
      town: 'Town',
      postcode_lookup: 'postcode_lookup',
      postcodeLookup: 'postcode_lookup',
      currentranking: 'currentRanking',
      currentrankingmax: 'currentRankingMax',
    };

    const reformatTimes: Record<string, string> = {
      doorsopen: 'DoorsOpen',
      doorsclose: 'DoorsClose',
      doorsOpen: 'DoorsOpen',
      doorsClose: 'DoorsClose',
    };

    return data.map((item) => {
      const copy = { ...item };
      for (const [oldKey, newKey] of Object.entries(reformat)) {
        if (copy[oldKey] !== undefined) {
          copy[newKey] = copy[oldKey];
          if (unset) delete copy[oldKey];
        }
      }

      if (copy.venue && typeof copy.venue === 'object') {
        const venueCopy = { ...copy.venue };
        for (const [oldKey, newKey] of Object.entries(reformatVenues)) {
          if (venueCopy[oldKey] !== undefined) {
            copy[newKey] = venueCopy[oldKey];
            if (unset) delete venueCopy[oldKey];
          }
        }
        if (venueCopy.town) {
          copy.Town = venueCopy.town;
        }
        copy.venue = venueCopy;
      }

      if (copy.openingtimes && typeof copy.openingtimes === 'object') {
        for (const [oldKey, newKey] of Object.entries(reformatTimes)) {
          if (copy.openingtimes[oldKey] !== undefined) {
            copy[newKey] = copy.openingtimes[oldKey];
            if (unset) delete copy.openingtimes[oldKey];
          }
        }
      }

      return copy;
    });
  }

  /**
   * Executes the API call using the current conditions and session credentials.
   */
  protected async makeCall<T = unknown>(endpoint: string): Promise<T> {
    if (!this.session) {
      throw new SkiddleException('Skiddle API Session not set');
    }

    const args: Record<string, unknown> = { ...this.conditions };

    // API QUIRK: expects eventCode to be uppercase
    if (args.eventCode && typeof args.eventCode === 'string') {
      args.eventCode = args.eventCode.toUpperCase();
    }
    if (args.eventcode && typeof args.eventcode === 'string') {
      args.eventcode = args.eventcode.toUpperCase();
    }

    // Attach API key
    args.api_key = this.session.apiKey;

    return this.request.call<T>(endpoint, args);
  }

  public getDebugInfo() {
    return this.request.getDebugInfo();
  }
}
