
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Download, Share, Copy } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title: string;
  department?: string;
  employee_number: string;
}

interface EmployeeQRCodeProps {
  employee: Employee;
  size?: number;
}

const EmployeeQRCode = ({ employee, size = 200 }: EmployeeQRCodeProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVCard = (employee: Employee): string => {
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${employee.first_name} ${employee.last_name}`,
      `N:${employee.last_name};${employee.first_name};;;`,
      `EMAIL:${employee.email}`,
      employee.phone ? `TEL:${employee.phone}` : '',
      `TITLE:${employee.title}`,
      employee.department ? `ORG:${employee.department}` : '',
      `NOTE:Employee ID: ${employee.employee_number}`,
      'END:VCARD'
    ].filter(line => line !== '').join('\n');

    return vCard;
  };

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const vCardData = generateVCard(employee);
      const encodedData = encodeURIComponent(vCardData);
      
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png&ecc=M`;
      
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [employee, size]);

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${employee.first_name}_${employee.last_name}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "QR code downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      });
    }
  };

  const shareQRCode = async () => {
    if (!navigator.share || !qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `${employee.first_name}_${employee.last_name}_QR.png`, { type: 'image/png' });

      await navigator.share({
        title: `${employee.first_name} ${employee.last_name} - Contact Info`,
        text: `Contact information for ${employee.first_name} ${employee.last_name}`,
        files: [file]
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast({
        title: "Error",
        description: "Failed to share QR code",
        variant: "destructive"
      });
    }
  };

  const copyContactInfo = async () => {
    const contactInfo = `${employee.first_name} ${employee.last_name}
Email: ${employee.email}
${employee.phone ? `Phone: ${employee.phone}` : ''}
Title: ${employee.title}
${employee.department ? `Department: ${employee.department}` : ''}
Employee ID: ${employee.employee_number}`;

    try {
      await navigator.clipboard.writeText(contactInfo);
      toast({
        title: "Success",
        description: "Contact information copied to clipboard"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy contact information",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-1" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Employee QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-center">
                {employee.first_name} {employee.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isGenerating ? (
                <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quikle-primary"></div>
                </div>
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${employee.first_name} ${employee.last_name}`}
                  className="border border-gray-200 rounded-lg"
                  width={size}
                  height={size}
                />
              ) : (
                <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-xs text-center text-gray-600">
            Scan to save contact information
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            
            {navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={shareQRCode}
                disabled={!qrCodeUrl}
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyContactInfo}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Info
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeQRCode;
