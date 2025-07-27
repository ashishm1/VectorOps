
'use server';

/**
 * @fileOverview A Genkit flow for sending a push notification via FCM.
 *
 * - sendNotification - A function that sends a notification to a user.
 * - SendNotificationInput - The input type for the sendNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';
import { db } from '@/lib/firebase'; // This ensures admin is initialized via firebase.ts

// In a real app, you would fetch the user's FCM token from your database.
// For this prototype, we'll use a placeholder.
const MOCK_USER_FCM_TOKENS: Record<string, string> = {
  'ashish@gmail.com': 'YOUR_MOCK_FCM_TOKEN_HERE',
  'prabhat@gmail.com': 'YOUR_MOCK_FCM_TOKEN_HERE',
  'ayush@gmail.com': 'YOUR_MOCK_FCM_TOKEN_HERE',
  'hackathonuser@gmail.com': 'YOUR_MOCK_FCM_TOKEN_HERE',
  // Add other users if needed
};

const SendNotificationInputSchema = z.object({
  userId: z.string().describe("The email of the user to send the notification to."),
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The body content of the notification.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

async function sendFcmNotification(
  token: string,
  title: string,
  body: string
) {
  if (!admin.apps.length) {
    console.error('Firebase Admin not initialized, cannot send notification.');
    throw new Error('Firebase Admin not initialized.');
  }

  const message = {
    notification: {
      title,
      body,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending FCM message:', error);
    // Throwing the error to be caught by the flow
    throw new Error(`Failed to send FCM message: ${error}`);
  }
}

export async function sendNotification(
  input: SendNotificationInput
): Promise<void> {
  return sendNotificationFlow(input);
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.void(),
  },
  async ({ userId, title, body }) => {
    const fcmToken = MOCK_USER_FCM_TOKENS[userId];

    if (!fcmToken || fcmToken === 'YOUR_MOCK_FCM_TOKEN_HERE') {
      console.log(
        `FCM token for user ${userId} not found or is a placeholder. Skipping notification.`
      );
      return;
    }

    await sendFcmNotification(fcmToken, title, body);
  }
);
