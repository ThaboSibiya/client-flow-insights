
import { useState } from 'react';
import { TicketTemplate, TeamMember } from '@/types/customer';

export const useTicketData = () => {
  // Sample ticket templates
  const [templates] = useState<TicketTemplate[]>([
    {
      id: 'template-1',
      name: 'Policy Inquiry',
      subject: 'Policy coverage question',
      description: 'Customer has questions about their policy coverage and benefits.',
      priority: 'medium',
      category: 'Policy'
    },
    {
      id: 'template-2',
      name: 'Claim Support',
      subject: 'Assistance with claim filing',
      description: 'Customer needs help filing or tracking a claim.',
      priority: 'high',
      category: 'Claims'
    },
    {
      id: 'template-3',
      name: 'Documentation Request',
      subject: 'Document request',
      description: 'Customer is requesting policy documents or certificates.',
      priority: 'low',
      category: 'Documentation'
    },
    {
      id: 'template-4',
      name: 'Technical Issue',
      subject: 'Technical support needed',
      description: 'Customer experiencing technical difficulties with online services.',
      priority: 'medium',
      category: 'Technical'
    },
    {
      id: 'template-5',
      name: 'Billing Question',
      subject: 'Billing inquiry',
      description: 'Customer has questions about their bill or payment.',
      priority: 'medium',
      category: 'Billing'
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
