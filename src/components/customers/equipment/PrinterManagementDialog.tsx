
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Printer, Wrench, Calendar, X, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Customer, CustomerTicket } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';
import { useTicketManagement } from '@/hooks/useTicketManagement';

interface PrinterEquipment {
  id: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date?: string;
  warranty_expiry?: string;
  technical_issues?: string;
  notes?: string;
  linked_ticket_id?: string;
  status: 'active' | 'maintenance' | 'retired';
}

interface PrinterManagementDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const PrinterManagementDialog = ({ customer, isOpen, onClose }: PrinterManagementDialogProps) => {
  const [printers, setPrinters] = useState<PrinterEquipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterEquipment | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { handleCreateTicket } = useTicketManagement();

  const [newPrinter, setNewPrinter] = useState<Omit<PrinterEquipment, 'id'>>({
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    technical_issues: '',
    notes: '',
    status: 'active'
  });

  useEffect(() => {
    if (isOpen && customer) {
      loadPrinters();
    }
  }, [isOpen, customer]);

  const loadPrinters = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_equipment')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('equipment_type', 'printer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrinters(data || []);
    } catch (error) {
      console.error('Error loading printers:', error);
      toast({
        title: "Error",
        description: "Failed to load printer equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrinter = async () => {
    if (!customer) return;
    
    if (!newPrinter.brand || !newPrinter.model || !newPrinter.serial_number) {
      toast({
        title: "Validation Error",
        description: "Please fill in brand, model, and serial number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const printerData = {
        customer_id: customer.id,
        user_id: customer.user_id || '',
        equipment_type: 'printer',
        ...newPrinter
      };

      if (editingPrinter) {
        const { error } = await supabase
          .from('customer_equipment')
          .update(printerData)
          .eq('id', editingPrinter.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Printer updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('customer_equipment')
          .insert(printerData);

        if (error) throw error;
        toast({
          title: "Success",
          description: "New printer added successfully",
        });
      }

      await loadPrinters();
      resetForm();
    } catch (error) {
      console.error('Error saving printer:', error);
      toast({
        title: "Error",
        description: "Failed to save printer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePrinter = async (printerId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('customer_equipment')
        .delete()
        .eq('id', printerId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Printer removed successfully",
      });
      await loadPrinters();
    } catch (error) {
      console.error('Error deleting printer:', error);
      toast({
        title: "Error",
        description: "Failed to remove printer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicketForPrinter = async (printer: PrinterEquipment) => {
    if (!customer) return;

    const ticketData = {
      subject: `${printer.brand} ${printer.model} - Service Request`,
      description: `Service request for ${printer.brand} ${printer.model} (S/N: ${printer.serial_number})\n\nTechnical Issues: ${printer.technical_issues || 'General maintenance'}`,
      priority: 'medium' as const,
      status: 'open' as const,
      category: 'printer_service'
    };

    const success = await handleCreateTicket(customer.id, ticketData);
    if (success) {
      toast({
        title: "Ticket Created",
        description: `Service ticket created for ${printer.brand} ${printer.model}`,
      });
    }
  };

  const resetForm = () => {
    setNewPrinter({
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      warranty_expiry: '',
      technical_issues: '',
      notes: '',
      status: 'active'
    });
    setEditingPrinter(null);
    setIsAddingNew(false);
  };

  const startEdit = (printer: PrinterEquipment) => {
    setEditingPrinter(printer);
    setNewPrinter({
      brand: printer.brand,
      model: printer.model,
      serial_number: printer.serial_number,
      purchase_date: printer.purchase_date || '',
      warranty_expiry: printer.warranty_expiry || '',
      technical_issues: printer.technical_issues || '',
      notes: printer.notes || '',
      status: printer.status
    });
    setIsAddingNew(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Printer Equipment - {customer?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Equipment List</TabsTrigger>
            <TabsTrigger value="add">
              {editingPrinter ? 'Edit Printer' : 'Add New Printer'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Registered Printers ({printers.length})
              </h3>
              <Button 
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Printer
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading printers...</div>
            ) : printers.length === 0 ? (
              <div className="text-center py-8">
                <Printer className="h-12 w-12 text-quikle-neutral/50 mx-auto mb-4" />
                <p className="text-quikle-slate">No printers registered yet</p>
                <Button 
                  onClick={() => setIsAddingNew(true)}
                  className="mt-4"
                >
                  Add First Printer
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {printers.map((printer) => (
                  <Card key={printer.id} className="border-quikle-silver/30">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {printer.brand} {printer.model}
                          </CardTitle>
                          <p className="text-sm text-quikle-slate">
                            Serial: {printer.serial_number}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(printer.status)}>
                            {printer.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(printer)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <strong>Purchase Date:</strong> {printer.purchase_date || 'N/A'}
                        </div>
                        <div>
                          <strong>Warranty:</strong> {printer.warranty_expiry || 'N/A'}
                        </div>
                      </div>
                      
                      {printer.technical_issues && (
                        <div className="mb-4">
                          <strong>Technical Issues:</strong>
                          <p className="text-sm text-quikle-slate mt-1 bg-red-50 p-2 rounded">
                            {printer.technical_issues}
                          </p>
                        </div>
                      )}

                      {printer.notes && (
                        <div className="mb-4">
                          <strong>Notes:</strong>
                          <p className="text-sm text-quikle-slate mt-1">{printer.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => createTicketForPrinter(printer)}
                          className="flex items-center gap-2"
                        >
                          <Wrench className="h-3 w-3" />
                          Create Service Ticket
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePrinter(printer.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPrinter ? 'Edit Printer Details' : 'Add New Printer'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={newPrinter.brand}
                      onChange={(e) => setNewPrinter(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g., Xerox, Epson, HP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={newPrinter.model}
                      onChange={(e) => setNewPrinter(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="e.g., WorkCentre 6515"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="serial">Serial Number *</Label>
                  <Input
                    id="serial"
                    value={newPrinter.serial_number}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, serial_number: e.target.value }))}
                    placeholder="Enter serial number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchase">Purchase Date</Label>
                    <Input
                      id="purchase"
                      type="date"
                      value={newPrinter.purchase_date}
                      onChange={(e) => setNewPrinter(prev => ({ ...prev, purchase_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warranty">Warranty Expiry</Label>
                    <Input
                      id="warranty"
                      type="date"
                      value={newPrinter.warranty_expiry}
                      onChange={(e) => setNewPrinter(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newPrinter.status} 
                    onValueChange={(value: 'active' | 'maintenance' | 'retired') => 
                      setNewPrinter(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issues">Technical Issues</Label>
                  <Textarea
                    id="issues"
                    value={newPrinter.technical_issues}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, technical_issues: e.target.value }))}
                    placeholder="Describe any known technical issues or problems"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={newPrinter.notes}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes about this printer"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={savePrinter} disabled={loading}>
                    {loading ? 'Saving...' : editingPrinter ? 'Update Printer' : 'Add Printer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PrinterManagementDialog;
