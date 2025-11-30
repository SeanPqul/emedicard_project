import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

export type PaymentMethod = 'Maya' | 'BaranggayHall' | 'CityHall';

export interface PricingConfig {
  baseFee: number;
  serviceFee: number;
  totalFee: number;
  currency: string;
  isLoading: boolean;
}

/**
 * Hook to fetch dynamic pricing configuration
 *
 * @param paymentMethod - The payment method to get pricing for (defaults to 'Maya')
 * @returns Pricing configuration with base fee, service fee, and total
 */
export function usePricing(paymentMethod: PaymentMethod = 'Maya'): PricingConfig {
  const pricingConfig = useQuery(api.pricingConfig.index.getActivePricing);

  // Default fallback values if fetch fails or is loading
  // These match the previous hardcoded values to ensure stability during transition
  const baseFee = pricingConfig?.baseFee?.amount ?? 50;

  // Get service fee based on selected payment method
  const serviceFee = pricingConfig?.serviceFees?.[paymentMethod]?.amount ?? 10;

  return {
    baseFee,
    serviceFee,
    totalFee: baseFee + serviceFee,
    currency: 'PHP',
    isLoading: pricingConfig === undefined,
  };
}
