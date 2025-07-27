import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { startOfMonth } from "date-fns";
import type { Receipt } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function calculateMonthlyCategorySpending(
  allReceipts: Receipt[],
  userEmail: string
): { [key: string]: number } {
  const startOfCurrentMonth = startOfMonth(new Date());
  const categorySpending: { [key: string]: number } = {};

  const monthlyReceipts = allReceipts.filter(
    (receipt) =>
      (receipt.userId === userEmail ||
        receipt.splitInfo?.participants.some((p) => p.email === userEmail)) &&
      new Date(receipt.transactionDate) >= startOfCurrentMonth
  );

  monthlyReceipts.forEach((receipt) => {
    const myShare = receipt.splitInfo
      ? receipt.splitInfo.participants.find((p) => p.email === userEmail)?.share ?? 0
      : receipt.totalAmount;

    if (myShare === 0) return;

    const shareRatio = receipt.totalAmount > 0 ? myShare / receipt.totalAmount : 0;

    receipt.lineItems.forEach((item) => {
      const category = item.category;
      const myCostForItem = (item.price * item.quantity) * shareRatio;

      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += myCostForItem;
    });
  });

  return categorySpending;
}
