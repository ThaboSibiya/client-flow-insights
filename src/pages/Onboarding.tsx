
import React, { useState } from 'react';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import BulkImportForm from '@/components/onboarding/BulkImportForm';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, User, FileSpreadsheet } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-broker-primary/20 via-broker-secondary/15 to-broker-accent/20 p-8 rounded-xl mb-6 shadow-lg border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">Customer Onboarding</h1>
        <p className="text-muted-foreground mt-1">Add new customers to your CRM system individually or in bulk</p>
      </div>
      
      {user ? (
        <>
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Data is being saved</AlertTitle>
            <AlertDescription>
              All customer information you add will be securely stored in your Supabase database.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Individual Customer
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
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
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <Info className="h-4 w-4" />
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            You need to be logged in to add customers to the system.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Onboarding;
