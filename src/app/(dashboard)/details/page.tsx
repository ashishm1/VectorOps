
'use client';

import { useState } from 'react';
import { useReceipts } from '@/lib/receipts-context';
import { useAuth } from '@/lib/auth';
import type { Receipt } from '@/lib/types';
import { ReceiptDetailsDialog } from '@/components/dashboard/receipt-details-dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { ReceiptList } from '@/components/dashboard/receipt-list';
import { Button } from '@/components/ui/button';

export default function Details() {
    const { user } = useAuth();
    const { receipts } = useReceipts();
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(undefined);

    const userReceipts = receipts
        .filter(receipt => {
            const isOwner = receipt.userId === user?.email;
            const isParticipant = receipt.splitInfo?.participants.some(p => p.email === user?.email);
            return isOwner || isParticipant;
        })
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

    const displayedReceipts = appliedDateRange?.from
        ? userReceipts.filter(receipt => {
            const receiptDate = new Date(receipt.transactionDate);
            const toDate = appliedDateRange.to || appliedDateRange.from; // Use 'from' if 'to' is not set
            return receiptDate >= appliedDateRange.from! && receiptDate <= toDate;
        })
        : userReceipts.slice(0, 10);

    if (!receipts) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    const handleApplyFilter = () => {
        setAppliedDateRange(dateRange);
    };

    const handleSelectReceipt = (receipt: Receipt) => {
        setSelectedReceipt(receipt);
    };

    return (
        <div className="flex h-full flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
                    <p className="text-muted-foreground">
                        Browse your recent receipts or filter by date.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    <Button onClick={handleApplyFilter} disabled={!dateRange?.from}>Apply</Button>
                </div>
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
