
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MessageSquare } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const WhatsAppAutomationSettings = () => {
    const { control } = useFormContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp Automation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name="whatsapp_enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Enable WhatsApp notifications</FormLabel>
                                <p className="text-sm text-muted-foreground">Send quote/invoice notifications via WhatsApp</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="whatsapp_template"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>WhatsApp Message Template</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value ?? ''} rows={3} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
};
