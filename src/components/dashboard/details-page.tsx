
'use client';

import { useState } from 'react';
import { useReceipts } from '@/lib/receipts-context';
import { useAuth } from '@/lib/auth';
import type { Receipt } from '@/lib/types';
import { ReceiptDetailsDialog } from './receipt-details-dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { ReceiptList } from './receipt-list';

export function DetailsPage() {
    const { user } = useAuth();
    const { receipts } = useReceipts();
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const userReceipts = receipts
        .filter(receipt => {
            const isOwner = receipt.userId === user?.email;
            const isParticipant = receipt.splitInfo?.participants.some(p => p.email === user?.email);
            return isOwner || isParticipant;
        })
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

    const filteredReceipts = userReceipts.filter(receipt => {
        if (!dateRange?.from) return true; // Show all if no start date
        const receiptDate = new Date(receipt.transactionDate);
        const toDate = dateRange.to || dateRange.from; // Use 'from' if 'to' is not set
        return receiptDate >= dateRange.from && receiptDate <= toDate;
    });

    const displayedReceipts = dateRange?.from ? filteredReceipts : userReceipts.slice(0, 10);
    
    if (!receipts) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    const handleSelectReceipt = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
    };

    return (
        <div className="flex h-full flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
                    <p className="text-muted-foreground">
                        Browse and filter through all your receipts.
                    </p>
                </div>
                <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>
            
            <ReceiptList receipts={displayedReceipts} onSelectReceipt={handleSelectReceipt} />
            
             <ReceiptDetailsDialog
                receipt={selectedReceipt}
                isOpen={!!selectedReceipt}
                onOpenChange={(isOpen) => !isOpen && setSelectedReceipt(null)}
            />
        </div>
    );
}
