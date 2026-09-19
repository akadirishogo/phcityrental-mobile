import type { Property, SearchFilters } from '../core/types';
import { MOCK_PROPERTIES } from '../core/mock/properties';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all properties
export async function getProperties(filters?: SearchFilters): Promise<Property[]> {
  await delay(300);
   // Simulate network
  
   if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('simulateError')) {
    throw new Error('Unable to reach the property service');
  }


  let results = MOCK_PROPERTIES;
  
  if (filters) {
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.bedrooms !== undefined) {
      results = results.filter(p => p.bedrooms >= filters.bedrooms!);
    }
    if (filters.propertyType) {
      results = results.filter(p => p.propertyType === filters.propertyType);
    }
    if (filters.isVerifiedOnly) {
      results = results.filter(p => p.isVerified);
    }
    if (filters.location) {
      results = results.filter(p => 
        p.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
  }
  
  return results;
}

// Get single property by ID
export async function getProperty(id: string): Promise<Property | null> {
  await delay(200);
  return MOCK_PROPERTIES.find(p => p.id === id) || null;
}
