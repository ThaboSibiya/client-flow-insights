import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Equipment, ServiceHistoryEntry, EquipmentFormData, ServiceFormData } from '@/components/customers/equipment/types';

export const useEquipmentService = (customerId: string) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [serviceHistory, setServiceHistory] = useState<Record<string, ServiceHistoryEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingService, setSavingService] = useState(false);

  const loadEquipment = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_equipment')
        .select('id, customer_id, user_id, equipment_type, brand, model, serial_number, purchase_date, warranty_expiry, notes, created_at, updated_at, technical_issues, status, last_service_date, next_service_due, total_services')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEquipment((data || []).map(item => ({
        ...item,
        total_services: item.total_services || 0
      })) as Equipment[]);
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
  }, [customerId]);

  const loadServiceHistory = useCallback(async (equipmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('equipment_service_history')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('service_date', { ascending: false });

      if (error) throw error;
      
      setServiceHistory(prev => ({
        ...prev,
        [equipmentId]: (data || []) as ServiceHistoryEntry[]
      }));
    } catch (error) {
      console.error('Error loading service history:', error);
    }
  }, []);

  const saveEquipment = async (formData: EquipmentFormData, editingId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Sanitize date fields - convert empty strings to null
      const sanitizedData = {
        equipment_type: formData.equipment_type,
        brand: formData.brand || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        status: formData.status,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        notes: formData.notes || null,
        technical_issues: formData.technical_issues || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('customer_equipment')
          .update({
            ...sanitizedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Success", description: "Equipment updated successfully" });
      } else {
        const { error } = await supabase
          .from('customer_equipment')
          .insert({
            ...sanitizedData,
            customer_id: customerId,
            user_id: user.id,
            total_services: 0
          });

        if (error) throw error;
        toast({ title: "Success", description: "Equipment added successfully" });
      }

      await loadEquipment();
      return true;
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast({
        title: "Error",
        description: "Failed to save equipment",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Equipment deleted successfully" });
      await loadEquipment();
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive"
      });
      return false;
    }
  };

  const logService = async (equipmentId: string, formData: ServiceFormData) => {
    try {
      setSavingService(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const partsArray = formData.parts_used 
        ? formData.parts_used.split(',').map(p => p.trim()).filter(Boolean)
        : [];

      const { error } = await supabase
        .from('equipment_service_history')
        .insert({
          equipment_id: equipmentId,
          customer_id: customerId,
          user_id: user.id,
          service_type: formData.service_type,
          service_date: formData.service_date || new Date().toISOString(),
          performed_by: formData.performed_by || null,
          description: formData.description,
          resolution: formData.resolution || null,
          parts_used: partsArray.length > 0 ? partsArray : null,
          labor_cost: formData.labor_cost || 0,
          parts_cost: formData.parts_cost || 0,
          next_service_due: formData.next_service_due || null,
          status: formData.status || 'completed'
        });

      if (error) throw error;
      
      toast({ title: "Success", description: "Service logged successfully" });
      await loadServiceHistory(equipmentId);
      await loadEquipment();
      return true;
    } catch (error) {
      console.error('Error logging service:', error);
      toast({
        title: "Error",
        description: "Failed to log service",
        variant: "destructive"
      });
      return false;
    } finally {
      setSavingService(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  return {
    equipment,
    serviceHistory,
    loading,
    savingService,
    loadEquipment,
    loadServiceHistory,
    saveEquipment,
    deleteEquipment,
    logService
  };
};
