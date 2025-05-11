
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Mail, Send, X, Paperclip, History, FileText } from 'lucide-react';
import { sendEmail, emailTemplates, getEmailHistory } from '@/services/emailService';
import { useAuth } from '@/context/AuthContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface EmailCustomerFormProps {
  customerEmail: string;
  customerName: string;
  customerId: string;
  onClose: () => void;
}

interface EmailFormValues {
  subject: string;
  message: string;
  templateId: string;
}

const EmailCustomerForm = ({ customerEmail, customerName, customerId, onClose }: EmailCustomerFormProps) => {
  const [isSending, setIsSending] = useState(false);
  const [currentTab, setCurrentTab] = useState<'compose' | 'history'>('compose');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  const { user } = useAuth();
  
  const form = useForm<EmailFormValues>({
    defaultValues: {
      subject: '',
      message: '',
      templateId: 'none'
    }
  });

  useEffect(() => {
    if (currentTab === 'history') {
      loadEmailHistory();
    }
  }, [currentTab]);
  
  useEffect(() => {
    // Update form values when template changes
    if (selectedTemplate && selectedTemplate !== 'none') {
      const template = emailTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        form.setValue('subject', template.subject);
        const content = template.content
          .replace(/{{customerName}}/g, customerName)
          .replace(/{{senderName}}/g, user?.email || 'Broker CRM');
          
        // Extract the content without HTML tags for the textarea
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        form.setValue('message', tempDiv.textContent || tempDiv.innerText);
      }
    }
  }, [selectedTemplate]);

  const loadEmailHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const { success, data } = await getEmailHistory(customerId);
      if (success && data) {
        setEmailHistory(data);
      }
    } catch (error) {
      console.error('Failed to load email history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments([...attachments, ...filesArray]);
    }
  };
  
  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const onSubmit = async (values: EmailFormValues) => {
    setIsSending(true);
    
    try {
      await sendEmail({
        to: customerEmail,
        subject: values.subject,
        message: values.message,
        senderName: user?.email || 'Broker CRM',
        templateId: values.templateId !== 'none' ? values.templateId : undefined,
        attachments: attachments,
        customerId: customerId
      });
      
      form.reset();
      setAttachments([]);
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={(val: string) => setCurrentTab(val as 'compose' | 'history')}>
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="compose">Compose Email</TabsTrigger>
        <TabsTrigger value="history">Email History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="compose">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Send Email to {customerName}</h3>
              <p className="text-sm text-muted-foreground">{customerEmail}</p>
            </div>
            
            <div className="mb-4">
              <FormLabel className="mb-2 block">Email Template</FormLabel>
              <RadioGroup 
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">No Template</Label>
                </div>
                
                {emailTemplates.map(template => (
                  <div key={template.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={template.id} id={template.id} />
                    <Label htmlFor={template.id}>{template.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Type your message here..." 
                      className="min-h-[150px]"
                      {...field} 
                      required 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="mb-2 block">Attachments</FormLabel>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  id="email-attachments" 
                  onChange={handleFileChange}
                  multiple
                  className="hidden" 
                />
                <Label 
                  htmlFor="email-attachments"
                  className="cursor-pointer px-3 py-2 border rounded flex items-center gap-2 hover:bg-gray-100"
                >
                  <Paperclip className="h-4 w-4" />
                  Attach Files
                </Label>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              
              <Button 
                type="submit"
                disabled={isSending}
                className="bg-gradient-to-r from-broker-primary to-broker-accent hover:shadow-md transition-all"
              >
                {isSending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="history">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Email History for {customerName}</h3>
          <p className="text-sm text-muted-foreground">Previous emails sent to this customer</p>
        </div>
        
        {isHistoryLoading ? (
          <div className="text-center py-8">Loading email history...</div>
        ) : emailHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No emails have been sent to this customer yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {emailHistory.map((email) => (
              <Dialog key={email.id}>
                <DialogTrigger asChild>
                  <div className="border rounded p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{email.subject}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(email.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {email.message.substring(0, 100)}...
                    </p>
                    {email.attachments && email.attachments.length > 0 && (
                      <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3 mr-1" />
                        {email.attachments.length} attachment(s)
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{email.subject}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <div><span className="font-medium">From:</span> {email.sender}</div>
                      <div><span className="font-medium">Date:</span> {format(new Date(email.created_at), 'MMM d, yyyy h:mm a')}</div>
                    </div>
                    <div className="border-t pt-4">
                      <div dangerouslySetInnerHTML={{ __html: email.message }} />
                    </div>
                    
                    {email.attachments && email.attachments.length > 0 && (
                      <div className="border-t mt-4 pt-4">
                        <h4 className="font-medium mb-2">Attachments:</h4>
                        <div className="space-y-2">
                          {email.attachments.map((path: string, index: number) => {
                            const fileName = path.split('/').pop();
                            return (
                              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm truncate">{fileName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EmailCustomerForm;
