
import type { Receipt, SplitInfo, SplitParticipant, WarrantyInfo } from './types';
import { add, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const users = [
  'ashish@gmail.com',     // User 1
  'prabhat@gmail.com',    // User 2
  'ayush@gmail.com',      // User 3
  'hackathonuser@gmail.com' // User 4
];

const userProfiles = {
  'ashish@gmail.com': { spendRange: [30000, 40000], utilization: 0.55, receiptCount: 25 },
  'prabhat@gmail.com': { spendRange: [40000, 60000], utilization: 0.75, receiptCount: 35 },
  'ayush@gmail.com': { spendRange: [50000, 80000], utilization: 0.45, receiptCount: 45 },
  'hackathonuser@gmail.com': { spendRange: [70000, 100000], utilization: 0.90, receiptCount: 50 },
};

const categories = [
  'Home', 'Food', 'Health', 'Restaurant', 'Shopping', 'Travel', 'Entertainment', 'Fuel', 'Other'
];

const merchantsByCategory: { [key: string]: string[] } = {
  Home: ['IKEA', 'Home Centre', 'Urban Ladder', 'Local Hardware', 'Asian Paints'],
  Food: ['BigBasket', 'Blinkit', 'Zomato Market', 'Swiggy Instamart', 'Reliance Fresh'],
  Health: ['Apollo Pharmacy', '1mg', 'Healthkart', 'Dr. Lal PathLabs', 'Max Hospital'],
  Restaurant: ['Zomato', 'Swiggy', 'Dominos', 'McDonalds', 'Barbeque Nation'],
  Shopping: ['Myntra', 'Amazon', 'Flipkart', 'Croma', 'Reliance Digital'],
  Travel: ['MakeMyTrip', 'Goibibo', 'Indigo', 'Uber', 'Ola'],
  Entertainment: ['PVR Cinemas', 'BookMyShow', 'Netflix', 'Spotify', 'Wonderla'],
  Fuel: ['Indian Oil', 'HP', 'Shell', 'BP'],
  Other: ['Zerodha', 'LIC', 'Coursera', 'Local Services', 'Pet Store'],
};

const electronicItems = ['Smartphone', 'Laptop', 'Wireless Headphones', 'Smart TV', 'Gaming Console'];

const generateLineItems = (merchantCategory: string, targetSpend: number): (Omit<Receipt['lineItems'][0], 'id'>)[] => {
  const items = [];
  const numItems = Math.floor(Math.random() * 3) + 1;
  
  if (merchantCategory === 'Shopping' && Math.random() > 0.5) { // 50% chance for electronics
    items.push({
      description: electronicItems[Math.floor(Math.random() * electronicItems.length)],
      quantity: 1,
      price: Math.random() * 40000 + 15000,
      category: 'Shopping'
    });
  } else {
    for (let i = 0; i < numItems; i++) {
      items.push({
        description: `${merchantCategory} Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: (targetSpend / numItems) * (0.8 + Math.random() * 0.4), // Distribute with some variance
        category: merchantCategory,
      });
    }
  }
  return items;
};

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const createSplitInfo = (payer: string, totalAmount: number, lineItems: Omit<Receipt['lineItems'][0], 'id'>[]): SplitInfo | undefined => {
  const highValueSplitCategories = ['Shopping', 'Travel'];
  const regularSplitCategories = ['Restaurant', 'Fuel'];
  
  const hasHighValueCategory = lineItems.some(item => highValueSplitCategories.includes(item.category));
  const hasRegularCategory = lineItems.some(item => regularSplitCategories.includes(item.category));
  
  // 75% chance for high value, 50% for regular
  if ((hasHighValueCategory && Math.random() < 0.75) || (hasRegularCategory && Math.random() < 0.5)) {
    const otherUsers = users.filter(u => u !== payer);
    const maxParticipants = hasHighValueCategory ? 1 : Math.min(2, otherUsers.length);
    const numParticipants = Math.floor(Math.random() * maxParticipants) + 1;

    const participantsEmails = [payer, ...otherUsers.slice(0, numParticipants)];
    
    const share = totalAmount / participantsEmails.length;
    const participants: SplitParticipant[] = participantsEmails.map(email => ({
      email,
      share,
      paid: email === payer ? totalAmount : 0,
      owes: email === payer ? 0 : share,
      status: 'unsettled',
    }));
    
    participants.find(p => p.email === payer)!.status = 'settled';

    return {
      isSplit: true,
      payer,
      participants,
      splitType: 'equal'
    };
  }
  return undefined;
};

const createWarrantyInfo = (lineItems: Omit<Receipt['lineItems'][0], 'id'>[], transactionDate: string): WarrantyInfo | undefined => {
  const hasElectronic = lineItems.some(item => electronicItems.includes(item.description));
  if (hasElectronic) {
      const purchaseDate = new Date(transactionDate);
      const warrantyEndDate = add(purchaseDate, { years: 1 });
      return {
          isWarrantyTracked: true,
          warrantyEndDate: format(warrantyEndDate, 'yyyy-MM-dd'),
      };
  }
  return undefined;
};


export const allReceipts: Receipt[] = [];

const today = new Date();
const endDate = endOfMonth(today);

users.forEach(user => {
  const profile = userProfiles[user as keyof typeof userProfiles];
  const totalMonths = 6;
  
  for (let month = 0; month < totalMonths; month++) {
      const monthStartDate = startOfMonth(subMonths(today, month));
      const monthEndDate = endOfMonth(subMonths(today, month));
      
      let monthlySpend;
      if (month === 0) { // Current month
          const baseSpend = profile.spendRange[0] + Math.random() * (profile.spendRange[1] - profile.spendRange[0]);
          const spendPercentage = 0.1 + Math.random() * 0.2; // 10% to 30%
          monthlySpend = baseSpend * spendPercentage;
      } else { // Previous months
          monthlySpend = profile.spendRange[0] + Math.random() * (profile.spendRange[1] - profile.spendRange[0]);
      }
      
      const receiptCountForMonth = month === 0 ? Math.ceil(profile.receiptCount / 4) : profile.receiptCount;
      const spendPerReceipt = monthlySpend / receiptCountForMonth;


      for (let i = 0; i < receiptCountForMonth; i++) {
        const merchantCategory = categories[Math.floor(Math.random() * categories.length)];
        const merchantList = merchantsByCategory[merchantCategory];
        const merchantName = merchantList[Math.floor(Math.random() * merchantList.length)];
        const rawLineItems = generateLineItems(merchantCategory, spendPerReceipt);
        const lineItems = rawLineItems.map((item, index) => ({
          ...item,
          id: `item-${user}-${month}-${i}-${index}`
        }));
        const totalAmount = lineItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const transactionDate = generateRandomDate(monthStartDate, monthEndDate).toISOString().split('T')[0];
    
        allReceipts.push({
          id: `${user}-${month}-${i + 1}`,
          userId: user,
          merchantName,
          transactionDate,
          lineItems,
          totalAmount,
          currency: 'INR',
          warrantyInfo: createWarrantyInfo(rawLineItems, transactionDate),
          splitInfo: createSplitInfo(user, totalAmount, rawLineItems)
        });
      }
  }
});


const generateUserQuotas = (user: string) => {
    const profile = userProfiles[user as keyof typeof userProfiles];
    const avgMonthlySpend = (profile.spendRange[0] + profile.spendRange[1]) / 2;
    const totalQuota = avgMonthlySpend / profile.utilization;

    const quotaDistribution = {
        Food: 0.18, Restaurant: 0.12, Shopping: 0.25, Travel: 0.15,
        Entertainment: 0.05, Fuel: 0.10, Health: 0.05, Home: 0.08, Other: 0.02
    };

    const quotas: { [key: string]: number } = {};
    for (const category in quotaDistribution) {
        quotas[category] = Math.round((totalQuota * quotaDistribution[category as keyof typeof quotaDistribution]) / 100) * 100;
    }
    return quotas;
};

// Generate quotas for the primary user for the context
export const sampleQuotas: { [key: string]: number } = generateUserQuotas('hackathonuser@gmail.com');
