'use server';
/**
 * @fileOverview A tool for currency conversion.
 *
 * - convertCurrency - A function that converts an amount from one currency to another.
 * - ConvertCurrencyInput - The input type for the convertCurrency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// A map of approximate conversion rates to INR for demonstration purposes.
// In a real application, you would use an API to get real-time rates.
const conversionRatesToINR: Record<string, number> = {
  USD: 83.5,
  EUR: 90.2,
  GBP: 106.1,
  JPY: 0.53,
  AUD: 55.4,
  CAD: 61.2,
};

const ConvertCurrencyInputSchema = z.object({
  amount: z.number().describe('The amount of money to convert.'),
  fromCurrency: z.string().describe('The currency to convert from (e.g., USD).'),
  toCurrency: z.string().describe('The currency to convert to (e.g., INR).'),
});
export type ConvertCurrencyInput = z.infer<typeof ConvertCurrencyInputSchema>;

export const convertCurrency = ai.defineTool(
  {
    name: 'convertCurrency',
    description: 'Converts an amount from one currency to another.',
    inputSchema: ConvertCurrencyInputSchema,
    outputSchema: z.number(),
  },
  async ({amount, fromCurrency, toCurrency}) => {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    if (toCurrency !== 'INR') {
      throw new Error('This tool can only convert to INR.');
    }

    const rate = conversionRatesToINR[fromCurrency.toUpperCase()];
    if (!rate) {
      // If no rate is found, return the original amount as a fallback.
      // A real app might throw an error or handle this differently.
      console.warn(`No conversion rate found for ${fromCurrency}. Returning original amount.`);
      return amount;
    }

    return amount * rate;
  }
);
