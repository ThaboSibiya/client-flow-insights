import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Ticket, MapPin, Camera, FileText, ArrowRight } from 'lucide-react';
import { Customer, OnSiteTicket, JobPhoto } from '../types';
import { CustomerStatus } from '@/types/customer';

interface JobSummaryReviewProps {
  customer: Customer;
  newStatus: CustomerStatus;
  workSummary: string;
  notes: string;
  selectedTicket: OnSiteTicket | null;
  photos: JobPhoto[];
  hasLocation: boolean;
}

export const JobSummaryReview = ({
  customer,
  newStatus,
  workSummary,
  notes,
  selectedTicket,
  photos,
  hasLocation,
}: JobSummaryReviewProps) => {
  const items = [
    {
      icon: <User className="h-3.5 w-3.5" />,
      label: 'Client',
      value: customer.name,
      show: true,
    },
    {
      icon: <ArrowRight className="h-3.5 w-3.5" />,
      label: 'Status Change',
      value: (
        <span className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{customer.status}</Badge>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">{newStatus}</Badge>
        </span>
      ),
      show: true,
    },
    {
      icon: <Ticket className="h-3.5 w-3.5" />,
      label: 'Linked Ticket',
      value: selectedTicket
        ? `${selectedTicket.ticket_number} — ${selectedTicket.subject}`
        : 'None',
      show: true,
    },
    {
      icon: <FileText className="h-3.5 w-3.5" />,
      label: 'Work Summary',
      value: workSummary || 'Not provided',
      show: true,
    },
    {
      icon: <Camera className="h-3.5 w-3.5" />,
      label: 'Photos',
      value: `${photos.length} attached`,
      show: true,
    },
    {
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: 'Location',
      value: hasLocation ? 'Verified ✓' : 'Not captured',
      show: true,
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Review & Submit</label>
      <div className="rounded-lg border border-border divide-y divide-border">
        {items.filter(i => i.show).map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 px-3 py-2.5">
            <span className="text-muted-foreground mt-0.5 shrink-0">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <div className="text-sm text-foreground mt-0.5 break-words">{item.value}</div>
            </div>
          </div>
        ))}
        {notes && (
          <div className="flex items-start gap-3 px-3 py-2.5">
            <span className="text-muted-foreground mt-0.5 shrink-0">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Notes</p>
              <p className="text-sm text-foreground mt-0.5 line-clamp-3">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
