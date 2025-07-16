
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProgressiveDisclosureProps {
  title: string;
  summary: React.ReactNode;
  details: React.ReactNode;
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({ title, summary, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {!isExpanded && summary}
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      {isExpanded && (
        <div className="mt-4">
          {details}
        </div>
      )}
    </div>
  );
};

export default ProgressiveDisclosure;
