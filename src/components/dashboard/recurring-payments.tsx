
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Receipt } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Repeat, Loader2, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { identifyRecurringPayments, RecurringPayment } from '@/ai/flows/identify-recurring-payments';
import { differenceInDays, parseISO } from 'date-fns';

interface RecurringPaymentsProps {
  receipts: Receipt[];
}

export function RecurringPayments({ receipts }: RecurringPaymentsProps) {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const memoizedReceipts = useMemo(() => receipts, [receipts]);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const result = await identifyRecurringPayments({ receipts: memoizedReceipts });
        setPayments(result.payments);
      } catch (error) {
        console.error('Failed to identify recurring payments:', error);
        toast({
          title: 'Error Fetching Subscriptions',
          description: 'Could not analyze your recurring payments.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [memoizedReceipts, toast]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    return payments
      .filter(p => {
        const dueDate = parseISO(p.nextDueDate);
        const daysUntilDue = differenceInDays(dueDate, today);
        return daysUntilDue >= 0 && daysUntilDue <= 14;
      })
      .sort((a,b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime());
  }, [payments]);

  const handleDelete = (id: string) => {
    setPayments(currentPayments => currentPayments.filter(p => p.id !== id));
    toast({
      title: 'Subscription Removed',
      description: 'The recurring payment has been removed from this list.',
    });
  };

  const handleEdit = (payment: RecurringPayment) => {
    setEditingPayment(payment);
  };

  const handleUpdatePayment = () => {
    if (!editingPayment) return;
    setIsSubmitting(true);
    // In a real app, you'd save this to a database.
    // For this prototype, we'll just update the local state.
    setTimeout(() => {
      setPayments(currentPayments =>
        currentPayments.map(p => p.id === editingPayment.id ? editingPayment : p)
      );
      setIsSubmitting(false);
      setEditingPayment(null);
      toast({
        title: 'Subscription Updated',
        description: 'Your changes have been saved.',
      });
    }, 500);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPayment) return;
    const { name, value } = e.target;
    setEditingPayment({
        ...editingPayment,
        [name]: name === 'estimatedAmount' ? parseFloat(value) : value
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat />
            <span>Upcoming Bills</span>
          </CardTitle>
          <CardDescription>
            AI-detected payments due in the next 14 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : upcomingPayments.length > 0 ? (
            <div className="space-y-3">
              {upcomingPayments.map(payment => (
                <div key={payment.id} className="flex items-center gap-3 rounded-md border p-3">
                  <div className="flex-grow">
                    <p className="font-medium">{payment.merchantName}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(payment.nextDueDate).toLocaleDateString()} &bull; ₹{payment.estimatedAmount.toFixed(2)}
                    </p>
                  </div>
                  {payment.status === 'unpaid' ? (
                     <Badge variant="destructive">Unpaid</Badge>
                  ) : (
                     <Badge variant="secondary">Paid</Badge>
                  )}
                  <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(payment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              No bills due in the next 14 days.
            </div>
          )}
        </CardContent>
      </Card>
      
      {editingPayment && (
        <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="merchantName">Merchant Name</Label>
                <Input
                  id="merchantName"
                  name="merchantName"
                  value={editingPayment.merchantName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedAmount">Amount (₹)</Label>
                <Input
                  id="estimatedAmount"
                  name="estimatedAmount"
                  type="number"
                  value={editingPayment.estimatedAmount}
                   onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdatePayment} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
