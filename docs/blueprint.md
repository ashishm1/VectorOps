# **App Name**: ReceiptWise

## Core Features:

- User Authentication: Secure user authentication via login page, with view personalization based on user ID.
- Receipt Upload and OCR: Receipt upload triggers a Cloud Function that extracts text using Cloud Vision AI.
- Data Parsing with Gemini AI: Text from OCR is sent to the Gemini AI API tool for parsing into a structured JSON object, categorized by merchant, date, amount, line items, etc.
- Warranty Detection: Warranty detection: AI tool looks at items to suggest presence of a warranty; warrantyInfo field stores the isWarrantyTracked flag.
- Proactive Notifications: The system queries Firestore for user events and uses the Gemini AI API to generate personalized, friendly notification messages. FCM delivers them to the user's device.
- Receipt Data View: Display structured receipt data in a clean and organized format, including the listing of all the fields parsed by the AI.

## Style Guidelines:

- Primary color: Moderate blue (#5DADE2) to evoke trust and financial responsibility.
- Background color: Light, desaturated blue (#EBF4FA) for a clean and calming interface.
- Accent color: Soft green (#82E0AA) for positive confirmations and financial insights.
- Body and headline font: 'Inter', a grotesque-style sans-serif font.
- Use minimalist, line-based icons for categories, merchants, and other receipt attributes.
- Prioritize a clean and intuitive layout that prominently displays key receipt data.
- Subtle animations when receipt details are loading or when a new notification arrives.