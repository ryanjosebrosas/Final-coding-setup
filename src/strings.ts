// String utility functions — Build Test Project
// This file will be populated by /build specs

/**
 * Reverses a string.
 * @param str - The string to reverse
 * @returns The reversed string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Truncates a string to maxLength and adds ellipsis if truncated.
 * @param str - The string to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns The truncated string with ellipsis, or original if fits
 */
export function truncate(str: string, maxLength: number): string {
  if (maxLength < 3) {
    return str.slice(0, maxLength);
  }
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}
