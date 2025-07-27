
'use client';

import { useState, useEffect, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import type { Receipt } from '@/lib/types';
import { generateActionableInsights } from '@/ai/flows/generate-actionable-insights';

interface ActionableInsightsCarouselProps {
  receipts: Receipt[];
  quotas: { [key: string]: number };
}

export function ActionableInsightsCarousel({
  receipts,
  quotas,
}: ActionableInsightsCarouselProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize props to prevent unnecessary refetching
  const memoizedReceipts = useMemo(() => receipts, [receipts]);
  const memoizedQuotas = useMemo(() => quotas, [quotas]);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateActionableInsights({
          receipts: memoizedReceipts,
          quotas: memoizedQuotas,
        });
        setInsights(result.insights);
      } catch (err) {
        console.error('Failed to generate actionable insights:', err);
        setError('Could not load insights at the moment. Please try again later.');
        setInsights([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [memoizedReceipts, memoizedQuotas]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-center gap-4 p-4">
                <div className="text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-destructive">
                    {error}
                </p>
            </CardContent>
        </Card>
    );
  }
  
  if (insights.length === 0) {
    return null; // Don't render anything if there are no insights
  }

  return (
    <Carousel
      className="w-full"
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: true,
        }),
      ]}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {insights.map((insight, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="shadow-none border-dashed bg-accent/20 dark:bg-accent/20 border-accent/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="text-accent-foreground/80">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-accent-foreground">
                    {insight}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
