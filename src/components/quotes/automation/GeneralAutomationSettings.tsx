
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const GeneralAutomationSettings = () => {
    const { control } = useFormContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
                <Settings className="h-5 w-5 text-quikle-primary" />
                General Automation Rules
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name="auto_create_invoice_from_quote"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Auto-create invoice from accepted quote</FormLabel>
                                <p className="text-sm text-muted-foreground">Automatically generate invoice when quote is accepted</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="send_on_create"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Send notifications on creation</FormLabel>
                                <p className="text-sm text-muted-foreground">Send email/WhatsApp when quote/invoice is created</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="mark_overdue_after_days"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mark invoices as overdue after (days)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} min="1" className="w-32" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
};
