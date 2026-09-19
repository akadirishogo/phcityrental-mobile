import type { Property } from '../types';

export interface PriceLine {
  label: string;
  amount: number;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function getPriceBreakdown(property: Property): PriceLine[] {
  return [
    { label: 'Base rent', amount: property.price },
    { label: 'Service charge', amount: property.serviceCharge },
    { label: 'Agency fee', amount: property.agencyFee },
  ];
}

export function getBreakdownTotal(property: Property): number {
  return getPriceBreakdown(property).reduce((total, line) => total + line.amount, 0);
}
