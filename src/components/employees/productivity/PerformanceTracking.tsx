
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, Calendar, FileText, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PerformanceMetric {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  tasksCompleted: number;
  tasksAssigned: number;
  averageRating: number;
  hoursWorked: number;
  targetHours: number;
  customerSatisfaction: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  lastReportDate: string;
}

const PerformanceTracking = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([
    {
      id: '1',
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      department: 'Field Operations',
      tasksCompleted: 12,
      tasksAssigned: 15,
      averageRating: 4.5,
      hoursWorked: 38,
      targetHours: 40,
      customerSatisfaction: 92,
      weeklyTrend: 'up',
      lastReportDate: '2024-06-21',
    },
    {
      id: '2',
      employeeId: 'emp-002',
      employeeName: 'Sarah Johnson',
      department: 'Administration',
      tasksCompleted: 20,
      tasksAssigned: 22,
      averageRating: 4.8,
      hoursWorked: 40,
      targetHours: 40,
      customerSatisfaction: 95,
      weeklyTrend: 'up',
      lastReportDate: '2024-06-21',
    },
    {
      id: '3',
      employeeId: 'emp-003',
      employeeName: 'Mike Wilson',
      department: 'Customer Service',
      tasksCompleted: 8,
      tasksAssigned: 12,
      averageRating: 3.8,
      hoursWorked: 35,
      targetHours: 40,
      customerSatisfaction: 78,
      weeklyTrend: 'down',
      lastReportDate: '2024-06-21',
    },
  ]);

  const generateWeeklyReport = () => {
    toast({
      title: "Report Generated",
      description: "Weekly performance reports have been generated and will be sent to managers",
    });
  };

  const sendPerformanceReport = (employeeId: string) => {
    const employee = performanceData.find(emp => emp.employeeId === employeeId);
    toast({
      title: "Report Sent",
      description: `Performance report sent to ${employee?.employeeName}`,
    });
  };

  const getCompletionRate = (completed: number, assigned: number) => {
    return assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
  };

  const getPerformanceGrade = (rating: number) => {
    if (rating >= 4.5) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (rating >= 4.0) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (rating >= 3.5) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    return { grade: 'D', color: 'bg-red-100 text-red-800' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredData = selectedDepartment === 'all' 
    ? performanceData 
    : performanceData.filter(emp => emp.department === selectedDepartment);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Performance Tracking</h3>
          <p className="text-sm text-muted-foreground">Monitor employee performance and generate automated reports</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Field Operations">Field Operations</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Customer Service">Customer Service</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={generateWeeklyReport} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">
                  {filteredData.reduce((sum, emp) => sum + emp.tasksCompleted, 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-quikle-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredData.reduce((sum, emp) => sum + getCompletionRate(emp.tasksCompleted, emp.tasksAssigned), 0) / filteredData.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {(filteredData.reduce((sum, emp) => sum + emp.averageRating, 0) / filteredData.length).toFixed(1)}
                </p>
              </div>
              <div className="text-yellow-500">★</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredData.reduce((sum, emp) => sum + emp.customerSatisfaction, 0) / filteredData.length)}%
                </p>
              </div>
              <div className="text-blue-500">😊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Performance Cards */}
      <div className="grid gap-4">
        {filteredData.map((employee) => {
          const completionRate = getCompletionRate(employee.tasksCompleted, employee.tasksAssigned);
          const hoursRate = Math.round((employee.hoursWorked / employee.targetHours) * 100);
          const performanceGrade = getPerformanceGrade(employee.averageRating);

          return (
            <Card key={employee.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{employee.employeeName}</h4>
                      <Badge variant="outline">{employee.department}</Badge>
                      <Badge className={performanceGrade.color}>
                        Grade {performanceGrade.grade}
                      </Badge>
                      {getTrendIcon(employee.weeklyTrend)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last report: {new Date(employee.lastReportDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendPerformanceReport(employee.employeeId)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send Report
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Task Completion</span>
                      <span>{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {employee.tasksCompleted}/{employee.tasksAssigned} tasks
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hours Target</span>
                      <span>{hoursRate}%</span>
                    </div>
                    <Progress value={hoursRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {employee.hoursWorked}/{employee.targetHours} hours
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg Rating</span>
                      <span>{employee.averageRating}/5</span>
                    </div>
                    <Progress value={(employee.averageRating / 5) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Performance rating
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customer Satisfaction</span>
                      <span>{employee.customerSatisfaction}%</span>
                    </div>
                    <Progress value={employee.customerSatisfaction} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Client feedback
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No performance data available for the selected filters</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceTracking;
