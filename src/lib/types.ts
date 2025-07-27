export interface LineItem {
  description: string;
  quantity: number;
  price: number;
  category: string;
}

export interface WarrantyInfo {
  isWarrantyTracked: boolean;
  warrantyEndDate?: string;
  daysRemaining?: number;
}

export interface SplitParticipant {
  email: string;
  share: number;
  paid: number;
  owes: number;
  status?: 'unsettled' | 'pending' | 'settled'; // Track settlement status
}

export interface ItemSplit {
  itemId: string; // Corresponds to a unique ID for each line item
  assignedTo: string; // email of the participant
}

export interface SplitInfo {
  isSplit: boolean;
  payer: string; // The email of the person who paid
  participants: SplitParticipant[];
  itemSplits?: ItemSplit[]; // For custom split
  splitType: 'equal' | 'custom';
}


export interface Receipt {
  id: string;
  userId: string;
  merchantName: string;
  transactionDate: string;
  totalAmount: number;
  lineItems: (LineItem & { id: string })[]; // Add ID to line items
  currency: string;
  warrantyInfo?: WarrantyInfo;
  splitInfo?: SplitInfo;
  receiptDataUri?: string; // To store the original receipt image
}
