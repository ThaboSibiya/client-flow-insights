
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  User, 
  Briefcase, 
  Shield, 
  ChevronDown, 
  Save, 
  X,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { EmployeeFormProps } from '../types';

const MobileEmployeeForm = ({ employee, onSave, onCancel }: EmployeeFormProps) => {
  const { formData, loading, handleInputChange, handleSubmit } = useEmployeeForm(employee, onSave);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    contact: false,
    role: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formSteps = [
    {
      id: 'basic',
      title: 'Basic Info',
      icon: User,
      fields: ['first_name', 'last_name', 'employee_number']
    },
    {
      id: 'contact',
      title: 'Contact',
      icon: Phone,
      fields: ['email', 'phone']
    },
    {
      id: 'role',
      title: 'Role & Details',
      icon: Briefcase,
      fields: ['title', 'designation', 'department', 'role', 'status', 'hire_date']
    }
  ];

  const isStepComplete = (stepId: string) => {
    const step = formSteps.find(s => s.id === stepId);
    if (!step) return false;
    
    return step.fields.every(field => {
      const value = formData[field as keyof typeof formData];
      return value && value.toString().trim() !== '';
    });
  };

  const nextStep = () => {
    if (activeStep < formSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {formSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === activeStep;
              const isComplete = isStepComplete(step.id);
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                    isActive 
                      ? 'bg-quikle-primary text-white' 
                      : isComplete 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <StepIcon className="h-3 w-3" />
                  <span>{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent className="p-4">
          {/* Step 0: Basic Info */}
          {activeStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="John"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Doe"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Contact Info */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@company.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Role & Details */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Software Engineer"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Engineering"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="hire_date">Hire Date *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={activeStep === 0 ? onCancel : prevStep}
              className="flex-1 mr-2"
            >
              {activeStep === 0 ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                'Previous'
              )}
            </Button>
            
            {activeStep === formSteps.length - 1 ? (
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 ml-2 bg-quikle-primary hover:bg-quikle-secondary"
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepComplete(formSteps[activeStep].id)}
                className="flex-1 ml-2 bg-quikle-primary hover:bg-quikle-secondary"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default MobileEmployeeForm;
