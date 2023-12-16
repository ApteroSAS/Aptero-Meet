/**
 * Replaces the specified protocol in a URL with 'https:' and ensures the URL uses HTTPS.
 * It corrects the URL if it accidentally gets duplicated protocols due to replacement.
 * 
 * @param {string} url - The URL to be processed.
 * @param {string} protocolArgument - The protocol to be replaced in the URL.
 * @returns {string} The URL with the specified protocol replaced by 'https:' and ensuring
 *          it uses a single 'https://' protocol.
 *
 * @example
 * // returns 'https://example.com'
 * cleanProtocol('http://example.com', 'ftp://');
 *
 * @example
 * // returns 'https://example.com'
 * cleanProtocol('ftp://example.com', 'ftp://');
 */
export function cleanProtocol(url: string, protocolArgument: string): string {
  url = url.replace(protocolArgument, "https:");
  url = url.replace("http://", "https://");
  url = url.replace("https://https://", "https://"); //Avoid duplicates!
  return url;
}