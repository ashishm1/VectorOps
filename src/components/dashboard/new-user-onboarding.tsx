
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptUploadButton } from './receipt-upload-button';
import { CheckCircle, Bot, Target } from 'lucide-react';
import type { Receipt } from '@/lib/types';

interface NewUserOnboardingProps {
    onUpload: (receipt: Receipt) => void;
}

export function NewUserOnboarding({ onUpload }: NewUserOnboardingProps) {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-4xl mx-auto p-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to ReceiptWise</h1>
                    <p className="text-xl text-muted-foreground">Your intelligent financial companion.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <CheckCircle className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-lg font-semibold">Auto-Categorization</h3>
                        <p className="text-sm text-muted-foreground">
                            Snap a photo of your receipt and let our AI handle the rest.
                        </p>
                    </div>
                     <div className="flex flex-col items-center">
                        <Target className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-lg font-semibold">Smart Quotas</h3>
                        <p className="text-sm text-muted-foreground">
                            Set spending limits and get smart alerts to stay on budget.
                        </p>
                    </div>
                     <div className="flex flex-col items-center">
                        <Bot className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-lg font-semibold">AI Insights</h3>
                        <p className="text-sm text-muted-foreground">
                            Ask our chatbot for financial advice based on your spending.
                        </p>
                    </div>
                </div>

                <Card className="mt-16 w-full max-w-lg mx-auto shadow-2xl">
                    <CardHeader>
                        <CardTitle>Ready to get started?</CardTitle>
                        <CardDescription>Upload your first receipt to begin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReceiptUploadButton setReceipts={onUpload} isPrimary={true} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
