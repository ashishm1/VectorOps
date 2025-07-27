// src/ai/flows/detect-warranty.ts
'use server';

/**
 * @fileOverview Detects the presence of a warranty for items in a receipt.
 *
 * - detectWarranty - A function that detects warranty presence from receipt item descriptions.
 * - DetectWarrantyInput - The input type for the detectWarranty function.
 * - DetectWarrantyOutput - The return type for the detectWarranty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectWarrantyInputSchema = z.object({
  itemDescription: z.string().describe('The description of the item from the receipt.'),
});
export type DetectWarrantyInput = z.infer<typeof DetectWarrantyInputSchema>;

const DetectWarrantyOutputSchema = z.object({
  hasWarranty: z.boolean().describe('Whether the item likely has a warranty.'),
  reason: z.string().optional().describe('The reason for the warranty detection, if any.'),
  warrantyLengthDays: z.number().optional().describe('The estimated warranty length in days, if applicable.'),
});
export type DetectWarrantyOutput = z.infer<typeof DetectWarrantyOutputSchema>;

export async function detectWarranty(input: DetectWarrantyInput): Promise<DetectWarrantyOutput> {
  return detectWarrantyFlow(input);
}

const detectWarrantyPrompt = ai.definePrompt({
  name: 'detectWarrantyPrompt',
  input: {schema: DetectWarrantyInputSchema},
  output: {schema: DetectWarrantyOutputSchema},
  prompt: `You are an AI assistant that analyzes item descriptions from receipts to determine if the item likely has a warranty.
  Focus on identifying electronics, appliances, and other high-value items that typically come with a manufacturer's warranty.

  Given the item description, determine if the item is likely to have a warranty.
  - If it is an electronic item (e.g., "Smartphone", "Laptop", "TV", "Headphones"), assume a 1-year (365 days) warranty.
  - If it's a major appliance, assume a 2-year (730 days) warranty.
  - For other items, if a warranty is not typical, hasWarranty should be false.

  Return a JSON object with a "hasWarranty" boolean field, a "reason" field explaining your determination, and "warrantyLengthDays" if a warranty is detected.

  Item Description: {{{itemDescription}}}
  `,
});

const detectWarrantyFlow = ai.defineFlow(
  {
    name: 'detectWarrantyFlow',
    inputSchema: DetectWarrantyInputSchema,
    outputSchema: DetectWarrantyOutputSchema,
  },
  async input => {
    const {output} = await detectWarrantyPrompt(input);
    return output!;
  }
);
