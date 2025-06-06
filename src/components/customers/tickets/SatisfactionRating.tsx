
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { submitSatisfactionRating } from '@/services/ticketAnalyticsService';
import { toast } from '@/hooks/use-toast';

interface SatisfactionRatingProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  customerId: string;
  ticketNumber: string;
}

const SatisfactionRating = ({ isOpen, onClose, ticketId, customerId, ticketNumber }: SatisfactionRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSatisfactionRating(ticketId, customerId, rating, feedback);
      
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
      });
      
      onClose();
      setRating(0);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setRating(0);
    setHoveredRating(0);
    setFeedback('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How satisfied are you with the resolution of ticket {ticketNumber}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Click to rate:</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-colors"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && 'Very Dissatisfied'}
                {rating === 2 && 'Dissatisfied'}
                {rating === 3 && 'Neutral'}
                {rating === 4 && 'Satisfied'}
                {rating === 5 && 'Very Satisfied'}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional feedback (optional)
            </label>
            <Textarea
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SatisfactionRating;
