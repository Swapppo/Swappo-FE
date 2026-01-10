/**
 * Shipping Service
 * Provides shipping rate estimates via Google Cloud Function
 */

import { ENV } from '../config/env.config';

export interface ShippingEstimateRequest {
  from_country?: string;
  to_country: string;
  to_city?: string;
  to_postal_code?: string;
  to_state?: string;
  weight_kg?: number;
}

export interface ShippingEstimate {
  cost: number;
  currency: string;
  courier: string;
}

export interface ShippingEstimateResponse {
  success: boolean;
  estimate?: ShippingEstimate;
  error?: string;
}

class ShippingService {
  private cloudFunctionUrl = ENV.SHIPPING_API_URL;

  /**
   * Get shipping cost estimate from Cloud Function
   */
  async estimateShippingCost(params: ShippingEstimateRequest): Promise<ShippingEstimate | null> {
    try {
      console.log('📦 Requesting shipping estimate via Cloud Function');

      const response = await fetch(this.cloudFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_country: params.from_country || 'US',
          to_country: params.to_country || 'US',
          to_city: params.to_city,
          to_postal_code: params.to_postal_code,
          to_state: params.to_state,
          weight_kg: params.weight_kg || 1.0,
        }),
      });

      if (!response.ok) {
        console.error('❌ Cloud Function error:', response.status);
        return null;
      }

      const data: ShippingEstimateResponse = await response.json();

      if (!data.success || !data.estimate) {
        console.error('❌ Cloud Function returned error:', data.error);
        return null;
      }

      console.log(`✅ Shipping estimate: $${data.estimate.cost} via ${data.estimate.courier}`);
      return data.estimate;
    } catch (error) {
      console.error('❌ Error calling shipping Cloud Function:', error);
      return null;
    }
  }
}

export const shippingService = new ShippingService();
