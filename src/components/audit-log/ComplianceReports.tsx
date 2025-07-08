
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Shield, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ComplianceReport {
  id: string;
  name: string;
  description: string;
  type: 'GDPR' | 'SOX' | 'HIPAA' | 'ISO27001' | 'Custom';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  lastGenerated: string;
  status: 'Current' | 'Pending' | 'Overdue';
  requirements: string[];
}

const ComplianceReports = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const complianceReports: ComplianceReport[] = [
    {
      id: '1',
      name: 'GDPR Data Access Report',
      description: 'Report on personal data access and processing activities',
      type: 'GDPR',
      frequency: 'Monthly',
      lastGenerated: '2024-01-01T10:00:00Z',
      status: 'Current',
      requirements: ['Data access logs', 'Processing activities', 'Consent records']
    },
    {
      id: '2',
      name: 'SOX IT Controls Report',
      description: 'Internal controls over financial reporting systems',
      type: 'SOX',
      frequency: 'Quarterly',
      lastGenerated: '2023-12-15T14:30:00Z',
      status: 'Pending',
      requirements: ['System access controls', 'Change management', 'Data integrity']
    },
    {
      id: '3',
      name: 'ISO 27001 Security Audit',
      description: 'Information security management system audit',
      type: 'ISO27001',
      frequency: 'Annually',
      lastGenerated: '2023-11-01T09:00:00Z',
      status: 'Overdue',
      requirements: ['Access management', 'Incident handling', 'Risk assessment']
    },
    {
      id: '4',
      name: 'Employee Access Review',
      description: 'Periodic review of employee system access rights',
      type: 'Custom',
      frequency: 'Quarterly',
      lastGenerated: '2024-01-05T16:00:00Z',
      status: 'Current',
      requirements: ['User privileges', 'Role assignments', 'Access certifications']
    }
  ];

  const filteredReports = selectedReportType === 'all' 
    ? complianceReports 
    : complianceReports.filter(report => report.type === selectedReportType);

  const generateReport = async (reportId: string) => {
    setGeneratingReport(reportId);
    
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(null);
      toast({
        title: "Report Generated",
        description: "Compliance report has been generated and is ready for download"
      });
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Current':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GDPR':
        return 'bg-blue-100 text-blue-800';
      case 'SOX':
        return 'bg-purple-100 text-purple-800';
      case 'HIPAA':
        return 'bg-green-100 text-green-800';
      case 'ISO27001':
        return 'bg-orange-100 text-orange-800';
      case 'Custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-quikle-charcoal">Compliance Reports</h2>
          <p className="text-sm text-quikle-slate">Generate and manage compliance audit reports</p>
        </div>
        
        <Select value={selectedReportType} onValueChange={setSelectedReportType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="GDPR">GDPR</SelectItem>
            <SelectItem value="SOX">SOX</SelectItem>
            <SelectItem value="HIPAA">HIPAA</SelectItem>
            <SelectItem value="ISO27001">ISO 27001</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge className={getTypeColor(report.type)}>
                      {report.type}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-quikle-slate">{report.description}</p>
                </div>
                
                <Button
                  onClick={() => generateReport(report.id)}
                  disabled={generatingReport === report.id}
                  size="sm"
                >
                  {generatingReport === report.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-quikle-slate" />
                    <span className="text-quikle-slate">Frequency:</span>
                    <span className="font-medium">{report.frequency}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-quikle-slate" />
                    <span className="text-quikle-slate">Last Generated:</span>
                    <span className="font-medium">
                      {new Date(report.lastGenerated).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-quikle-slate" />
                    <span className="text-quikle-slate">Requirements:</span>
                    <span className="font-medium">{report.requirements.length}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-quikle-charcoal mb-2">Coverage Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.requirements.map((requirement, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {requirement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No Reports Found</h3>
            <p className="text-quikle-slate">No compliance reports match your current filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceReports;
