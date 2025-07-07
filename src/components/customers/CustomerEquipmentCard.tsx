
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerEquipment } from '@/types/customer';
import { Calendar, Hash, Package, User } from 'lucide-react';

interface CustomerEquipmentCardProps {
  equipment: CustomerEquipment[];
}

const CustomerEquipmentCard = ({ equipment }: CustomerEquipmentCardProps) => {
  if (!equipment || equipment.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Equipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No equipment registered</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Equipment ({equipment.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {equipment.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">
                {item.brand} {item.model}
              </h4>
              <Badge variant="outline" className="capitalize">
                {item.equipment_type}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.serial_number && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Serial:</span>
                  <span className="font-mono">{item.serial_number}</span>
                </div>
              )}
              
              {item.purchase_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Purchased:</span>
                  <span>{new Date(item.purchase_date).toLocaleDateString()}</span>
                </div>
              )}
              
              {item.warranty_expiry && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Warranty:</span>
                  <span className={
                    new Date(item.warranty_expiry) < new Date() 
                      ? 'text-red-600 font-semibold' 
                      : 'text-green-600'
                  }>
                    {new Date(item.warranty_expiry).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            {item.notes && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                <p className="text-gray-700">{item.notes}</p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CustomerEquipmentCard;
