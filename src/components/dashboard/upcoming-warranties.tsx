
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Receipt } from '@/lib/types';
import { ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';


interface UpcomingWarrantiesProps {
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}


export function UpcomingWarranties({ receipts, onSelectReceipt }: UpcomingWarrantiesProps) {
    const warrantyReceipts = useMemo(() => {
        return receipts
            .filter(r => r.warrantyInfo?.isWarrantyTracked && r.warrantyInfo.warrantyEndDate)
            .map(r => {
                const daysRemaining = differenceInDays(parseISO(r.warrantyInfo!.warrantyEndDate!), new Date());
                return { ...r, warrantyInfo: { ...r.warrantyInfo, daysRemaining }};
            })
            .filter(r => r.warrantyInfo.daysRemaining! > 0)
            .sort((a, b) => a.warrantyInfo.daysRemaining! - b.warrantyInfo.daysRemaining!);
    }, [receipts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="text-primary"/>
            Tracked Warranties
        </CardTitle>
         <CardDescription>
            Upcoming warranty expirations for your purchases.
        </CardDescription>
      </CardHeader>
      <CardContent>
         {warrantyReceipts.length === 0 ? (
             <div className="text-center text-sm text-muted-foreground py-10">No active warranties are being tracked.</div>
         ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="hidden sm:table-cell">Purchase Date</TableHead>
                        <TableHead className="text-right">Days Remaining</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {warrantyReceipts.slice(0, 5).map((receipt) => (
                    <TableRow key={receipt.id} onClick={() => onSelectReceipt(receipt)} className="cursor-pointer">
                        <TableCell>
                            <div className="font-medium">{receipt.lineItems.find(item => item.description.match(/laptop|smartphone|headphone|tv/i))?.description || receipt.lineItems[0].description}</div>
                            <div className="text-xs text-muted-foreground">{receipt.merchantName}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{new Date(receipt.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={receipt.warrantyInfo.daysRemaining! < 30 ? 'destructive' : 'outline'}>
                                {receipt.warrantyInfo.daysRemaining} days
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
         )}
      </CardContent>
    </Card>
  );
}
