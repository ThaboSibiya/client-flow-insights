
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

const TasksManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Task Management
        </CardTitle>
        <CardDescription>
          Manage tasks for your AI agents here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">This feature is under development.</p>
          <p className="text-sm text-muted-foreground">Soon you'll be able to create, assign, and track tasks for your agents.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksManager;
