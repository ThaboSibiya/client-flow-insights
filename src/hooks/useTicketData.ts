
import { useState } from 'react';
import { TicketTemplate, TeamMember } from '@/types/customer';

export const useTicketData = () => {
  // Sample ticket templates with all required properties
  const [templates] = useState<TicketTemplate[]>([
    {
      id: 'template-1',
      name: 'Policy Inquiry',
      subject: 'Policy coverage question',
      description: 'Customer has questions about their policy coverage and benefits.',
      priority: 'medium',
      defaultPriority: 'medium',
      category: 'Policy',
      estimatedTime: 30
    },
    {
      id: 'template-2',
      name: 'Claim Support',
      subject: 'Assistance with claim filing',
      description: 'Customer needs help filing or tracking a claim.',
      priority: 'high',
      defaultPriority: 'high',
      category: 'Claims',
      estimatedTime: 60
    },
    {
      id: 'template-3',
      name: 'Documentation Request',
      subject: 'Document request',
      description: 'Customer is requesting policy documents or certificates.',
      priority: 'low',
      defaultPriority: 'low',
      category: 'Documentation',
      estimatedTime: 15
    },
    {
      id: 'template-4',
      name: 'Technical Issue',
      subject: 'Technical support needed',
      description: 'Customer experiencing technical difficulties with online services.',
      priority: 'medium',
      defaultPriority: 'medium',
      category: 'Technical',
      estimatedTime: 45
    },
    {
      id: 'template-5',
      name: 'Billing Question',
      subject: 'Billing inquiry',
      description: 'Customer has questions about their bill or payment.',
      priority: 'medium',
      defaultPriority: 'medium',
      category: 'Billing',
      estimatedTime: 20
    }
  ]);

  // Sample team members
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 'member-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Senior Support Agent'
    },
    {
      id: 'member-2',
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      role: 'Claims Specialist'
    },
    {
      id: 'member-3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'Technical Support'
    },
    {
      id: 'member-4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'Policy Advisor'
    }
  ]);

  return {
    templates,
    teamMembers
  };
};
