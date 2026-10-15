import { SkiddleException } from './errors.js';
import type { SkiddleSessionConfig } from './types.js';

/**
 * Handles authentication and global configuration for Skiddle API calls.
 * Mirrors SkiddleSDK\SkiddleSession from the PHP SDK.
 */
export class SkiddleSession {
  public static readonly API_KEY_ENV_NAME = 'SKIDDLE_API_KEY';

  public apiKey: string;
  public devMode: boolean;

  constructor(config: SkiddleSessionConfig = {}) {
    const envKey = typeof process !== 'undefined' && process.env ? process.env[SkiddleSession.API_KEY_ENV_NAME] : undefined;
    const resolvedKey = config.apiKey || envKey;

    if (!resolvedKey) {
      throw new SkiddleException('API Key is missing');
    }

    this.apiKey = resolvedKey;
    this.devMode = Boolean(config.devMode);
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public isDevMode(): boolean {
    return this.devMode;
  }

  public setDevMode(mode: boolean): void {
    this.devMode = Boolean(mode);
  }
}
