
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BarChart3, GraduationCap, Clock, Users } from "lucide-react";
import DailyTaskAssignment from './DailyTaskAssignment';
import PerformanceTracking from './PerformanceTracking';
import TrainingReminders from './TrainingReminders';
import AttendanceTracking from './AttendanceTracking';

const EmployeeProductivityManager = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-quikle-primary/10 via-quikle-accent/8 to-quikle-secondary/10 p-6 rounded-xl border border-quikle-silver/20">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-quikle-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            Employee Productivity
          </h1>
        </div>
        <p className="text-quikle-slate text-sm">
          Manage tasks, track performance, monitor training, and oversee attendance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-quikle-silver/20 shadow-sm">
          <TabsTrigger 
            value="tasks" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Task Assignment
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="training" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger 
            value="attendance" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <DailyTaskAssignment />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceTracking />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <TrainingReminders />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeProductivityManager;
