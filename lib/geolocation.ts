/**
 * Geolocation utilities for calculating distances between users
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km away`;
  } else {
    return `${Math.round(distanceKm)}km away`;
  }
}

/**
 * Parse comma-separated tags string into array
 * Handles hashtags with or without # prefix
 */
export function parseTags(tagsString: string): string[] {
  if (!tagsString || !tagsString.trim()) {
    return [];
  }

  return tagsString
    .split(",")
    .map((tag) => {
      // Remove whitespace and # if present, then add # back
      const cleaned = tag.trim().replace(/^#+/, "").toLowerCase();
      return cleaned ? `#${cleaned}` : "";
    })
    .filter((tag) => tag.length > 0)
    .slice(0, 20); // Max 20 tags
}

/**
 * Find common tags between two users
 */
export function findCommonTags(tags1: string[], tags2: string[]): string[] {
  const set1 = new Set(tags1.map((t) => t.toLowerCase()));
  return tags2.filter((tag) => set1.has(tag.toLowerCase()));
}

/**
 * Calculate tag match score (percentage of common tags)
 */
export function calculateTagMatchScore(
  tags1: string[],
  tags2: string[]
): number {
  if (tags1.length === 0 && tags2.length === 0) {
    return 0;
  }

  const commonTags = findCommonTags(tags1, tags2);
  const maxTags = Math.max(tags1.length, tags2.length, 1);
  return Math.round((commonTags.length / maxTags) * 100);
}


