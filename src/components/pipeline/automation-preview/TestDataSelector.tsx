
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCustomerData } from '@/hooks/useCustomerData';
import { Customer } from '@/types/customer';

interface TestDataSelectorProps {
    automationType: 'customer' | 'ticket';
    selectedRecordId: string | null;
    onRecordSelect: (id: string) => void;
}

const TestDataSelector = ({ automationType, selectedRecordId, onRecordSelect }: TestDataSelectorProps) => {
    const { customers } = useCustomerData();

    return (
        <div className="space-y-2">
            <Label htmlFor="test-data-selector">Test with real data</Label>
            <Select onValueChange={onRecordSelect} value={selectedRecordId || ""}>
                <SelectTrigger id="test-data-selector">
                    <SelectValue placeholder={`Select a ${automationType}...`} />
                </SelectTrigger>
                <SelectContent>
                    {automationType === 'customer' && customers.map((c: Customer) => (
                        <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.email})
                        </SelectItem>
                    ))}
                    {automationType === 'ticket' && (
                        <SelectItem value="disabled" disabled>Ticket data not yet supported</SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

export default TestDataSelector;
