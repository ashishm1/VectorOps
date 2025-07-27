'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Receipt } from '@/lib/types';
import { ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ReceiptListProps {
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  INR: '₹',
};

export function ReceiptList({ receipts, onSelectReceipt }: ReceiptListProps) {
  const { user } = useAuth();

  const getMyShare = (receipt: Receipt): number => {
    if (!receipt.splitInfo?.isSplit) {
      return receipt.totalAmount;
    }
    const myShare = receipt.splitInfo.participants.find(p => p.email === user?.email)?.share;
    return myShare ?? 0;
  }

  const getUniqueCategories = (receipt: Receipt): string[] => {
    const categories = receipt.lineItems.map(item => item.category);
    return [...new Set(categories)];
  }

  return (
    <div className="rounded-lg border shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Merchant</TableHead>
            <TableHead className="hidden sm:table-cell">Categories</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="text-right">Your Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id} onClick={() => onSelectReceipt(receipt)} className="cursor-pointer">
              <TableCell>
                <div className="font-medium">{receipt.merchantName}</div>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {receipt.warrantyInfo && <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent-foreground"/> Warranty</span>}
                    {receipt.splitInfo?.isSplit && <span className="flex items-center gap-1"><Users className="h-3 w-3 text-blue-500"/> Split</span>}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  {getUniqueCategories(receipt).slice(0, 2).map(cat => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                  {getUniqueCategories(receipt).length > 2 && (
                    <Badge variant="outline">...</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{new Date(receipt.transactionDate).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="font-mono font-semibold">{currencySymbols[receipt.currency] || '$'} {getMyShare(receipt).toFixed(2)}</div>
                {receipt.splitInfo?.isSplit && <div className="text-xs text-muted-foreground">of {currencySymbols[receipt.currency] || '$'} {receipt.totalAmount.toFixed(2)}</div>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
