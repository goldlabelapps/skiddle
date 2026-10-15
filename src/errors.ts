/**
 * Custom error thrown by the Skiddle SDK
 * Directly corresponds to SkiddleSDK\SkiddleException in the PHP SDK.
 */
export class SkiddleException extends Error {
  public readonly code: number;
  public readonly details?: unknown;

  constructor(message: string, code: number = 0, details?: unknown) {
    super(message);
    this.name = 'SkiddleException';
    this.code = code;
    this.details = details;

    // Restore prototype chain for instanceof checks across transpilation targets
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
