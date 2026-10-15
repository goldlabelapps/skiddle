import { SkiddleException } from './errors.js';
import type { SkiddleRequestOptions } from './types.js';

export interface DebugEntry {
  timestamp: string;
  url: string;
  method: string;
  durationMs: number;
  status: number;
  headers: Record<string, string>;
  responseSnippet: string;
}

/**
 * Handles HTTP transport, URL construction, query parameter serialization,
 * API version routing, and error decoding for the Skiddle API.
 * Mirrors SkiddleSDK\SkiddleRequest from the PHP SDK.
 */
export class SkiddleRequest {
  public static readonly API_URL = 'https://www.skiddle.com/api/';
  public static readonly API_VER = 'v1';
  public static readonly API_V3_URL = 'https://api.skiddle.com/v3';

  public devMode: boolean = false;
  public apiVersion: number = 1;
  public debugLog: DebugEntry[] = [];

  // Optional custom fetch for testing / server environments
  private fetchFn: typeof fetch;

  constructor(customFetch?: typeof fetch) {
    this.fetchFn = customFetch || globalThis.fetch?.bind(globalThis);
  }

  public setApiVersion(version: number): void {
    this.apiVersion = version;
  }

  public getApiVersion(): number {
    return this.apiVersion;
  }

  /**
   * Updates casing of query keys for API v3 compatibility.
   * Mirrors PHP transformRequestKeys(): 'api_key' => 'apiKey'
   */
  public transformRequestKeys(requestData: Record<string, unknown>): Record<string, unknown> {
    const renameKeys: Record<string, string> = {
      api_key: 'apiKey',
    };

    const newArgs: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(requestData)) {
      const targetKey = renameKeys[key] || key;
      newArgs[targetKey] = val;
    }
    return newArgs;
  }

  /**
   * Executes an HTTP request to the Skiddle API.
   *
   * @param endpoint The API node (e.g. '/events/instant-search/' or '/venues/')
   * @param args Query parameters / payload
   * @param options Additional headers, method, timeout
   */
  public async call<T = unknown>(
    endpoint: string,
    args: Record<string, unknown> = {},
    options: SkiddleRequestOptions = {}
  ): Promise<T> {
    if (!endpoint) {
      throw new SkiddleException('API Endpoint not set');
    }

    if (!this.fetchFn) {
      throw new SkiddleException('Native fetch is not available in this environment');
    }

    let processedArgs = { ...args };
    let baseUrl: string;

    if (this.apiVersion === 3) {
      baseUrl = SkiddleRequest.API_V3_URL;
      processedArgs = this.transformRequestKeys(processedArgs);
    } else {
      baseUrl = `${SkiddleRequest.API_URL}${SkiddleRequest.API_VER}`;
    }

    // Ensure endpoint has leading slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${normalizedEndpoint}`);

    // Append query parameters
    const method = options.method || 'GET';
    if (method === 'GET') {
      for (const [key, val] of Object.entries(processedArgs)) {
        if (val !== undefined && val !== null) {
          url.searchParams.set(key, String(val));
        }
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };

    const startTime = Date.now();
    const maskedUrl = this.maskApiKey(url.toString(), processedArgs.apiKey || processedArgs.api_key);

    let response: Response;
    try {
      response = await this.fetchFn(url.toString(), {
        method,
        headers,
      });
    } catch (err) {
      throw new SkiddleException(`Network transport error: ${(err as Error).message}`);
    }

    const durationMs = Date.now() - startTime;
    const rawBody = await response.text();

    if (this.devMode) {
      this.debugLog.push({
        timestamp: new Date().toISOString(),
        url: maskedUrl,
        method,
        durationMs,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        responseSnippet: rawBody.slice(0, 500),
      });
    }

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = JSON.parse(rawBody);
      } catch {
        // Non-JSON response
      }

      if (errorBody && errorBody.errormessage !== undefined) {
        // API v1 format
        throw new SkiddleException(errorBody.errormessage, Number(errorBody.error) || response.status, errorBody);
      } else if (errorBody && errorBody.detail !== undefined) {
        // API v3 format
        throw new SkiddleException(errorBody.detail, Number(errorBody.status) || response.status, errorBody);
      } else {
        throw new SkiddleException(`An unknown error occurred - ${rawBody} - ${response.status}`, response.status);
      }
    }

    try {
      return JSON.parse(rawBody) as T;
    } catch {
      throw new SkiddleException('Error parsing server response');
    }
  }

  public getDebugInfo(): DebugEntry[] {
    return this.debugLog;
  }

  public clearDebugInfo(): void {
    this.debugLog = [];
  }

  private maskApiKey(urlString: string, key?: unknown): string {
    if (!key || typeof key !== 'string') return urlString;
    return urlString.replaceAll(key, 'xxxxxxxxxxxxxxxxxx');
  }
}
