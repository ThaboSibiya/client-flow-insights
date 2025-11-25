import React from 'react';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import BulkImportForm from '@/components/onboarding/BulkImportForm';
import CustomTemplateManager from '@/components/templates/CustomTemplateManager';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, User, FileSpreadsheet, Palette } from "lucide-react";

interface OnboardingProps {}

const Onboarding: React.FC<OnboardingProps> = () => {
  const { user } = useAuth();
  return <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">Customer Onboarding</h1>
        <p className="text-quikle-charcoal/70 mt-1 font-medium">Add new customers to your CRM system individually, in bulk, or create custom templates</p>
      </div>
      
      {user ? <>
          

          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="w-full overflow-x-auto flex md:grid md:grid-cols-3 bg-gradient-to-r from-quikle-crystal to-quikle-platinum border border-quikle-silver/30 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
              <TabsTrigger value="individual" className="flex items-center gap-2 flex-1 md:flex-initial data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white whitespace-nowrap">
                <User className="h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2 flex-1 md:flex-initial data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white whitespace-nowrap">
                <FileSpreadsheet className="h-4 w-4" />
                Bulk
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2 flex-1 md:flex-initial data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white whitespace-nowrap">
                <Palette className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual" className="mt-6">
              <OnboardingForm />
            </TabsContent>
            
            <TabsContent value="bulk" className="mt-6">
              <BulkImportForm />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-6">
              <CustomTemplateManager />
            </TabsContent>
          </Tabs>
        </> : <Alert className="bg-gradient-to-r from-quikle-crystal to-quikle-platinum border-quikle-neutral/30 text-quikle-charcoal shadow-platinum">
          <Info className="h-4 w-4 text-quikle-neutral" />
          <AlertTitle className="text-quikle-neutral font-semibold">Authentication required</AlertTitle>
          <AlertDescription className="text-quikle-slate">
            You need to be logged in to add customers to the system.
          </AlertDescription>
        </Alert>}
    </div>;
};
export default Onboarding;