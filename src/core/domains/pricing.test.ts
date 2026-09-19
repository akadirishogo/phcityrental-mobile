import { describe, it, expect } from 'vitest';
import { getPriceBreakdown, getBreakdownTotal, formatNaira } from './pricing';
import { MOCK_PROPERTIES } from '../mock/properties';
import type { Property } from '../types';

const property: Property = MOCK_PROPERTIES[0];

describe('getPriceBreakdown', () => {
  it('returns base rent, service charge and agency fee', () => {
    const lines = getPriceBreakdown(property);

    expect(lines).toHaveLength(3);
    expect(lines.map((line) => line.label)).toEqual([
      'Base rent',
      'Service charge',
      'Agency fee',
    ]);
  });

  it('takes its amounts from the property, not from a calculation', () => {
    const lines = getPriceBreakdown(property);

    expect(lines[0].amount).toBe(property.price);
    expect(lines[1].amount).toBe(property.serviceCharge);
    expect(lines[2].amount).toBe(property.agencyFee);
  });
});

describe('getBreakdownTotal', () => {
  it('equals the sum of the displayed lines', () => {
    const lines = getPriceBreakdown(property);
    const summed = lines.reduce((total, line) => total + line.amount, 0);

    expect(getBreakdownTotal(property)).toBe(summed);
  });

  it('matches the stated all-inclusive price for every property', () => {
    for (const p of MOCK_PROPERTIES) {
      expect(getBreakdownTotal(p)).toBe(p.allInclusivePrice);
    }
  });
});

describe('formatNaira', () => {
  it('formats with the naira symbol and thousands separators', () => {
    expect(formatNaira(658560)).toBe('₦658,560');
  });

  it('handles zero', () => {
    expect(formatNaira(0)).toBe('₦0');
  });
});
