'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized notifications
 * about financial events like expiring warranties or unusual spending. It exports the
 * `generatePersonalizedNotification` function, along with its input and output types.
 *
 * - generatePersonalizedNotification - A function that generates a personalized notification message.
 * - GeneratePersonalizedNotificationInput - The input type for the generatePersonalizedNotification function.
 * - GeneratePersonalizedNotificationOutput - The return type for the generatePersonalizedNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedNotificationInputSchema = z.object({
  userId: z.string().describe('The ID of the user to generate the notification for.'),
  eventDescription: z.string().describe('Description of the event triggering the notification (e.g., warranty expiring, unusual spending).'),
  eventDetails: z.string().optional().describe('Details of the event.'),
});
export type GeneratePersonalizedNotificationInput = z.infer<typeof GeneratePersonalizedNotificationInputSchema>;

const GeneratePersonalizedNotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The personalized notification message to send to the user.'),
});
export type GeneratePersonalizedNotificationOutput = z.infer<typeof GeneratePersonalizedNotificationOutputSchema>;

export async function generatePersonalizedNotification(input: GeneratePersonalizedNotificationInput): Promise<GeneratePersonalizedNotificationOutput> {
  return generatePersonalizedNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedNotificationPrompt',
  input: {schema: GeneratePersonalizedNotificationInputSchema},
  output: {schema: GeneratePersonalizedNotificationOutputSchema},
  prompt: `You are an AI assistant that crafts personalized and friendly notification messages for users of a smart wallet application.

  Your goal is to inform the user about important financial events in a way that is easy to understand and helpful.

  Use the following information to create the notification message:

  User ID: {{{userId}}}
  Event Description: {{{eventDescription}}}
  Event Details: {{{eventDetails}}}

  Craft a message that is concise, informative, and actionable. Focus on providing value to the user and helping them stay on top of their finances.
  Make sure the tone is friendly and approachable, and never sound alarming or accusatory.
  Remember to format your messages so that they are easy to read within a push notification context, e.g. be as short as possible and avoid line breaks.
`,
});

const generatePersonalizedNotificationFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedNotificationFlow',
    inputSchema: GeneratePersonalizedNotificationInputSchema,
    outputSchema: GeneratePersonalizedNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
