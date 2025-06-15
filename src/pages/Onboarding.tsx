
import React from 'react';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import BulkImportForm from '@/components/onboarding/BulkImportForm';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, User, FileSpreadsheet } from "lucide-react";
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';
import EmployeeSetup from '@/components/onboarding/EmployeeSetup';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

const Onboarding = () => {
  const { user } = useAuth();
  const { data: employee, isLoading } = useEmployeeProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is logged in but has no employee profile, show the setup form.
  if (user && !employee) {
    return <EmployeeSetup />;
  }

  // This is the original content for customer onboarding.
  // It will be shown to users who already have a profile.
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-secondary/15 to-quikle-accent/20 p-8 rounded-xl mb-6 shadow-luxury border border-quikle-silver/30 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-sm">Customer Onboarding</h1>
        <p className="text-quikle-slate mt-1">Add new customers to your CRM system individually or in bulk</p>
      </div>
      
      {user ? (
        <>
          <Alert className="bg-gradient-to-r from-quikle-crystal to-quikle-platinum border-quikle-primary/30 text-quikle-charcoal mb-4 shadow-platinum">
            <Info className="h-4 w-4 text-quikle-primary" />
            <AlertTitle className="text-quikle-primary font-semibold">Data is being saved</AlertTitle>
            <AlertDescription className="text-quikle-slate">
              All customer information you add will be securely stored in your Supabase database.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-quikle-crystal to-quikle-platinum border border-quikle-silver/30">
              <TabsTrigger value="individual" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white">
                <User className="h-4 w-4" />
                Individual Customer
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white">
                <FileSpreadsheet className="h-4 w-4" />
                Bulk Import
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual" className="mt-6">
              <OnboardingForm />
            </TabsContent>
            
            <TabsContent value="bulk" className="mt-6">
              <BulkImportForm />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Alert className="bg-gradient-to-r from-quikle-crystal to-quikle-platinum border-quikle-neutral/30 text-quikle-charcoal shadow-platinum">
          <Info className="h-4 w-4 text-quikle-neutral" />
          <AlertTitle className="text-quikle-neutral font-semibold">Authentication required</AlertTitle>
          <AlertDescription className="text-quikle-slate">
            You need to be logged in to add customers to the system.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Onboarding;
