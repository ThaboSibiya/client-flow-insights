
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  lastUsed: string;
  status: 'low' | 'critical' | 'normal';
}

interface InventoryAlert {
  id: string;
  item: string;
  currentStock: number;
  minThreshold: number;
  usedAt: string;
  location: string;
  technician: string;
  status: 'pending' | 'acknowledged' | 'restocked';
}

const InventoryAlerts = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Ethernet Cables (Cat6)',
      currentStock: 5,
      minThreshold: 10,
      unit: 'pieces',
      lastUsed: '2024-06-22T10:00:00Z',
      status: 'critical',
    },
    {
      id: '2',
      name: 'WiFi Routers',
      currentStock: 12,
      minThreshold: 15,
      unit: 'units',
      lastUsed: '2024-06-21T14:30:00Z',
      status: 'low',
    },
    {
      id: '3',
      name: 'Cable Connectors',
      currentStock: 25,
      minThreshold: 20,
      unit: 'pieces',
      lastUsed: '2024-06-20T09:15:00Z',
      status: 'normal',
    },
  ]);

  const [alerts, setAlerts] = useState<InventoryAlert[]>([
    {
      id: '1',
      item: 'Ethernet Cables (Cat6)',
      currentStock: 5,
      minThreshold: 10,
      usedAt: '2024-06-22T10:00:00Z',
      location: '123 Oak Street',
      technician: 'Mike Wilson',
      status: 'pending',
    },
    {
      id: '2',
      item: 'WiFi Routers',
      currentStock: 12,
      minThreshold: 15,
      usedAt: '2024-06-21T14:30:00Z',
      location: '456 Pine Avenue',
      technician: 'Lisa Brown',
      status: 'acknowledged',
    },
  ]);

  const [alertSettings, setAlertSettings] = useState({
    autoAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    alertThreshold: 20, // percentage
  });

  const updateStock = (itemId: string, change: number) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.currentStock + change);
        const status = newStock <= item.minThreshold * 0.5 ? 'critical' : 
                      newStock <= item.minThreshold ? 'low' : 'normal';
        return { ...item, currentStock: newStock, status };
      }
      return item;
    }));

    toast({
      title: "Stock Updated",
      description: `Inventory has been ${change > 0 ? 'increased' : 'decreased'}`,
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
    toast({
      title: "Alert Acknowledged",
      description: "Inventory alert has been acknowledged",
    });
  };

  const markRestocked = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'restocked' } : alert
    ));
    toast({
      title: "Item Restocked",
      description: "Inventory has been marked as restocked",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'restocked': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-alerts">Enable automatic alerts</Label>
            <Switch
              id="auto-alerts"
              checked={alertSettings.autoAlerts}
              onCheckedChange={(checked) =>
                setAlertSettings(prev => ({ ...prev, autoAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email notifications</Label>
            <Switch
              id="email-notifications"
              checked={alertSettings.emailNotifications}
              onCheckedChange={(checked) =>
                setAlertSettings(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS notifications</Label>
            <Switch
              id="sms-notifications"
              checked={alertSettings.smsNotifications}
              onCheckedChange={(checked) =>
                setAlertSettings(prev => ({ ...prev, smsNotifications: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Alert threshold (%)</Label>
            <Input
              type="number"
              value={alertSettings.alertThreshold}
              onChange={(e) =>
                setAlertSettings(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) }))
              }
              min="1"
              max="100"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {item.currentStock} {item.unit} (Min: {item.minThreshold})
                      </span>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(item.id, -1)}
                      disabled={item.currentStock === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 font-medium">{item.currentStock}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last used: {new Date(item.lastUsed).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="border-l-4 border-orange-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{alert.item}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      Current stock: {alert.currentStock} (Below threshold: {alert.minThreshold})
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Used at {alert.location} by {alert.technician}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {alert.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== 'restocked' && (
                    <Button
                      size="sm"
                      onClick={() => markRestocked(alert.id)}
                    >
                      Mark Restocked
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active inventory alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAlerts;
