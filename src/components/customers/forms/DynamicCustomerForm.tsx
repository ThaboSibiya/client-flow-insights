
import React from 'react';
import { useForm } from 'react-hook-form';
import { Customer } from '@/types/customer';
import { useIndustryCustomerFields } from '@/hooks/useIndustryCustomerFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Building, Settings } from 'lucide-react';

interface DynamicCustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const DynamicCustomerForm = ({ customer, onSubmit, onCancel, isSubmitting }: DynamicCustomerFormProps) => {
  const { personalFields, industryFields, equipmentFields, isLoading } = useIndustryCustomerFields();

  const form = useForm({
    defaultValues: customer || {},
  });

  const renderField = (field: any) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        rules={{ required: field.required ? `${field.label} is required` : false }}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl>
              {field.type === 'select' ? (
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  {...formField}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="min-h-[80px]"
                />
              ) : field.type === 'date' ? (
                <Input
                  {...formField}
                  type="date"
                />
              ) : (
                <Input
                  {...formField}
                  type={field.type}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading form template...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="industry" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Industry Details
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Equipment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic contact and identification details</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalFields.map((field) => renderField(field))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="industry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Industry-Specific Details</CardTitle>
                <CardDescription>Information relevant to your business industry</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industryFields.length > 0 ? (
                  industryFields.map((field) => renderField(field))
                ) : (
                  <p className="text-gray-500 col-span-2">No industry-specific fields configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
                <CardDescription>Product and equipment information</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipmentFields.length > 0 ? (
                  equipmentFields.map((field) => renderField(field))
                ) : (
                  <p className="text-gray-500 col-span-2">No equipment fields configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 pt-6">
          <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Customer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DynamicCustomerForm;
