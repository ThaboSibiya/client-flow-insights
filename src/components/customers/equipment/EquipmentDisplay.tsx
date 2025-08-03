
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Printer, 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Equipment {
  id: string;
  equipment_type: string;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  purchase_date?: string;
  warranty_expiry?: string;
  notes?: string;
  technical_issues?: string;
}

interface EquipmentDisplayProps {
  customerId: string;
}

const EquipmentDisplay = ({ customerId }: EquipmentDisplayProps) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    equipment_type: 'printer',
    brand: '',
    model: '',
    serial_number: '',
    status: 'active',
    purchase_date: '',
    warranty_expiry: '',
    notes: '',
    technical_issues: ''
  });

  useEffect(() => {
    loadEquipment();
  }, [customerId]);

  const loadEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_equipment')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (equipmentItem?: Equipment) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const saveData = equipmentItem || formData;
      
      if (editingId || equipmentItem) {
        // Update existing
        const { error } = await supabase
          .from('customer_equipment')
          .update(saveData)
          .eq('id', editingId || equipmentItem?.id);

        if (error) throw error;
        
        setEditingId(null);
        toast({
          title: "Success",
          description: "Equipment updated successfully"
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('customer_equipment')
          .insert({
            ...saveData,
            customer_id: customerId,
            user_id: user.id
          });

        if (error) throw error;
        
        setShowAddForm(false);
        setFormData({
          equipment_type: 'printer',
          brand: '',
          model: '',
          serial_number: '',
          status: 'active',
          purchase_date: '',
          warranty_expiry: '',
          notes: '',
          technical_issues: ''
        });
        
        toast({
          title: "Success",
          description: "Equipment added successfully"
        });
      }

      loadEquipment();
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast({
        title: "Error",
        description: "Failed to save equipment",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Equipment deleted successfully"
      });
      
      loadEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'broken': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'broken': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderEquipmentForm = (item?: Equipment, isEditing = false) => (
    <div className="space-y-4 p-4 bg-quikle-crystal/30 rounded-lg border border-quikle-silver/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-quikle-charcoal font-medium">Equipment Type</Label>
          <select
            className="w-full p-2 border border-quikle-silver/50 rounded-md focus:border-quikle-primary"
            value={isEditing ? item?.equipment_type : formData.equipment_type}
            onChange={(e) => isEditing 
              ? setEquipment(prev => prev.map(eq => 
                  eq.id === item?.id ? { ...eq, equipment_type: e.target.value } : eq
                ))
              : setFormData(prev => ({ ...prev, equipment_type: e.target.value }))
            }
          >
            <option value="printer">Printer</option>
            <option value="scanner">Scanner</option>
            <option value="copier">Copier</option>
            <option value="fax">Fax Machine</option>
            <option value="multifunction">Multifunction Device</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-quikle-charcoal font-medium">Brand</Label>
          <Input
            value={isEditing ? item?.brand : formData.brand}
            onChange={(e) => isEditing
              ? setEquipment(prev => prev.map(eq => 
                  eq.id === item?.id ? { ...eq, brand: e.target.value } : eq
                ))
              : setFormData(prev => ({ ...prev, brand: e.target.value }))
            }
            placeholder="e.g., HP, Canon, Epson"
            className="border-quikle-silver/50 focus:border-quikle-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-quikle-charcoal font-medium">Model</Label>
          <Input
            value={isEditing ? item?.model : formData.model}
            onChange={(e) => isEditing
              ? setEquipment(prev => prev.map(eq => 
                  eq.id === item?.id ? { ...eq, model: e.target.value } : eq
                ))
              : setFormData(prev => ({ ...prev, model: e.target.value }))
            }
            placeholder="Model number/name"
            className="border-quikle-silver/50 focus:border-quikle-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-quikle-charcoal font-medium">Serial Number</Label>
          <Input
            value={isEditing ? item?.serial_number : formData.serial_number}
            onChange={(e) => isEditing
              ? setEquipment(prev => prev.map(eq => 
                  eq.id === item?.id ? { ...eq, serial_number: e.target.value } : eq
                ))
              : setFormData(prev => ({ ...prev, serial_number: e.target.value }))
            }
            placeholder="Serial number"
            className="border-quikle-silver/50 focus:border-quikle-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-quikle-charcoal font-medium">Status</Label>
          <select
            className="w-full p-2 border border-quikle-silver/50 rounded-md focus:border-quikle-primary"
            value={isEditing ? item?.status : formData.status}
            onChange={(e) => isEditing
              ? setEquipment(prev => prev.map(eq => 
                  eq.id === item?.id ? { ...eq, status: e.target.value } : eq
                ))
              : setFormData(prev => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="active">Active</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="broken">Broken/Out of Order</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-quikle-charcoal font-medium">Purchase Date</Label>
          <Input
            type="date"
            value={isEditing ? item?.purchase_date : formData.purchase_date}
            onChange={(e) => isEditing
              ? setEquipment(prev => prev.map(eq => 
                  eq.id === item?.id ? { ...eq, purchase_date: e.target.value } : eq
                ))
              : setFormData(prev => ({ ...prev, purchase_date: e.target.value }))
            }
            className="border-quikle-silver/50 focus:border-quikle-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-quikle-charcoal font-medium">Warranty Expiry</Label>
          <Input
            type="date"
            value={isEditing ? item?.warranty_expiry : formData.warranty_expiry}
            onChange={(e) => isEditing
              ? setEquipment(prev => prev.map(eq => 
                  eq.id === item?.id ? { ...eq, warranty_expiry: e.target.value } : eq
                ))
              : setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))
            }
            className="border-quikle-silver/50 focus:border-quikle-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-quikle-charcoal font-medium">Technical Issues</Label>
        <Textarea
          value={isEditing ? item?.technical_issues : formData.technical_issues}
          onChange={(e) => isEditing
            ? setEquipment(prev => prev.map(eq => 
                eq.id === item?.id ? { ...eq, technical_issues: e.target.value } : eq
              ))
            : setFormData(prev => ({ ...prev, technical_issues: e.target.value }))
          }
          placeholder="Describe any current or recurring technical issues"
          className="border-quikle-silver/50 focus:border-quikle-primary"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-quikle-charcoal font-medium">Notes</Label>
        <Textarea
          value={isEditing ? item?.notes : formData.notes}
          onChange={(e) => isEditing
            ? setEquipment(prev => prev.map(eq => 
                eq.id === item?.id ? { ...eq, notes: e.target.value } : eq
              ))
            : setFormData(prev => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Additional notes or maintenance history"
          className="border-quikle-silver/50 focus:border-quikle-primary"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => isEditing ? setEditingId(null) : setShowAddForm(false)}
          className="border-quikle-silver/50"
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleSave(isEditing ? item : undefined)}
          className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Update' : 'Add'} Equipment
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-quikle-silver/30 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-quikle-silver/20 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-quikle-charcoal flex items-center gap-2">
            <Printer className="h-5 w-5 text-quikle-primary" />
            Equipment Management
          </h3>
          <p className="text-sm text-quikle-slate">Manage printers and equipment for this customer</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {showAddForm && renderEquipmentForm()}

      <div className="space-y-4">
        {equipment.length === 0 && !showAddForm ? (
          <Card className="bg-gradient-to-br from-quikle-crystal/50 to-white border-dashed border-quikle-silver/50">
            <CardContent className="py-8 text-center">
              <Printer className="h-16 w-16 text-quikle-neutral/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-quikle-charcoal mb-2">No Equipment Added</h3>
              <p className="text-quikle-slate mb-4">
                No equipment has been registered for this customer yet.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Equipment
              </Button>
            </CardContent>
          </Card>
        ) : (
          equipment.map(item => (
            <Card key={item.id} className="bg-gradient-to-br from-white to-quikle-crystal/30 border-quikle-silver/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Printer className="h-8 w-8 text-quikle-primary" />
                    <div>
                      <CardTitle className="text-lg text-quikle-charcoal">
                        {item.brand} {item.model}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.equipment_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {editingId === item.id ? (
                <CardContent>
                  {renderEquipmentForm(item, true)}
                </CardContent>
              ) : (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-quikle-slate">Serial Number:</span>
                      <p className="text-quikle-charcoal">{item.serial_number || 'Not provided'}</p>
                    </div>
                    {item.purchase_date && (
                      <div>
                        <span className="font-medium text-quikle-slate flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Purchase Date:
                        </span>
                        <p className="text-quikle-charcoal">
                          {new Date(item.purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {item.warranty_expiry && (
                      <div>
                        <span className="font-medium text-quikle-slate flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Warranty Expires:
                        </span>
                        <p className="text-quikle-charcoal">
                          {new Date(item.warranty_expiry).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {item.technical_issues && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <span className="font-medium text-amber-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Technical Issues:
                      </span>
                      <p className="text-amber-700 mt-1">{item.technical_issues}</p>
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="mt-4">
                      <span className="font-medium text-quikle-slate">Notes:</span>
                      <p className="text-quikle-charcoal mt-1">{item.notes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EquipmentDisplay;
