export type PropertyType = 'apartment' | 'house' | 'studio';

export interface Property {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number; // base price
    allInclusivePrice: number; // price + serviceCharge + agencyFee
    serviceCharge: number;
    agencyFee: number;
    bedrooms: number;
    bathrooms: number;
    propertyType: PropertyType;
    isVerified: boolean;
    images: string[]; // array of image URLs
    amenities: string[]; // e.g., ["WiFi", "Kitchen", "AC"]
    agentName: string;
    agentPhone: string;
    agentEmail: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }


  export interface SearchFilters {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    propertyType?: PropertyType;
    isVerifiedOnly?: boolean;
  }
  
  export interface SavedProperty {
    propertyId: string;
    savedAt: string; // ISO date string
  }