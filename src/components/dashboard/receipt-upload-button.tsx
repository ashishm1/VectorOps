
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, Trash2, UploadCloud, UserPlus, Users } from 'lucide-react';
import type { Receipt, SplitParticipant, ItemSplit, SplitInfo } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { format, startOfMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { parseReceiptData } from '@/ai/flows/parse-receipt-data';
import { generateSpendingAlert } from '@/ai/flows/generate-spending-alert';
import { useAuth } from '@/lib/auth';
import { useQuotas } from '@/lib/quotas-context';
import { useReceipts } from '@/lib/receipts-context';
import { Badge } from '@/components/ui/badge';
import { sendNotification } from '@/ai/flows/send-notification';

const registeredUsers = [
  'ashish@gmail.com',
  'prabhat@gmail.com',
  'ayush@gmail.com',
  'hackathonuser@gmail.com'
];

interface ReceiptUploadButtonProps {
  setReceipts: (receipt: Receipt) => void;
  isPrimary?: boolean;
}

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().positive('Quantity must be a positive number.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
  category: z.string().min(1, 'Category is required.'),
});

const receiptSchema = z.object({
  merchantName: z.string().min(1, 'Merchant name is required.'),
  transactionDate: z.string().min(1, 'Transaction date is required.'),
  currency: z.string().min(1, 'Currency is required.'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  trackWarranty: z.boolean().optional(),
  isSplit: z.boolean(),
  participants: z.array(z.string().email()),
  splitType: z.enum(['equal', 'custom']),
  itemSplits: z.array(z.object({ itemId: z.string(), assignedTo: z.string() })).optional(),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

const categories = [
  'Home', 'Food', 'Health', 'Restaurant', 'Shopping', 'Travel', 'Entertainment', 'Fuel', 'Other'
];

export function ReceiptUploadButton({ setReceipts, isPrimary = false }: ReceiptUploadButtonProps) {
  const { user } = useAuth();
  const { quotas } = useQuotas();
  const { receipts: allReceipts } = useReceipts();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const [participantEmail, setParticipantEmail] = useState('');

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      merchantName: '',
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      currency: 'INR',
      lineItems: [{ id: 'item-0', description: '', quantity: 1, price: 0, category: '' }],
      trackWarranty: false,
      isSplit: false,
      participants: [],
      splitType: 'equal',
      itemSplits: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });
  
  const watchedIsSplit = form.watch('isSplit');
  const watchedSplitType = form.watch('splitType');
  const watchedParticipants = form.watch('participants');
  
  const checkQuotaAndAlert = async (newReceipt: Receipt) => {
    if (!user) return;
  
    const startOfCurrentMonth = startOfMonth(new Date());
  
    // Group new spending by category
    const newSpendingByCategory: { [key: string]: number } = {};
    newReceipt.lineItems.forEach(item => {
      if (!newSpendingByCategory[item.category]) {
        newSpendingByCategory[item.category] = 0;
      }
      newSpendingByCategory[item.category] += item.price * item.quantity;
    });
  
    for (const category in newSpendingByCategory) {
      const quota = quotas[category];
      if (!quota) continue;
  
      const previousSpend = allReceipts.reduce((sum, r) => {
        if (r.userId === user.email && new Date(r.transactionDate) >= startOfCurrentMonth) {
          r.lineItems.forEach(item => {
            if (item.category === category) {
              sum += item.price * item.quantity;
            }
          });
        }
        return sum;
      }, 0);
  
      const newSpend = newSpendingByCategory[category];
      const currentSpend = previousSpend + newSpend;
  
      let alertType: 'warning' | 'exceeded' | null = null;
  
      if (currentSpend >= quota && previousSpend < quota) {
        alertType = 'exceeded';
      } else if (currentSpend >= quota * 0.8 && previousSpend < quota * 0.8) {
        alertType = 'warning';
      }
  
      if (alertType) {
        try {
          const alert = await generateSpendingAlert({
            category: category,
            currentSpend,
            quota,
            alertType,
            allReceipts: [...allReceipts, newReceipt],
          });
          toast({
            title: alert.title,
            description: alert.message,
            variant: alertType === 'exceeded' ? 'destructive' : 'default',
            duration: 10000,
          });
          await sendNotification({
            userId: user.email,
            title: alert.title,
            body: alert.message,
          });
        } catch (e) {
          console.error('Failed to generate spending alert:', e);
          toast({
            title: 'Alert Generation Failed',
            description: `Could not generate a spending alert for ${category} due to a temporary issue. Please try again later.`,
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleAddParticipant = () => {
    if (participantEmail && !watchedParticipants.includes(participantEmail)) {
       if (!registeredUsers.includes(participantEmail)) {
         toast({
           title: 'User Not Found',
           description: `The email "${participantEmail}" is not a registered user.`,
           variant: 'destructive',
         });
         return;
       }
      if (participantEmail === user?.email) {
        toast({
           title: 'Cannot add yourself',
           description: 'You are already included as the payer.',
           variant: 'destructive',
         });
         return;
      }
      form.setValue('participants', [...watchedParticipants, participantEmail]);
      setParticipantEmail('');
    }
  };

  const handleAddReceipt = async (data: ReceiptFormData) => {
    if (!user) {
       toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add a receipt.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const totalAmount = data.lineItems.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
      );

      let splitInfo: SplitInfo | undefined = undefined;
      if (data.isSplit) {
        const allParticipants = [user.email, ...data.participants];
        const numParticipants = allParticipants.length;
        let participantDetails: SplitParticipant[] = [];

        if (data.splitType === 'equal') {
            const share = totalAmount / numParticipants;
            participantDetails = allParticipants.map(email => ({
                email,
                share,
                paid: email === user.email ? totalAmount : 0,
                owes: email === user.email ? 0 : share,
                status: email === user.email ? 'settled' : 'unsettled',
            }));
        } else { // custom split
            const userShares: {[key: string]: number} = {};
            allParticipants.forEach(p => userShares[p] = 0);
            
            data.itemSplits?.forEach(itemSplit => {
                const lineItem = data.lineItems.find(li => li.id === itemSplit.itemId);
                if (lineItem) {
                    userShares[itemSplit.assignedTo] += lineItem.price * lineItem.quantity;
                }
            });

            participantDetails = allParticipants.map(email => ({
                email,
                share: userShares[email],
                paid: email === user.email ? totalAmount : 0,
                owes: email === user.email ? 0 : userShares[email],
                status: email === user.email ? 'settled' : 'unsettled',
            }));
        }
        
        splitInfo = {
            isSplit: true,
            payer: user.email,
            participants: participantDetails,
            splitType: data.splitType,
            itemSplits: data.itemSplits,
        };
      }

      const hasShoppingItem = data.lineItems.some(item => item.category === 'Shopping');

      const newReceipt: Omit<Receipt, 'id'> = {
        userId: user.email,
        merchantName: data.merchantName,
        transactionDate: data.transactionDate,
        totalAmount,
        lineItems: data.lineItems,
        currency: data.currency,
        warrantyInfo: hasShoppingItem
            ? { isWarrantyTracked: !!data.trackWarranty } 
            : undefined,
        splitInfo,
        receiptDataUri: activeTab === 'upload' ? fileDataUri || undefined : undefined,
      };
      
      await checkQuotaAndAlert(newReceipt as Receipt);

      // Save to database via API
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReceipt),
      });

      if (!response.ok) {
        throw new Error('Failed to save receipt to database');
      }

      const { receipt } = await response.json();
      setReceipts(receipt);

      toast({
        title: 'Success!',
        description: `Receipt from ${newReceipt.merchantName} has been added.`,
      });
      setIsOpen(false);
      form.reset();
      setFileName(null);
      setFileDataUri(null);
    } catch (error) {
      console.error('Failed to add receipt:', error);
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem adding your receipt.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFileDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setFileName(null);
        setFileDataUri(null);
    }
  };
  
  const handleFileUpload = async () => {
    if (!fileDataUri) {
         toast({
            title: 'No file selected',
            description: 'Please select a file to upload.',
            variant: 'destructive',
        });
        return;
    }
    setIsParsing(true);
    try {
        const parsedData = await parseReceiptData({ receiptDataUri: fileDataUri });
        
        const lineItemsWithIds = parsedData.lineItems.map((item, index) => ({
            id: `item-${index}`,
            description: item.description,
            quantity: item.quantity || 1,
            price: parseFloat(item.price.toFixed(2)),
            category: item.category,
        }));

        form.reset({
            ...form.getValues(),
            merchantName: parsedData.merchantName,
            transactionDate: format(new Date(parsedData.transactionDate), 'yyyy-MM-dd'),
            currency: parsedData.currency,
            lineItems: lineItemsWithIds,
            trackWarranty: parsedData.warrantyInfo?.isWarrantyTracked || false,
        });

        toast({
            title: 'Success!',
            description: 'Receipt data extracted. Please review and save.',
        });
        setActiveTab('manual');

    } catch(error) {
        console.error("Failed to parse receipt:", error);
        toast({
            title: 'Parsing Failed',
            description: 'Could not automatically extract data from the receipt. Please enter it manually.',
            variant: 'destructive',
        });
    } finally {
        setIsParsing(false);
    }
  }

  const handleAppendItem = () => {
    append({
        id: `item-${fields.length}`,
        description: '',
        quantity: 1,
        price: 0,
        category: '',
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            form.reset();
            setFileName(null);
            setFileDataUri(null);
        }
        setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        {isPrimary ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Receipt
          </Button>
        ) : (
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
         <DialogHeader>
            <DialogTitle>Add New Receipt</DialogTitle>
            <DialogDescription>
              Choose a method to add your receipt details.
            </DialogDescription>
          </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload" disabled={isParsing}>Upload File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <form onSubmit={form.handleSubmit(handleAddReceipt)}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="merchantName">Merchant Name</Label>
                      <Input id="merchantName" {...form.register('merchantName')} />
                      {form.formState.errors.merchantName && <p className="text-xs text-destructive">{form.formState.errors.merchantName.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="transactionDate">Date</Label>
                        <Input id="transactionDate" type="date" {...form.register('transactionDate')} />
                         {form.formState.errors.transactionDate && <p className="text-xs text-destructive">{form.formState.errors.transactionDate.message}</p>}
                      </div>
                </div>
                
                 <div className="flex items-center space-x-2 rounded-md border p-3">
                     <Controller
                      control={form.control}
                      name="trackWarranty"
                      render={({ field }) => (
                         <Switch
                          id="trackWarranty"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="trackWarranty">Track Warranty for Shopping items</Label>
                    <p className="text-xs text-muted-foreground">(AI will check for applicable items)</p>
                  </div>

                <Separator />

                <div>
                  <Label className="font-semibold">Line Items</Label>
                   <div className="space-y-4 mt-2">
                    {fields.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md relative">
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="absolute top-1 right-1 h-6 w-6"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        <div className="col-span-12 md:col-span-6 space-y-1">
                          <Label htmlFor={`lineItems.${index}.description`}>Description</Label>
                          <Input
                            id={`lineItems.${index}.description`}
                            placeholder="Item name"
                            {...form.register(`lineItems.${index}.description`)}
                          />
                           {form.formState.errors.lineItems?.[index]?.description && <p className="text-xs text-destructive">{form.formState.errors.lineItems?.[index]?.description?.message}</p>}
                        </div>
                         <div className="col-span-6 md:col-span-2 space-y-1">
                          <Label htmlFor={`lineItems.${index}.quantity`}>Qty</Label>
                          <Input
                            id={`lineItems.${index}.quantity`}
                            type="number"
                            placeholder="1"
                            step="any"
                            {...form.register(`lineItems.${index}.quantity`)}
                          />
                           {form.formState.errors.lineItems?.[index]?.quantity && <p className="text-xs text-destructive">{form.formState.errors.lineItems?.[index]?.quantity?.message}</p>}
                        </div>
                        <div className="col-span-6 md:col-span-4 space-y-1">
                          <Label htmlFor={`lineItems.${index}.price`}>Price (per item)</Label>
                           <Input
                             id={`lineItems.${index}.price`}
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            {...form.register(`lineItems.${index}.price`)}
                          />
                           {form.formState.errors.lineItems?.[index]?.price && <p className="text-xs text-destructive">{form.formState.errors.lineItems?.[index]?.price?.message}</p>}
                        </div>
                        <div className="col-span-12 space-y-1">
                           <Label htmlFor={`lineItems.${index}.category`}>Category</Label>
                           <Controller
                              control={form.control}
                              name={`lineItems.${index}.category`}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((cat) => (
                                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                             {form.formState.errors.lineItems?.[index]?.category && <p className="text-xs text-destructive">{form.formState.errors.lineItems?.[index]?.category?.message}</p>}
                        </div>
                      </div>
                    ))}
                     {form.formState.errors.lineItems && !form.formState.errors.lineItems.root?.message && <p className="text-xs text-destructive">{form.formState.errors.lineItems.message}</p>}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAppendItem}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={form.control}
                            name="isSplit"
                            render={({ field }) => (
                                <Switch
                                    id="isSplit"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="isSplit" className="font-semibold">Split this invoice</Label>
                    </div>

                    {watchedIsSplit && (
                        <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                            <div>
                                <Label htmlFor="participantEmail">Add Participants by Email</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="participantEmail"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={participantEmail}
                                        onChange={(e) => setParticipantEmail(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddParticipant(); }}}
                                    />
                                    <Button type="button" onClick={handleAddParticipant}>
                                      <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {watchedParticipants.map((email, index) => (
                                        <Badge key={index} variant="secondary">
                                            {email}
                                            <button type="button" onClick={() => {
                                                const newParticipants = watchedParticipants.filter((_, i) => i !== index);
                                                form.setValue('participants', newParticipants);
                                            }} className="ml-2 text-muted-foreground hover:text-foreground">
                                                &times;
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            
                            {watchedParticipants.length > 0 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="splitType">Split Method</Label>
                                        <Controller
                                          control={form.control}
                                          name="splitType"
                                          render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select split method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="equal">Split All Items Equally</SelectItem>
                                                    <SelectItem value="custom">Custom Item Assignment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                          )}
                                        />
                                    </div>
                                    
                                    {watchedSplitType === 'custom' && (
                                        <div className="space-y-2">
                                            <Label>Assign Items to Participants</Label>
                                            <div className="space-y-2">
                                                {fields.map((lineItem, index) => (
                                                    <div key={lineItem.id} className="grid grid-cols-2 gap-2 items-center p-2 border rounded-md bg-background">
                                                        <p className="text-sm truncate">{lineItem.description}</p>
                                                        <Controller
                                                          control={form.control}
                                                          name={`itemSplits.${index}`}
                                                          defaultValue={{ itemId: lineItem.id, assignedTo: user!.email }}
                                                          render={({ field }) => (
                                                              <Select onValueChange={(value) => field.onChange({ itemId: lineItem.id, assignedTo: value })} value={field.value?.assignedTo}>
                                                                  <SelectTrigger>
                                                                      <SelectValue placeholder="Assign to" />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                      {[user!.email, ...watchedParticipants].map(email => (
                                                                        <SelectItem key={email} value={email as string}>{email as string}</SelectItem>
                                                                      ))}
                                                                  </SelectContent>
                                                              </Select>
                                                          )}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
              </div>
               <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="secondary" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Saving...' : 'Save Receipt'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="upload">
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                 <Label htmlFor="receipt-file">Receipt File</Label>
                 <div
                    className={cn(
                      "relative block w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/50 text-center hover:border-primary",
                      fileName && "border-primary"
                    )}
                  >
                    <Input
                      id="receipt-file"
                      type="file"
                      className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      disabled={isParsing}
                    />
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      {isParsing ? (
                        <>
                         <Loader2 className="h-10 w-10 mb-2 animate-spin text-primary" />
                         <p className="font-semibold">Parsing Receipt...</p>
                         <p className="text-xs">This may take a moment.</p>
                        </>
                      ) : (
                         <>
                          <UploadCloud className="h-10 w-10 mb-2" />
                          {fileName ? (
                            <p className="font-semibold text-primary">{fileName}</p>
                          ) : (
                            <>
                             <p className="font-semibold">Drag & drop or click to upload</p>
                             <p className="text-xs">PDF, PNG, JPG accepted</p>
                            </>
                          )}
                         </>
                      )}
                    </div>
                  </div>
              </div>
            </div>
             <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" disabled={isParsing}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleFileUpload} disabled={!fileName || isParsing}>
                   {isParsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {isParsing ? 'Parsing...' : 'Upload & Parse'}
                </Button>
              </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
