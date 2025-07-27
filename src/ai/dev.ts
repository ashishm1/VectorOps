
import { config } from 'dotenv';
config();

import '@/ai/flows/parse-receipt-data.ts';
import '@/ai/flows/detect-warranty.ts';
import '@/ai/flows/generate-personalized-notification.ts';
import '@/ai/tools/currency-converter.ts';
import '@/ai/flows/ask-chatbot.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/generate-spending-alert.ts';
import '@/ai/flows/send-notification.ts';
import '@/ai/flows/generate-actionable-insights.ts';
import '@/ai/flows/identify-recurring-payments.ts';


