/**
 * Strips HTML tags and decodes common HTML entities for display in canvas / text clips and metadata.
 * Pure isomorphic function safe for use in both Server Components and Client Components.
 */
export function cleanDescription(desc?: string): string {
  if (!desc) return '';
  return desc
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&pound;/g, '£')
    .replace(/&euro;/g, '€')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
