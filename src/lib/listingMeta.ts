/**
 * Parse structured metadata embedded in listing descriptions.
 * Format: <!--META:{...json...}:META-->
 */

export interface ListingMeta {
  // Hotel / Property
  propertyType?: string;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
  cancellation?: string;
  address?: string;
  stars?: number;
  rules?: string;
  // Car
  carType?: string;
  carYear?: number;
  transmission?: string;
  fuel?: string;
  seats?: number;
}

const META_REGEX = /<!--META:(.*?):META-->/s;

export function parseListingMeta(description?: string | null): { text: string; meta: ListingMeta | null } {
  if (!description) return { text: "", meta: null };
  const match = description.match(META_REGEX);
  if (!match) return { text: description, meta: null };
  const text = description.replace(META_REGEX, "").trim();
  try {
    const meta = JSON.parse(match[1]) as ListingMeta;
    return { text, meta };
  } catch {
    return { text: description, meta: null };
  }
}

export const AMENITY_LABELS: Record<string, string> = {
  wifi: "Free WiFi",
  parking: "Parking",
  pool: "Pool",
  ac: "Air Conditioning",
  restaurant: "Restaurant",
  tv: "Smart TV",
  balcony: "Balcony",
  bathroom: "Private Bathroom",
  view: "Scenic View",
  breakfast: "Breakfast",
  security: "24/7 Security",
  kitchen: "Kitchen",
};

export const HOTEL_CATEGORIES = ["hotels & stays", "house rental", "house for sale"];
export const CAR_CATEGORIES = ["car rental"];

export function isHotelListing(category?: string | null): boolean {
  return HOTEL_CATEGORIES.includes((category || "").toLowerCase());
}

export function isCarListing(category?: string | null): boolean {
  return CAR_CATEGORIES.includes((category || "").toLowerCase());
}
