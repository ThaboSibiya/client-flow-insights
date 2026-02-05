 import React from 'react';
import { useAuth } from '@/context/AuthContext';
 import {
   WelcomeHero,
   QuickActions,
   QuickStats,
   RecentActivity,
   OnboardingProgress,
   FeatureHighlights,
 } from '@/components/welcome';

const Index = () => {
  const { user } = useAuth();
 
  return (
     <div className="min-h-[90vh] bg-background">
       <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
         {/* Hero Section */}
         <WelcomeHero />
 
         {/* Quick Actions */}
         <QuickActions />
 
         {/* Stats Overview - only for logged in users */}
         {user && <QuickStats />}
 
         {/* Main Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left Column - Activity */}
           <div className="lg:col-span-2 space-y-6">
             <RecentActivity />
             <FeatureHighlights />
           </div>
 
           {/* Right Column - Onboarding */}
           <div className="space-y-6">
             <OnboardingProgress />
           </div>
         </div>
      </div>
    </div>
  );
};

export default Index;
