
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Package, AlertTriangle, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minThreshold: number;
  usedToday: number;
  location: string;
  lastUsed: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface UsageAlert {
  id: string;
  item: string;
  customer: string;
  quantityUsed: number;
  technician: string;
  timestamp: string;
  jobLocation: string;
}

const InventoryAlerts = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Copper Pipes (6ft)',
      currentStock: 5,
      minThreshold: 10,
      usedToday: 8,
      location: 'Warehouse A',
      lastUsed: '2024-06-22T14:30:00Z',
      status: 'low_stock',
    },
    {
      id: '2',
      name: 'PVC Fittings Set',
      currentStock: 0,
      minThreshold: 5,
      usedToday: 3,
      location: 'Truck #2',
      lastUsed: '2024-06-22T13:15:00Z',
      status: 'out_of_stock',
    },
    {
      id: '3',
      name: 'Insulation Foam',
      currentStock: 25,
      minThreshold: 15,
      usedToday: 2,
      location: 'Warehouse B',
      lastUsed: '2024-06-22T11:45:00Z',
      status: 'in_stock',
    },
  ]);

  const [usageAlerts, setUsageAlerts] = useState<UsageAlert[]>([
    {
      id: '1',
      item: 'Copper Pipes (6ft)',
      customer: 'Sarah Johnson',
      quantityUsed: 4,
      technician: 'Mike Wilson',
      timestamp: '2024-06-22T14:30:00Z',
      jobLocation: '123 Oak Street',
    },
    {
      id: '2',
      item: 'PVC Fittings Set',
      customer: 'David Chen',
      quantityUsed: 3,
      technician: 'Lisa Brown',
      timestamp: '2024-06-22T13:15:00Z',
      jobLocation: '456 Pine Avenue',
    },
  ]);

  const [alertSettings, setAlertSettings] = useState({
    lowStockAlerts: true,
    usageTracking: true,
    autoReorder: false,
    reorderQuantity: 20,
  });

  const handleRestock = (itemId: string) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            currentStock: item.currentStock + alertSettings.reorderQuantity,
            status: 'in_stock' as const
          }
        : item
    ));
    toast({
      title: "Restock Ordered",
      description: "Inventory has been updated with new stock order.",
    });
  };

  const acknowledgeUsage = (alertId: string) => {
    setUsageAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Usage Acknowledged",
      description: "Material usage has been recorded.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <Package className="h-4 w-4" />;
      case 'low_stock': return <TrendingDown className="h-4 w-4" />;
      case 'out_of_stock': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="low-stock">Low stock alerts</Label>
              <Switch
                id="low-stock"
                checked={alertSettings.lowStockAlerts}
                onCheckedChange={(checked) => 
                  setAlertSettings(prev => ({ ...prev, lowStockAlerts: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="usage-tracking">Usage tracking</Label>
              <Switch
                id="usage-tracking"
                checked={alertSettings.usageTracking}
                onCheckedChange={(checked) => 
                  setAlertSettings(prev => ({ ...prev, usageTracking: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reorder">Auto-reorder</Label>
              <Switch
                id="auto-reorder"
                checked={alertSettings.autoReorder}
                onCheckedChange={(checked) => 
                  setAlertSettings(prev => ({ ...prev, autoReorder: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder-qty">Reorder quantity</Label>
              <Input
                id="reorder-qty"
                type="number"
                value={alertSettings.reorderQuantity}
                onChange={(e) => 
                  setAlertSettings(prev => ({ ...prev, reorderQuantity: parseInt(e.target.value) }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current:</span> {item.currentStock}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min:</span> {item.minThreshold}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Used today:</span> {item.usedToday}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last used:</span> {new Date(item.lastUsed).toLocaleTimeString()}
                    </div>
                  </div>

                  {(item.status === 'low_stock' || item.status === 'out_of_stock') && (
                    <Button 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={() => handleRestock(item.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Order Restock
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Recent Usage Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageAlerts.map((alert) => (
                <div key={alert.id} className="border-l-4 border-orange-400 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{alert.item}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div><strong>Customer:</strong> {alert.customer}</div>
                    <div><strong>Quantity:</strong> {alert.quantityUsed} units</div>
                    <div><strong>Technician:</strong> {alert.technician}</div>
                    <div><strong>Location:</strong> {alert.jobLocation}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => acknowledgeUsage(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}

              {usageAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent usage alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryAlerts;
