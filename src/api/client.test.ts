import { describe, it, expect } from 'vitest';
import { getProperties, getProperty } from './client';
import { MOCK_PROPERTIES } from '../core/mock/properties';

describe('getProperties', () => {
  it('returns every property when no filters are given', async () => {
    const results = await getProperties();
    expect(results).toHaveLength(MOCK_PROPERTIES.length);
  });

  it('excludes properties below the minimum price', async () => {
    const results = await getProperties({ minPrice: 500_000 });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.price >= 500_000)).toBe(true);
  });

  it('excludes properties above the maximum price', async () => {
    const results = await getProperties({ maxPrice: 300_000 });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.price <= 300_000)).toBe(true);
  });

  it('treats the bedroom filter as a minimum, not an exact match', async () => {
    const results = await getProperties({ bedrooms: 3 });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.bedrooms >= 3)).toBe(true);
    expect(results.some((p) => p.bedrooms > 3)).toBe(true);
  });

  it('filters by property type exactly', async () => {
    const results = await getProperties({ propertyType: 'studio' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.propertyType === 'studio')).toBe(true);
  });

  it('returns only verified properties when verified-only is set', async () => {
    const results = await getProperties({ isVerifiedOnly: true });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.isVerified)).toBe(true);
  });

  it('matches location partially and ignores case', async () => {
    const results = await getProperties({ location: 'diobu' });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.location.toLowerCase().includes('diobu'))).toBe(true);
  });

  it('applies multiple filters together', async () => {
    const results = await getProperties({
      propertyType: 'apartment',
      isVerifiedOnly: true,
      maxPrice: 500_000,
    });

    expect(results.every((p) =>
      p.propertyType === 'apartment' && p.isVerified && p.price <= 500_000
    )).toBe(true);
  });

  it('returns an empty array when nothing matches, rather than throwing', async () => {
    const results = await getProperties({ minPrice: 99_000_000 });
    expect(results).toEqual([]);
  });
});

describe('getProperty', () => {
  it('returns the property with the given id', async () => {
    const result = await getProperty('1');
    expect(result?.id).toBe('1');
  });

  it('returns null for an id that does not exist', async () => {
    const result = await getProperty('does-not-exist');
    expect(result).toBeNull();
  });
});
