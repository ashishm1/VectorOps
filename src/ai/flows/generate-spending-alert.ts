
'use server';

/**
 * @fileOverview A Genkit flow for generating smart alerts when a user is close to or has exceeded their spending quota for a category.
 *
 * - generateSpendingAlert - A function that generates a personalized and actionable alert message.
 * - GenerateSpendingAlertInput - The input type for the generateSpendingAlert function.
 * - GenerateSpendingAlertOutput - The return type for the generateSpendingAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpendingAlertInputSchema = z.object({
  category: z.string().describe('The spending category for the alert (e.g., Dining, Shopping).'),
  currentSpend: z.number().describe('The user\'s current total spend in the category for the month.'),
  quota: z.number().describe('The user\'s monthly spending quota for the category.'),
  alertType: z.enum(['warning', 'exceeded']).describe('The type of alert to generate.'),
  allReceipts: z.array(z.any()).optional().describe('A list of all the user\'s receipts for additional context.'),
});
export type GenerateSpendingAlertInput = z.infer<typeof GenerateSpendingAlertInputSchema>;

const GenerateSpendingAlertOutputSchema = z.object({
  title: z.string().describe('The title of the alert notification.'),
  message: z.string().describe('The detailed, personalized, and actionable alert message.'),
});
export type GenerateSpendingAlertOutput = z.infer<typeof GenerateSpendingAlertOutputSchema>;

export async function generateSpendingAlert(input: GenerateSpendingAlertInput): Promise<GenerateSpendingAlertOutput> {
  return generateSpendingAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpendingAlertPrompt',
  input: {schema: GenerateSpendingAlertInputSchema},
  output: {schema: GenerateSpendingAlertOutputSchema},
  prompt: `You are a helpful and insightful financial assistant for an application called "Project Raseed". Your primary goal is to provide users with smart, actionable alerts to help them manage their spending and stay within their budget.

You will be given the user's current spending situation for a specific category, the type of alert to generate, and their entire receipt history for context.

Current Situation:
- Category: {{{category}}}
- Monthly Quota: ₹{{{quota}}}
- Current Spend: ₹{{{currentSpend}}}
- Alert Type: {{{alertType}}}

{{#if allReceipts}}
User's Full Receipt History (for context on spending patterns):
{{{json allReceipts}}}
{{/if}}

Please generate a JSON object with a "title" and a "message" for the alert.

- If the alertType is 'warning' (triggered at 80% of quota):
  - The tone should be a friendly and proactive "heads-up".
  - The title should be clear, like "Heads-up: Nearing Your [Category] Budget".
  - The message must summarize the situation (e.g., "You've spent X% of your budget with Y days left").
  - **Crucially, you must provide a concise, context-aware suggestion based on their recent spending patterns in that category from the provided receipt history.** For example, if you see many small coffee shop purchases, suggest making coffee at home. If you see frequent food delivery orders, suggest cooking a few meals. Be specific and actionable.

- If the alertType is 'exceeded':
  - The tone should be more direct but supportive, not alarming.
  - The title should be direct, like "Alert: [Category] Budget Exceeded".
  - The message must clearly state that the budget has been exceeded and by how much.
  - **The most important part is to suggest a specific rebalancing action.** Analyze the user's full receipt history to identify another category where they have likely underspent relative to a typical month. Suggest they could rebalance from there. For example: "You still have budget left in your Shopping category. Consider rebalancing to cover the overspend." Be specific, data-driven, and helpful.

Your response must be a valid JSON object with a "title" and a "message".
`,
});

const generateSpendingAlertFlow = ai.defineFlow(
  {
    name: 'generateSpendingAlertFlow',
    inputSchema: GenerateSpendingAlertInputSchema,
    outputSchema: GenerateSpendingAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
