'use server';

/**
 * @fileOverview A Genkit flow for generating actionable financial insights for a user.
 *
 * - generateActionableInsights - A function that generates personalized tips based on spending.
 * - GenerateActionableInsightsInput - The input type for the function.
 * - GenerateActionableInsightsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActionableInsightsInputSchema = z.object({
  receipts: z
    .array(z.any())
    .describe("A list of all the user's receipts for the past few months."),
  quotas: z
    .record(z.number())
    .describe(
      'A map of spending categories to their monthly quota amounts.'
    ),
});
export type GenerateActionableInsightsInput = z.infer<
  typeof GenerateActionableInsightsInputSchema
>;

const GenerateActionableInsightsOutputSchema = z.object({
  insights: z
    .array(
      z
        .string()
        .describe(
          'A short, actionable, and personalized financial insight for the user. Max 3-4 insights.'
        )
    )
    .describe('A list of insights.'),
});
export type GenerateActionableInsightsOutput = z.infer<
  typeof GenerateActionableInsightsOutputSchema
>;

export async function generateActionableInsights(
  input: GenerateActionableInsightsInput
): Promise<GenerateActionableInsightsOutput> {
  return generateActionableInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionableInsightsPrompt',
  input: {schema: GenerateActionableInsightsInputSchema},
  output: {schema: GenerateActionableInsightsOutputSchema},
  prompt: `You are a friendly and insightful financial assistant for an application called "Project Raseed". Your goal is to provide users with smart, actionable, and personalized insights to help them improve their financial habits.

You will be given the user's recent receipt history and their self-defined spending quotas for various categories.

Analyze this data to identify key spending patterns, areas of over-utilization, and opportunities for savings.

Based on your analysis, generate a list of 3 to 4 short, actionable insights. Each insight should be a single, concise sentence. Frame the insights in a helpful and encouraging tone.

Here is the data:
- User's Quotas: {{{json quotas}}}
- User's Receipts: {{{json receipts}}}

Example Insights:
- "You're doing great on your 'Shopping' budget! Maybe allocate some of that savings to your 'Travel' goal?"
- "Your 'Restaurant' spending is a bit over budget. Trying cooking at home a few more times this month could help."
- "You've spent ₹1500 on coffee this month. Making coffee at home on weekdays could save you over ₹1000."

Your response must be a valid JSON object with an "insights" array.`,
});

const generateActionableInsightsFlow = ai.defineFlow(
  {
    name: 'generateActionableInsightsFlow',
    inputSchema: GenerateActionableInsightsInputSchema,
    outputSchema: GenerateActionableInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
