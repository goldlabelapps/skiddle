'use server';

import { createClient, SkiddleException } from '@skiddle/sdk';

export interface QueryRequest {
  resource: 'events' | 'event-single' | 'venues' | 'artists';
  conditions: Record<string, string | number | boolean>;
  singleId?: string | number;
  apiKey?: string;
  devMode?: boolean;
}

export interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
  errorCode?: number;
  conditionsSent?: Record<string, string | number | boolean>;
  debugInfo?: any[];
  executionTimeMs: number;
  resource: string;
}

export async function checkServerConfig() {
  return {
    hasServerApiKey: Boolean(process.env.SKIDDLE_API_KEY),
  };
}

export async function executeSkiddleQuery(req: QueryRequest): Promise<QueryResult> {
  const startTime = Date.now();
  const apiKey = (req.apiKey && req.apiKey.trim().length > 0)
    ? req.apiKey.trim()
    : (process.env.SKIDDLE_API_KEY || '');

  if (!apiKey) {
    return {
      success: false,
      error: 'Skiddle API Key is not configured. Please provide an API key in the input field or set SKIDDLE_API_KEY in your environment.',
      errorCode: 401,
      executionTimeMs: Date.now() - startTime,
      resource: req.resource,
    };
  }

  try {
    const client = createClient({
      apiKey,
      devMode: req.devMode ?? true,
    });

    let data: any;
    let conditionsSent: Record<string, string | number | boolean> = {};
    let debugInfo: any[] = [];

    switch (req.resource) {
      case 'events': {
        for (const [key, val] of Object.entries(req.conditions)) {
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            client.events.addCond(key, val);
          }
        }
        conditionsSent = client.events.getConditions();
        data = await client.events.getListings();
        debugInfo = client.events.getDebugInfo();
        break;
      }

      case 'event-single': {
        const id = req.singleId || 42616476;
        data = await client.events.getListing(id);
        debugInfo = client.events.getDebugInfo();
        break;
      }

      case 'venues': {
        for (const [key, val] of Object.entries(req.conditions)) {
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            client.venues.addCond(key, val);
          }
        }
        conditionsSent = client.venues.getConditions();
        data = await client.venues.getListings();
        debugInfo = client.venues.getDebugInfo();
        break;
      }

      case 'artists': {
        for (const [key, val] of Object.entries(req.conditions)) {
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            client.artists.addCond(key, val);
          }
        }
        conditionsSent = client.artists.getConditions();
        data = await client.artists.getListings();
        debugInfo = client.artists.getDebugInfo();
        break;
      }

      default:
        throw new SkiddleException(`Unsupported resource: ${req.resource}`);
    }

    return {
      success: true,
      data,
      conditionsSent,
      debugInfo,
      executionTimeMs: Date.now() - startTime,
      resource: req.resource,
    };
  } catch (err: any) {
    const isSkiddleException = err instanceof SkiddleException;
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred during API execution.',
      errorCode: isSkiddleException ? err.code : 500,
      executionTimeMs: Date.now() - startTime,
      resource: req.resource,
    };
  }
}
