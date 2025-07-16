
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetricCard {
  id: string;
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  change?: { value: number; isPositive: boolean };
}

interface SwipeableMetricsCardsProps {
  metrics: MetricCard[];
}

const SwipeableMetricsCards = ({ metrics }: SwipeableMetricsCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < metrics.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextMetric = () => {
    setCurrentIndex((prev) => (prev + 1) % metrics.length);
  };

  const prevMetric = () => {
    setCurrentIndex((prev) => (prev - 1 + metrics.length) % metrics.length);
  };

  const currentMetric = metrics[currentIndex];

  return (
    <div className="md:hidden">
      <Card 
        className="mx-4 shadow-md"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMetric}
              disabled={currentIndex === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex space-x-1">
              {metrics.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-quikle-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMetric}
              disabled={currentIndex === metrics.length - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <div className={`inline-flex p-3 rounded-full mb-4 ${currentMetric.color}`}>
              {currentMetric.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentMetric.title}
            </h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {currentMetric.value}
            </div>
            {currentMetric.change && (
              <div className={`text-sm ${currentMetric.change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {currentMetric.change.isPositive ? '+' : ''}{currentMetric.change.value}% from last month
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwipeableMetricsCards;
