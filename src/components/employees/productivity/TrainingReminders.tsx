
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, AlertTriangle, CheckCircle, Calendar, Plus, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Certification {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  certificationName: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired' | 'pending-renewal';
  issuer: string;
  reminderSent: boolean;
  daysUntilExpiry: number;
}

const TrainingReminders = () => {
  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: '1',
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      department: 'Field Operations',
      certificationName: 'Safety Training Certification',
      issuedDate: '2023-06-15',
      expiryDate: '2024-06-15',
      status: 'expired',
      issuer: 'OSHA',
      reminderSent: true,
      daysUntilExpiry: -7,
    },
    {
      id: '2',
      employeeId: 'emp-002',
      employeeName: 'Sarah Johnson',
      department: 'Administration',
      certificationName: 'First Aid Certification',
      issuedDate: '2023-08-20',
      expiryDate: '2024-08-20',
      status: 'expiring',
      issuer: 'Red Cross',
      reminderSent: false,
      daysUntilExpiry: 59,
    },
    {
      id: '3',
      employeeId: 'emp-003',
      employeeName: 'Mike Wilson',
      department: 'Technical',
      certificationName: 'Equipment Operation License',
      issuedDate: '2024-01-10',
      expiryDate: '2025-01-10',
      status: 'active',
      issuer: 'Industry Board',
      reminderSent: false,
      daysUntilExpiry: 202,
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCertification, setNewCertification] = useState({
    employeeId: '',
    certificationName: '',
    issuedDate: '',
    expiryDate: '',
    issuer: '',
  });

  const addCertification = () => {
    if (!newCertification.employeeId || !newCertification.certificationName || !newCertification.expiryDate) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const expiryDate = new Date(newCertification.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: Certification['status'] = 'active';
    if (daysUntilExpiry < 0) status = 'expired';
    else if (daysUntilExpiry <= 30) status = 'expiring';

    const certification: Certification = {
      id: `cert-${Date.now()}`,
      ...newCertification,
      employeeName: `Employee ${newCertification.employeeId}`,
      department: 'General',
      status,
      reminderSent: false,
      daysUntilExpiry,
    };

    setCertifications(prev => [...prev, certification]);
    setNewCertification({
      employeeId: '',
      certificationName: '',
      issuedDate: '',
      expiryDate: '',
      issuer: '',
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Certification Added",
      description: `${certification.certificationName} has been added for tracking`,
    });
  };

  const sendReminder = (certId: string) => {
    setCertifications(prev => prev.map(cert =>
      cert.id === certId ? { ...cert, reminderSent: true } : cert
    ));

    const cert = certifications.find(c => c.id === certId);
    toast({
      title: "Reminder Sent",
      description: `Training reminder sent to ${cert?.employeeName}`,
    });
  };

  const markAsRenewed = (certId: string) => {
    setCertifications(prev => prev.map(cert =>
      cert.id === certId 
        ? { 
            ...cert, 
            status: 'active',
            reminderSent: false,
            daysUntilExpiry: 365 // Reset to 1 year
          } 
        : cert
    ));

    toast({
      title: "Certification Renewed",
      description: "Certification status has been updated",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending-renewal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'expiring': case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return <GraduationCap className="h-4 w-4" />;
    }
  };

  const criticalCertifications = certifications.filter(cert => 
    cert.status === 'expired' || cert.status === 'expiring'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Training & Certification Reminders</h3>
          <p className="text-sm text-muted-foreground">Track certification renewals and send automated reminders</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Employee</Label>
                <Select value={newCertification.employeeId} onValueChange={(value) => setNewCertification(prev => ({ ...prev, employeeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emp-001">John Smith</SelectItem>
                    <SelectItem value="emp-002">Sarah Johnson</SelectItem>
                    <SelectItem value="emp-003">Mike Wilson</SelectItem>
                    <SelectItem value="emp-004">Lisa Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Certification Name</Label>
                <Input
                  value={newCertification.certificationName}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, certificationName: e.target.value }))}
                  placeholder="e.g., Safety Training, First Aid..."
                />
              </div>

              <div>
                <Label>Issuing Organization</Label>
                <Input
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder="e.g., OSHA, Red Cross..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Issued Date</Label>
                  <Input
                    type="date"
                    value={newCertification.issuedDate}
                    onChange={(e) => setNewCertification(prev => ({ ...prev, issuedDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={newCertification.expiryDate}
                    onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addCertification}>
                  Add Certification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Critical Alerts */}
      {criticalCertifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Certification Alerts ({criticalCertifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalCertifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{cert.employeeName} - {cert.certificationName}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.status === 'expired' 
                        ? `Expired ${Math.abs(cert.daysUntilExpiry)} days ago`
                        : `Expires in ${cert.daysUntilExpiry} days`
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!cert.reminderSent && (
                      <Button size="sm" variant="outline" onClick={() => sendReminder(cert.id)}>
                        <Bell className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    )}
                    <Button size="sm" onClick={() => markAsRenewed(cert.id)}>
                      Mark Renewed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Certifications */}
      <div className="grid gap-4">
        {certifications.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{cert.certificationName}</h4>
                    <Badge className={getStatusColor(cert.status)}>
                      {getStatusIcon(cert.status)}
                      {cert.status}
                    </Badge>
                    {cert.reminderSent && (
                      <Badge variant="outline">
                        <Bell className="h-3 w-3 mr-1" />
                        Reminder Sent
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Employee:</strong> {cert.employeeName}
                    </div>
                    <div>
                      <strong>Department:</strong> {cert.department}
                    </div>
                    <div>
                      <strong>Issuer:</strong> {cert.issuer}
                    </div>
                    <div>
                      <strong>Expires:</strong> {new Date(cert.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {cert.daysUntilExpiry <= 30 && cert.daysUntilExpiry > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      ⚠️ Expires in {cert.daysUntilExpiry} days
                    </div>
                  )}
                  
                  {cert.daysUntilExpiry < 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      🚨 Expired {Math.abs(cert.daysUntilExpiry)} days ago
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!cert.reminderSent && cert.status !== 'active' && (
                    <Button size="sm" variant="outline" onClick={() => sendReminder(cert.id)}>
                      <Bell className="h-4 w-4 mr-1" />
                      Send Reminder
                    </Button>
                  )}
                  {cert.status !== 'active' && (
                    <Button size="sm" onClick={() => markAsRenewed(cert.id)}>
                      Mark Renewed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certifications.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No certifications tracked yet</p>
        </div>
      )}
    </div>
  );
};

export default TrainingReminders;
