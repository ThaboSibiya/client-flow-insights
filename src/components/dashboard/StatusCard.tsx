
import React from 'react';

interface StatusCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, count, icon, color }) => {
  return (
    <div className={`${color} p-6 rounded-lg shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          <p className="text-white text-2xl font-bold mt-2">{count}</p>
        </div>
        <div className="text-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
