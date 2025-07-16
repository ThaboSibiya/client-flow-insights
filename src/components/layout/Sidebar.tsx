
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  FormInput,
  Building,
  UserPlus
} from 'lucide-react';
import UserProfile from '../auth/UserProfile';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: UserPlus, label: 'Onboarding', path: '/onboarding' },
    { icon: FileText, label: 'Quotes', path: '/quotes' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: FormInput, label: 'Form Builder', path: '/form-builder' },
    { icon: BarChart3, label: 'Customer Insights', path: '/customer-insights' },
    { icon: Building, label: 'Templates', path: '/template-management' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-quikle-primary">Quikle CRM</h2>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-quikle-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <UserProfile />
    </div>
  );
};

export default Sidebar;
