
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const FollowUpAutomationSettings = () => {
    const { control } = useFormContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
                <Clock className="h-5 w-5 text-quikle-primary" />
                Follow-up Automation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name="follow_up_enabled"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <FormLabel className="text-base">Enable automated follow-ups</FormLabel>
                                <p className="text-sm text-muted-foreground">Send reminder emails for unpaid invoices</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={control}
                        name="first_follow_up_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Follow-up (days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min="1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="second_follow_up_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Second Follow-up (days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min="1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="final_follow_up_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Final Follow-up (days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min="1" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="reminder_template"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reminder Email Template</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value ?? ''} rows={5} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
};
