
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Play, Pause, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { EnhancedAutomationExecutor } from '@/utils/enhancedAutomationExecutor';

interface BulkOperation {
  id: string;
  name: string;
  automationId: string;
  recordCount: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: {
    successful: number;
    failed: number;
  };
}

const BulkOperationsManager = () => {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState('');
  const [recordCount, setRecordCount] = useState('');
  const [operationName, setOperationName] = useState('');

  const createBulkOperation = () => {
    if (!selectedAutomation || !recordCount || !operationName) {
      toast.error('Please fill in all fields');
      return;
    }

    const newOperation: BulkOperation = {
      id: Date.now().toString(),
      name: operationName,
      automationId: selectedAutomation,
      recordCount: parseInt(recordCount),
      status: 'pending',
      progress: 0
    };

    setOperations(prev => [newOperation, ...prev]);
    setOperationName('');
    setRecordCount('');
    toast.success('Bulk operation created');
  };

  const runBulkOperation = async (operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    if (!operation) return;

    setOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, status: 'running' as const } : op
    ));

    try {
      // Simulate bulk execution
      const batchSize = 10;
      const totalBatches = Math.ceil(operation.recordCount / batchSize);
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < totalBatches; i++) {
        // Simulate processing batch
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const currentBatchSize = Math.min(batchSize, operation.recordCount - (i * batchSize));
        const batchResults = await simulateBatchExecution(operation.automationId, currentBatchSize);
        
        successful += batchResults.successful;
        failed += batchResults.failed;
        
        const progress = ((i + 1) / totalBatches) * 100;
        
        setOperations(prev => prev.map(op => 
          op.id === operationId ? { 
            ...op, 
            progress,
            results: { successful, failed }
          } : op
        ));
      }

      setOperations(prev => prev.map(op => 
        op.id === operationId ? { 
          ...op, 
          status: 'completed' as const,
          progress: 100,
          results: { successful, failed }
        } : op
      ));

      toast.success(`Bulk operation completed: ${successful} successful, ${failed} failed`);
    } catch (error) {
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'failed' as const } : op
      ));
      toast.error('Bulk operation failed');
    }
  };

  const simulateBatchExecution = async (automationId: string, count: number) => {
    // Mock batch execution results
    const successful = Math.floor(Math.random() * count);
    const failed = count - successful;
    return { successful, failed };
  };

  const getStatusIcon = (status: BulkOperation['status']) => {
    switch (status) {
      case 'pending': return <Pause className="h-4 w-4 text-gray-500" />;
      case 'running': return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Operation Name</label>
              <Input
                value={operationName}
                onChange={(e) => setOperationName(e.target.value)}
                placeholder="Bulk customer update..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Automation</label>
              <Select value={selectedAutomation} onValueChange={setSelectedAutomation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select automation..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome-customers">Welcome New Customers</SelectItem>
                  <SelectItem value="follow-up">Follow-up Reminder</SelectItem>
                  <SelectItem value="priority-alert">High Priority Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Record Count</label>
              <Input
                type="number"
                value={recordCount}
                onChange={(e) => setRecordCount(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          <Button onClick={createBulkOperation} className="w-full md:w-auto">
            Create Bulk Operation
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {operations.map((operation) => (
          <Card key={operation.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(operation.status)}
                  <h3 className="font-medium">{operation.name}</h3>
                  <Badge variant="outline">{operation.recordCount} records</Badge>
                </div>
                {operation.status === 'pending' && (
                  <Button size="sm" onClick={() => runBulkOperation(operation.id)}>
                    Run
                  </Button>
                )}
              </div>
              
              {operation.status === 'running' && (
                <div className="space-y-2">
                  <Progress value={operation.progress} />
                  <div className="text-sm text-muted-foreground">
                    Progress: {Math.round(operation.progress)}%
                  </div>
                </div>
              )}
              
              {operation.results && (
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">
                    ✓ {operation.results.successful} successful
                  </span>
                  <span className="text-red-600">
                    ✗ {operation.results.failed} failed
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BulkOperationsManager;
