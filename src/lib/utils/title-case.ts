/**
 * Converts a string to title case (first letter of each word capitalized)
 * @param str The string to convert
 * @returns The title case string
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts enum strings (like USER_ROLE) to readable title case
 * @param str The enum string to convert
 * @returns The readable title case string
 */
export function toReadableTitle(str: string): string {
  if (!str) return str;
  
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}