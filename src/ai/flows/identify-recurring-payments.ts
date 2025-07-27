
'use server';

/**
 * @fileOverview A Genkit flow for identifying recurring payments from a user's receipt history.
 *
 * - identifyRecurringPayments - Analyzes receipts to find subscriptions and regular bills.
 * - IdentifyRecurringPaymentsInput - The input type for the function.
 * - IdentifyRecurringPaymentsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Receipt } from '@/lib/types';

const RecurringPaymentSchema = z.object({
  id: z.string().describe("A unique identifier for the payment (e.g., 'netflix-subscription')."),
  merchantName: z.string().describe('The name of the merchant or service provider.'),
  estimatedAmount: z.number().describe('The typical amount for this recurring payment.'),
  nextDueDate: z.string().describe('The estimated next due date for the payment in YYYY-MM-DD format.'),
  status: z.enum(['paid', 'unpaid']).describe('The payment status for the current billing cycle.'),
});
export type RecurringPayment = z.infer<typeof RecurringPaymentSchema>;

const IdentifyRecurringPaymentsInputSchema = z.object({
  receipts: z
    .array(z.any())
    .describe("A list of all the user's receipts."),
});
export type IdentifyRecurringPaymentsInput = z.infer<typeof IdentifyRecurringPaymentsInputSchema>;

const IdentifyRecurringPaymentsOutputSchema = z.object({
  payments: z
    .array(RecurringPaymentSchema)
    .describe('A list of identified recurring payments.'),
});
export type IdentifyRecurringPaymentsOutput = z.infer<typeof IdentifyRecurringPaymentsOutputSchema>;

export async function identifyRecurringPayments(
  input: IdentifyRecurringPaymentsInput
): Promise<IdentifyRecurringPaymentsOutput> {
  // Add today's date to the input for the AI to use as a reference
  const today = new Date().toISOString().split('T')[0];
  const enrichedInput = { ...input, today };
  
  return identifyRecurringPaymentsFlow(enrichedInput);
}

const prompt = ai.definePrompt({
  name: 'identifyRecurringPaymentsPrompt',
  input: { schema: IdentifyRecurringPaymentsInputSchema.extend({ today: z.string() }) },
  output: { schema: IdentifyRecurringPaymentsOutputSchema },
  prompt: `You are an expert financial analyst. Your task is to identify recurring monthly payments from a user's receipt history. This includes subscriptions and regular bills.

  Analyze the provided list of receipts. Look for transactions with the same or very similar merchant names that occur at roughly monthly intervals (25-35 days apart). Small variations in the amount are acceptable, especially for utility bills.

  Pay close attention to these types of recurring payments:
  - **Entertainment Subscriptions:** Look for merchants like 'Netflix', 'Spotify', 'Amazon Prime', 'Disney+', etc.
  - **Utility Bills:** Look for 'electricity', 'telephone', 'internet', or 'gas' in merchant names or line items.
  - **Regular Medicine Purchases:** Look for pharmacies or health stores with consistent monthly purchases.
  - **Other Regular Bills:** This could include rent, insurance premiums, or loan payments.

  For each recurring payment you identify:
  1. Determine the merchant name.
  2. Calculate the average or most common transaction amount. This is the estimatedAmount.
  3. Based on the last payment date, estimate the next due date. Assume a monthly cycle. For example, if the last payment was on Jan 15th, the next due date is Feb 15th.
  4. Check if a payment for this merchant has already been made in the current billing cycle relative to today's date ({{{today}}}). If a payment is found within the last ~30 days, the status is 'paid'. Otherwise, it's 'unpaid'.
  5. Create a unique ID for the subscription based on the merchant name (e.g., 'netflix-subscription').

  Here is the user's receipt history:
  {{{json receipts}}}

  Today's date is: {{{today}}}

  Return your findings as a JSON object containing a "payments" array. Only include payments that appear to be genuinely recurring (at least two occurrences).
  `,
});

const identifyRecurringPaymentsFlow = ai.defineFlow(
  {
    name: 'identifyRecurringPaymentsFlow',
    inputSchema: IdentifyRecurringPaymentsInputSchema.extend({ today: z.string() }),
    outputSchema: IdentifyRecurringPaymentsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    // Sort payments by next due date
    if (output?.payments) {
      output.payments.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    }
    
    return output!;
  }
);
