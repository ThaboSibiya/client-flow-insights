import { useState, useCallback, useMemo } from 'react';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { templateService } from '@/services/templateService';
import { addCustomer as addCustomerService } from '@/services/customerService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CustomerStatus } from '@/context/CRMContext';

export type OnboardingMode = 'select' | 'individual' | 'bulk' | 'template';
export type WizardStep = 'template' | 'basic' | 'fields' | 'review';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
}

interface UseOnboardingWizardReturn {
  // Mode selection
  mode: OnboardingMode;
  setMode: (mode: OnboardingMode) => void;
  
  // Wizard steps
  currentStep: WizardStep;
  stepIndex: number;
  steps: WizardStep[];
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  progress: number;
  
  // Template
  selectedTemplate: IndustryTemplate | null;
  selectTemplate: (template: IndustryTemplate | null) => void;
  templateFields: TemplateField[];
  fieldsLoading: boolean;
  
  // Customer data
  customerData: CustomerData;
  updateCustomerData: (field: keyof CustomerData, value: string) => void;
  
  // Custom field values
  customFieldValues: Record<string, string>;
  updateCustomFieldValue: (fieldId: string, value: string) => void;
  
  // Validation
  validateBasicInfo: () => boolean;
  validateTemplateFields: () => boolean;
  
  // Submission
  isSubmitting: boolean;
  submitCustomer: () => Promise<boolean>;
  
  // Reset
  reset: () => void;
}

const STEPS: WizardStep[] = ['template', 'basic', 'fields', 'review'];

const DEFAULT_CUSTOMER_DATA: CustomerData = {
  name: '',
  email: '',
  phone: '',
  status: 'new',
  notes: '',
};

export const useOnboardingWizard = (): UseOnboardingWizardReturn => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mode & step state
  const [mode, setMode] = useState<OnboardingMode>('select');
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  
  // Customer data state
  const [customerData, setCustomerData] = useState<CustomerData>(DEFAULT_CUSTOMER_DATA);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Computed values
  const stepIndex = useMemo(() => STEPS.indexOf(currentStep), [currentStep]);
  const progress = useMemo(() => ((stepIndex + 1) / STEPS.length) * 100, [stepIndex]);
  
  // Template selection with field loading
  const selectTemplate = useCallback(async (template: IndustryTemplate | null) => {
    setSelectedTemplate(template);
    
    if (template) {
      setFieldsLoading(true);
      try {
        const fields = await templateService.getTemplateFields(template.id);
        setTemplateFields(fields);
        
        // Initialize field values
        const initialValues: Record<string, string> = {};
        fields.forEach(field => {
          initialValues[field.id] = '';
        });
        setCustomFieldValues(initialValues);
      } catch (error) {
        console.error('Failed to load template fields:', error);
        toast({
          title: "Error",
          description: "Failed to load template fields",
          variant: "destructive",
        });
      } finally {
        setFieldsLoading(false);
      }
    } else {
      setTemplateFields([]);
      setCustomFieldValues({});
    }
  }, []);
  
  // Update customer data
  const updateCustomerData = useCallback((field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Update custom field value
  const updateCustomFieldValue = useCallback((fieldId: string, value: string) => {
    setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);
  
  // Validation
  const validateBasicInfo = useCallback((): boolean => {
    const errors: string[] = [];
    
    if (!customerData.name || customerData.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    if (!customerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!customerData.phone || customerData.phone.length < 5) {
      errors.push('Please enter a valid phone number');
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [customerData]);
  
  const validateTemplateFields = useCallback((): boolean => {
    if (!selectedTemplate) return true;
    
    const requiredFields = templateFields.filter(f => f.is_required);
    const missingFields = requiredFields.filter(f => 
      !customFieldValues[f.id] || customFieldValues[f.id].trim() === ''
    );
    
    if (missingFields.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: `Please fill in: ${missingFields.map(f => f.field_label).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [selectedTemplate, templateFields, customFieldValues]);
  
  // Navigation
  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'template':
        return true; // Template is optional
      case 'basic':
        return customerData.name.length >= 2 && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email) && 
               customerData.phone.length >= 5;
      case 'fields':
        if (!selectedTemplate) return true;
        const requiredFields = templateFields.filter(f => f.is_required);
        return requiredFields.every(f => customFieldValues[f.id]?.trim());
      case 'review':
        return true;
      default:
        return false;
    }
  }, [currentStep, customerData, selectedTemplate, templateFields, customFieldValues]);
  
  const canGoPrev = useMemo(() => stepIndex > 0, [stepIndex]);
  
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);
  
  const nextStep = useCallback(() => {
    // Validate current step before proceeding
    if (currentStep === 'basic' && !validateBasicInfo()) return;
    if (currentStep === 'fields' && !validateTemplateFields()) return;
    
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      // Skip fields step if no template selected
      if (STEPS[nextIndex] === 'fields' && !selectedTemplate) {
        setCurrentStep('review');
      } else {
        setCurrentStep(STEPS[nextIndex]);
      }
    }
  }, [stepIndex, currentStep, selectedTemplate, validateBasicInfo, validateTemplateFields]);
  
  const prevStep = useCallback(() => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      // Skip fields step if no template selected
      if (STEPS[prevIndex] === 'fields' && !selectedTemplate) {
        setCurrentStep('basic');
      } else {
        setCurrentStep(STEPS[prevIndex]);
      }
    }
  }, [stepIndex, selectedTemplate]);
  
  // Submit customer
  const submitCustomer = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add customers",
        variant: "destructive",
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create customer
      const newCustomer = await addCustomerService({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        status: customerData.status,
        notes: customerData.notes,
        activeTickets: [],
        ticketCount: 0
      }, user.id);
      
      if (!newCustomer) {
        throw new Error('Failed to create customer');
      }
      
      // Save template data if applicable
      if (selectedTemplate && Object.keys(customFieldValues).length > 0) {
        await templateService.applyTemplateToCustomer(newCustomer.id, selectedTemplate.id, user.id);
        
        const savePromises = Object.entries(customFieldValues)
          .filter(([_, value]) => {
            const stringValue = typeof value === 'string' ? value : String(value);
            return stringValue.trim();
          })
          .map(([fieldId, value]) => {
            const stringValue = typeof value === 'string' ? value : String(value);
            return templateService.saveCustomFieldData(newCustomer.id, fieldId, stringValue, user.id);
          });
        
        await Promise.all(savePromises);
        
        toast({
          title: "Success! 🎉",
          description: `${customerData.name} has been successfully onboarded with ${selectedTemplate.name} template.`,
        });
      } else {
        toast({
          title: "Success! 🎉",
          description: `${customerData.name} has been successfully onboarded.`,
        });
      }
      
      // Navigate to customers
      setTimeout(() => navigate('/customers'), 500);
      return true;
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Error",
        description: `Failed to add customer: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, customerData, selectedTemplate, customFieldValues, navigate]);
  
  // Reset wizard
  const reset = useCallback(() => {
    setMode('select');
    setCurrentStep('template');
    setSelectedTemplate(null);
    setTemplateFields([]);
    setCustomFieldValues({});
    setCustomerData(DEFAULT_CUSTOMER_DATA);
  }, []);
  
  return {
    mode,
    setMode,
    currentStep,
    stepIndex,
    steps: STEPS,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    progress,
    selectedTemplate,
    selectTemplate,
    templateFields,
    fieldsLoading,
    customerData,
    updateCustomerData,
    customFieldValues,
    updateCustomFieldValue,
    validateBasicInfo,
    validateTemplateFields,
    isSubmitting,
    submitCustomer,
    reset,
  };
};
