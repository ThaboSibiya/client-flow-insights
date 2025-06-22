
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, CalendarDays, DollarSign, Download, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  hoursWorked: number;
  overtime: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hourlyRate: number;
  totalPay: number;
  notes?: string;
}

const AttendanceTracking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      department: 'Field Operations',
      date: '2024-06-22',
      checkInTime: '08:00',
      checkOutTime: '17:30',
      hoursWorked: 8.5,
      overtime: 0.5,
      status: 'present',
      hourlyRate: 25,
      totalPay: 212.5,
    },
    {
      id: '2',
      employeeId: 'emp-002',
      employeeName: 'Sarah Johnson',
      department: 'Administration',
      date: '2024-06-22',
      checkInTime: '09:15',
      checkOutTime: '17:00',
      hoursWorked: 7.75,
      overtime: 0,
      status: 'late',
      hourlyRate: 22,
      totalPay: 170.5,
      notes: 'Arrived late due to traffic',
    },
    {
      id: '3',
      employeeId: 'emp-003',
      employeeName: 'Mike Wilson',
      department: 'Customer Service',
      date: '2024-06-22',
      checkInTime: '08:30',
      checkOutTime: '12:30',
      hoursWorked: 4,
      overtime: 0,
      status: 'half-day',
      hourlyRate: 20,
      totalPay: 80,
      notes: 'Medical appointment',
    },
  ]);

  const processPayroll = () => {
    const totalPayroll = attendanceRecords.reduce((sum, record) => sum + record.totalPay, 0);
    
    toast({
      title: "Payroll Processed",
      description: `Payroll data prepared for ${attendanceRecords.length} employees. Total: $${totalPayroll.toFixed(2)}`,
    });
  };

  const exportAttendance = () => {
    toast({
      title: "Export Started",
      description: "Attendance data is being prepared for download",
    });
  };

  const markCheckIn = (employeeId: string) => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    setAttendanceRecords(prev => prev.map(record => 
      record.employeeId === employeeId && record.date === format(now, 'yyyy-MM-dd')
        ? { ...record, checkInTime: currentTime, status: 'present' }
        : record
    ));

    toast({
      title: "Check-in Recorded",
      description: `Employee checked in at ${currentTime}`,
    });
  };

  const markCheckOut = (employeeId: string) => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    
    setAttendanceRecords(prev => prev.map(record => {
      if (record.employeeId === employeeId && record.date === format(now, 'yyyy-MM-dd')) {
        // Calculate hours worked
        const checkIn = new Date(`${record.date}T${record.checkInTime}`);
        const checkOut = new Date(`${record.date}T${currentTime}`);
        const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        const overtime = Math.max(0, hoursWorked - 8);
        const totalPay = (hoursWorked * record.hourlyRate) + (overtime * record.hourlyRate * 0.5);

        return {
          ...record,
          checkOutTime: currentTime,
          hoursWorked: Number(hoursWorked.toFixed(2)),
          overtime: Number(overtime.toFixed(2)),
          totalPay: Number(totalPay.toFixed(2))
        };
      }
      return record;
    }));

    toast({
      title: "Check-out Recorded",
      description: `Employee checked out at ${currentTime}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half-day': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesEmployee = selectedEmployee === 'all' || record.employeeId === selectedEmployee;
    const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
    const matchesDate = record.date === format(selectedDate, 'yyyy-MM-dd');
    return matchesEmployee && matchesDepartment && matchesDate;
  });

  const totalHours = filteredRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
  const totalOvertime = filteredRecords.reduce((sum, record) => sum + record.overtime, 0);
  const totalPayroll = filteredRecords.reduce((sum, record) => sum + record.totalPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Attendance Tracking</h3>
          <p className="text-sm text-muted-foreground">Monitor attendance and integrate with payroll systems</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportAttendance} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={processPayroll} className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filters:</Label>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {format(selectedDate, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="emp-001">John Smith</SelectItem>
                <SelectItem value="emp-002">Sarah Johnson</SelectItem>
                <SelectItem value="emp-003">Mike Wilson</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-quikle-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overtime</p>
                <p className="text-2xl font-bold">{totalOvertime.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{filteredRecords.length}</p>
              </div>
              <div className="text-blue-500">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pay</p>
                <p className="text-2xl font-bold">${totalPayroll.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{record.employeeName}</h4>
                    <Badge variant="outline">{record.department}</Badge>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Check In:</span>
                      <br />
                      <span className="font-medium">{record.checkInTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check Out:</span>
                      <br />
                      <span className="font-medium">{record.checkOutTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hours:</span>
                      <br />
                      <span className="font-medium">{record.hoursWorked}h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Overtime:</span>
                      <br />
                      <span className="font-medium">{record.overtime}h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <br />
                      <span className="font-medium">${record.hourlyRate}/h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Pay:</span>
                      <br />
                      <span className="font-medium">${record.totalPay.toFixed(2)}</span>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Notes:</strong> {record.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!record.checkInTime && (
                    <Button size="sm" onClick={() => markCheckIn(record.employeeId)}>
                      Check In
                    </Button>
                  )}
                  {record.checkInTime && !record.checkOutTime && (
                    <Button size="sm" variant="outline" onClick={() => markCheckOut(record.employeeId)}>
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No attendance records found for the selected date and filters</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
