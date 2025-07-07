
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Edit, 
  Phone, 
  Mail, 
  MessageSquare, 
  ChevronRight, 
  Calendar,
  Building,
  MoreHorizontal
} from "lucide-react";
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation: string;
  title: string;
  department?: string;
  role: string;
  status: string;
  hire_date: string;
  is_invited?: boolean;
  auth_user_id?: string;
  last_login_at?: string;
}

interface MobileEmployeeCardProps {
  employee: Employee;
  onEditEmployee: (employee: Employee) => void;
  onCall?: (phone: string) => void;
  onMessage?: (employeeId: string) => void;
  onEmail?: (email: string) => void;
}

const MobileEmployeeCard = ({ 
  employee, 
  onEditEmployee, 
  onCall, 
  onMessage, 
  onEmail 
}: MobileEmployeeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const { isTouchDevice } = useMobileDetection();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      const deltaX = currentTouch.clientX - startX;
      
      if (deltaX > 50) {
        setSwipeDirection('right');
      } else if (deltaX < -50) {
        setSwipeDirection('left');
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      setTimeout(() => setSwipeDirection(null), 300);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        swipeDirection === 'left' ? 'transform -translate-x-4' : 
        swipeDirection === 'right' ? 'transform translate-x-4' : ''
      }`}
      onTouchStart={handleTouchStart}
    >
      {/* Swipe Actions Background */}
      {swipeDirection && (
        <div className={`absolute inset-0 flex items-center ${
          swipeDirection === 'left' ? 'justify-end bg-red-500' : 'justify-start bg-blue-500'
        } text-white px-4`}>
          {swipeDirection === 'left' ? (
            <Edit className="h-6 w-6" />
          ) : (
            <Phone className="h-6 w-6" />
          )}
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-quikle-primary text-white">
                {employee.first_name[0]}{employee.last_name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-quikle-charcoal truncate">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-sm text-quikle-slate truncate">{employee.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getRoleColor(employee.role)}`}>
                  {employee.role}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          {employee.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCall?.(employee.phone!)}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEmail?.(employee.email)}
            className="flex-1"
          >
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage?.(employee.id)}
            className="flex-1"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-quikle-silver/30 space-y-2 animate-accordion-down">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-quikle-charcoal">ID:</span>
                <p className="text-quikle-slate">#{employee.employee_number}</p>
              </div>
              <div>
                <span className="font-medium text-quikle-charcoal">Email:</span>
                <p className="text-quikle-slate truncate">{employee.email}</p>
              </div>
              {employee.department && (
                <div>
                  <span className="font-medium text-quikle-charcoal">Department:</span>
                  <p className="text-quikle-slate">{employee.department}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-quikle-charcoal">Hired:</span>
                <p className="text-quikle-slate">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => onEditEmployee(employee)}
              className="w-full mt-3 bg-quikle-primary hover:bg-quikle-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Employee
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileEmployeeCard;
