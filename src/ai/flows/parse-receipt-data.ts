'use server';

/**
 * @fileOverview Parses receipt data from an image using a multimodal AI model.
 * It takes an image data URI and directly extracts structured JSON data.
 *
 * - parseReceiptData - A function that handles the receipt parsing process from a file.
 * - ParseReceiptDataInput - The input type for the parseReceiptData function.
 * - ParseReceiptDataOutput - The return type for the parseReceiptData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {convertCurrency} from '@/ai/tools/currency-converter';

const ParseReceiptDataInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "The receipt file (image or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ParseReceiptDataInput = z.infer<typeof ParseReceiptDataInputSchema>;

const ParseReceiptDataOutputSchema = z.object({
  merchantName: z.string().describe('The name of the merchant.'),
  transactionDate: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  totalAmount: z.number().describe('The total amount of the transaction.'),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe('A description of the line item.'),
        quantity: z.number().describe('The quantity of the item, which can be a decimal.'),
        price: z.number().describe('The price of the item.'),
        category: z.string().describe('The category of the transaction (e.g., Home, Food, Health, Restaurant, Shopping, Travel, Entertainment, Other).'),
      })
    )
    .describe('A list of line items in the transaction.'),
  currency: z.string().describe('The currency of the transaction (e.g., USD, INR).'),
  warrantyInfo: z
    .object({
      isWarrantyTracked: z.boolean().describe('Whether or not the warranty is being tracked.'),
    })
    .optional()
    .describe('Warranty information, if applicable.'),
});
export type ParseReceiptDataOutput = z.infer<typeof ParseReceiptDataOutputSchema>;

export async function parseReceiptData(input: ParseReceiptDataInput): Promise<ParseReceiptDataOutput> {
  return parseReceiptDataFlow(input);
}

const parseReceiptImagePrompt = ai.definePrompt({
  name: 'parseReceiptImagePrompt',
  input: {schema: ParseReceiptDataInputSchema},
  output: {schema: ParseReceiptDataOutputSchema},
  prompt: `You are an expert receipt parser. Given an image of a receipt, you will perform OCR to extract all text and then extract key information, formatting it as a JSON object.

  For each line item, you must determine its category. Choose from: Home, Food, Health, Restaurant, Shopping, Travel, Entertainment, Other.

  The JSON object should include the following fields:
  - merchantName: The name of the merchant.
  - transactionDate: The date of the transaction (YYYY-MM-DD).
  - totalAmount: The total amount of the transaction. Infer this by summing line items if not explicitly present.
  - lineItems: A list of line items, where each item has a description, quantity, price, and category. Quantity can be a decimal value (e.g., for items sold by weight). If quantity is not present, default to 1.
  - currency: The currency of the transaction (e.g., USD, INR).

  Here is the receipt image:
  {{media url=receiptDataUri}}

  Return the structured JSON object:
  `,
});

const parseReceiptDataFlow = ai.defineFlow(
  {
    name: 'parseReceiptDataFlow',
    inputSchema: ParseReceiptDataInputSchema,
    outputSchema: ParseReceiptDataOutputSchema,
  },
  async (input) => {
    // 1. Parse the image using Gemini
    const {output} = await parseReceiptImagePrompt(input);

    if (!output) {
      throw new Error('Failed to parse receipt data from image.');
    }

    // 2. Basic warranty detection logic (can be expanded)
    const hasShoppingItem = output.lineItems.some(item => item.category === 'Shopping');
    if (hasShoppingItem && !output.warrantyInfo) {
      output.warrantyInfo = {isWarrantyTracked: false};
    }

    // 3. Convert currency if necessary
    if (output.currency !== 'INR') {
      // Convert total amount
      output.totalAmount = await convertCurrency({
        amount: output.totalAmount,
        fromCurrency: output.currency,
        toCurrency: 'INR',
      });

      // Convert line item prices
      output.lineItems = await Promise.all(
        output.lineItems.map(async item => {
          const convertedPrice = await convertCurrency({
            amount: item.price,
            fromCurrency: output.currency,
            toCurrency: 'INR',
          });
          return {...item, price: convertedPrice};
        })
      );

      output.currency = 'INR';
    }

    return output;
  }
);
