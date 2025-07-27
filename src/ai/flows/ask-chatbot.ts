'use server';

/**
 * @fileOverview A chatbot flow that provides financial recommendations based on receipt data.
 *
 * - askChatbot - A function that handles the chatbot interaction.
 * - AskChatbotInput - The input type for the askChatbot function.
 * - AskChatbotOutput - The return type for the askChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AskChatbotInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe('The chat history.'),
  receipts: z
    .array(z.any())
    .describe('A list of all the user\'s receipts.'),
});
export type AskChatbotInput = z.infer<typeof AskChatbotInputSchema>;

export type AskChatbotOutput = AsyncGenerator<string>;

export async function* askChatbot({ history, receipts }: AskChatbotInput): AskChatbotOutput {
    const prompt = `You are a friendly and helpful financial assistant for an application called "Project Raseed".
Your goal is to provide users with insightful recommendations based on their spending data from receipts.

You have access to the user's entire receipt history. Use this data to answer their questions and provide proactive advice.

Here are some examples of how you can help:
- "How much did I spend on groceries last month?"
- "What was my most expensive purchase recently?"
- "Are there any warranties expiring soon?"
- "Can you give me some tips to save money on dining out?"

Analyze the user's message and the provided receipt data to formulate a helpful and relevant response.
Keep your answers concise and easy to understand.

Here is the user's receipt data as a JSON object:
${JSON.stringify(receipts)}

And here is the current conversation history:
${history.map(m => `- ${m.role}: ${m.content}`).join('\n')}
`;

    const { stream } = ai.generate({
      prompt,
      history,
      stream: true,
    });

    for await (const chunk of stream) {
      yield chunk.text ?? '';
    }
}
