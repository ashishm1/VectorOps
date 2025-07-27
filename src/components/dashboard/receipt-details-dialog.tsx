import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Receipt } from '@/lib/types';
import { Calendar, Tag, DollarSign, List, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ReceiptDetailsDialogProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  INR: '₹',
};

export function ReceiptDetailsDialog({ receipt, isOpen, onOpenChange }: ReceiptDetailsDialogProps) {
  const { user } = useAuth();
  if (!receipt) return null;

  const currencySymbol = currencySymbols[receipt.currency] || '$';

  const uniqueCategories = [...new Set(receipt.lineItems.map(item => item.category))];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{receipt.merchantName}</DialogTitle>
          <DialogDescription>
            Detailed view of your transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(receipt.transactionDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">{currencySymbol}{receipt.totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 col-span-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-muted-foreground">Categories</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {uniqueCategories.map(cat => <Badge key={cat} variant="outline">{cat}</Badge>)}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><List className="h-4 w-4" />Line Items</h4>
            <div className="space-y-2">
              {receipt.lineItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm p-2 rounded-md bg-muted/50">
                  <div className="flex-grow">
                      <p className="font-medium">{item.description} {item.quantity > 1 ? `(x${item.quantity})` : ''}</p>
                      <Badge variant="secondary" className="mt-1">{item.category}</Badge>
                       {receipt.splitInfo?.splitType === 'custom' && (
                        <p className="text-xs text-primary mt-1">{receipt.splitInfo.itemSplits?.find(s => s.itemId === item.id)?.assignedTo}</p>
                      )}
                  </div>
                  <p className="font-mono ml-4">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          
          {receipt.splitInfo?.isSplit && (
             <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4" />Split Summary</h4>
                <div className="space-y-3 rounded-md border p-3">
                  <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{receipt.splitInfo.payer}</span> paid the total amount of <span className="font-mono">{currencySymbol}{receipt.totalAmount.toFixed(2)}</span>.</p>
                   <div className="space-y-2">
                    {receipt.splitInfo.participants.map(p => (
                      <div key={p.email} className="flex justify-between items-center text-sm">
                        <p className={p.email === user?.email ? 'font-semibold' : ''}>{p.email === user?.email ? "Your share" : p.email}</p>
                        <div className="text-right">
                           <p className="font-mono">{currencySymbol}{p.share.toFixed(2)}</p>
                           {p.email !== receipt.splitInfo?.payer && <p className="text-xs text-red-500">Owes {currencySymbol}{p.owes.toFixed(2)}</p>}
                        </div>
                      </div>
                    ))}
                   </div>
                </div>
              </div>
            </>
          )}

          {receipt.warrantyInfo && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Warranty</h4>
                 <div className="flex items-center space-x-2 rounded-md border p-3">
                  <Switch id="warranty-mode" defaultChecked={receipt.warrantyInfo.isWarrantyTracked} />
                  <Label htmlFor="warranty-mode">Track Warranty</Label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">AI detected a potential warranty for this purchase. Enable to receive expiration reminders.</p>
              </div>
            </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
