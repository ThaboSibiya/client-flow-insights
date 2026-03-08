import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Rocket, Users, MessageSquare, Workflow, FileText, BarChart3, Settings, Webhook, DollarSign, Shield, LineChart, Code, HelpCircle } from 'lucide-react';

export interface DocCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  articles: DocArticle[];
}

export interface DocArticle {
  id: string;
  title: string;
  content: string;
  steps?: string[];
  tips?: string;
  codeSnippet?: { label: string; language: string; code: string }[];
}

export const documentationData: DocCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Rocket,
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to Quikle CRM',
        content: 'Quikle CRM is your all-in-one platform for managing customers, sales pipelines, support tickets, quotes, invoices, and team collaboration. This guide walks you through every feature so you can get the most out of the system.',
        steps: [
          'Sign up or log in at the authentication page',
          'Complete the onboarding wizard to set up your company profile',
          'Invite team members from Settings → Employees',
          'Import existing customer data or add your first customer manually',
          'Explore the Dashboard for a real-time overview of your business'
        ],
        tips: 'Bookmark the Dashboard — it\'s the fastest way to see what needs your attention today.'
      },
      {
        id: 'user-roles',
        title: 'User Roles & Permissions',
        content: 'Quikle CRM supports three role levels: Employee, Manager, and Admin. Each role has progressively more access to system features and data.',
        steps: [
          'Employee: Can view assigned customers, manage conversations, and create quotes',
          'Manager: Everything an Employee can do, plus team oversight and analytics access',
          'Admin: Full system access including settings, employee management, audit logs, and integrations'
        ],
        tips: 'Follow the principle of least privilege — grant only the access each team member needs.'
      },
      {
        id: 'navigation',
        title: 'Navigating the App',
        content: 'The sidebar provides quick access to all major sections. Use the collapsible menu on smaller screens, and the contextual help button (?) in the bottom-right corner for page-specific guidance.',
        steps: [
          'Sidebar: Primary navigation to all pages (Dashboard, Customers, Pipeline, etc.)',
          'Breadcrumbs: Show your current location within the app',
          'Quick Actions: Available on the Dashboard for common tasks',
          'Search: Use the help panel search to find any topic instantly',
          'Settings Gear: Access all configuration from one centralised hub'
        ]
      }
    ]
  },
  {
    id: 'customers',
    label: 'Customer Management',
    icon: Users,
    articles: [
      {
        id: 'add-customers',
        title: 'Adding & Editing Customers',
        content: 'Customer records are the foundation of Quikle CRM. Each customer profile stores contact details, communication history, financial data, equipment records, and custom fields.',
        steps: [
          'Click "Add Customer" from the Customers page',
          'Fill in required fields: Name, Email',
          'Add optional fields: Phone, Address, Company, Contact Person',
          'Set the initial status: New, Existing, Pending, or Finalised',
          'Add notes for context that your team can reference later',
          'Click Save to create the customer record'
        ],
        tips: 'Use the bulk import feature (CSV) during onboarding to migrate hundreds of customers at once.'
      },
      {
        id: 'customer-status',
        title: 'Customer Status Management',
        content: 'Customer statuses help you segment your database and trigger automations. Quikle normalises all statuses to four internal values to maintain consistency.',
        steps: [
          'New: Fresh leads, prospects, or recently added contacts',
          'Existing: Active, qualified, or converted customers',
          'Pending: Awaiting action, follow-up, or approval',
          'Finalised: Completed, closed, or churned accounts'
        ],
        tips: 'Webhook ingestion automatically maps external status values (e.g., "Qualified" → "existing", "Lead" → "new").'
      },
      {
        id: 'customer-equipment',
        title: 'Equipment & Service Tracking',
        content: 'Track customer equipment, service history, warranty dates, and maintenance schedules directly from the customer profile.',
        steps: [
          'Open a customer profile and navigate to the Equipment tab',
          'Add equipment with type, brand, model, and serial number',
          'Log service history with costs, parts used, and technician notes',
          'Set next service due dates for proactive maintenance reminders',
          'Link service records to support tickets for full traceability'
        ]
      }
    ]
  },
  {
    id: 'conversations',
    label: 'Conversations',
    icon: MessageSquare,
    articles: [
      {
        id: 'messaging',
        title: 'Managing Conversations',
        content: 'The Conversations page is your centralised communication hub. All customer interactions — emails, internal notes, and messages — are threaded in one place.',
        steps: [
          'Select a conversation from the left panel to view its thread',
          'Compose a reply in the message box at the bottom',
          'Attach files by clicking the attachment icon',
          'Switch to Internal Note mode for team-only comments',
          'Mark conversations as resolved when complete'
        ],
        tips: 'Use @mentions in internal notes to alert specific team members about urgent items.'
      },
      {
        id: 'email-integration',
        title: 'Email Integration',
        content: 'Connect your email provider to sync conversations directly into Quikle. Supported providers include Gmail, Outlook, and custom IMAP/SMTP servers.',
        steps: [
          'Navigate to Settings → Email Integration',
          'Select your email provider and authenticate',
          'Configure sync settings (frequency, folders to sync)',
          'Incoming emails are automatically matched to customer records by email address',
          'Reply to emails directly from the Conversations page'
        ],
        tips: 'Enable auto-sync to ensure no customer email is missed. Sync status is visible in Settings.'
      }
    ]
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Workflow,
    articles: [
      {
        id: 'pipeline-board',
        title: 'Using the Pipeline Board',
        content: 'The Pipeline page uses a Kanban-style board to visualise your sales and support workflows. Drag and drop cards between stages to track progress.',
        steps: [
          'Cards represent customer tickets or sales opportunities',
          'Drag cards horizontally to move them between stages',
          'Click a card to view full details, notes, and history',
          'Use the filter bar to narrow by assignee, priority, or date',
          'Pipeline stages are customisable in Settings → Pipeline'
        ],
        tips: 'Review your pipeline weekly to identify stalled items and reassign if needed.'
      },
      {
        id: 'automations',
        title: 'Pipeline Automations',
        content: 'Set up rules that automatically trigger actions when cards move between stages — like sending emails, creating invoices, or notifying team members.',
        steps: [
          'Navigate to Automations from the sidebar',
          'Create a new rule with a trigger (e.g., "Card moved to Proposal Sent")',
          'Define the action (e.g., "Send quote email to customer")',
          'Set conditions and filters to control when the rule fires',
          'Enable the rule and monitor execution in the automation logs'
        ]
      }
    ]
  },
  {
    id: 'quotes-invoices',
    label: 'Quotes & Invoices',
    icon: FileText,
    articles: [
      {
        id: 'create-quotes',
        title: 'Creating Quotes',
        content: 'Generate professional, branded quotes that you can send directly to customers. Quotes include line items, tax calculations, and optional discount fields.',
        steps: [
          'Click "Create Quote" and select a customer',
          'Add line items with description, quantity, and unit price',
          'Apply discounts (percentage or fixed amount)',
          'Tax is calculated automatically based on your settings',
          'Preview the quote, then send via email or download as PDF'
        ],
        tips: 'Enable auto-send in Settings → Automations to email quotes immediately on creation.'
      },
      {
        id: 'invoices',
        title: 'Managing Invoices',
        content: 'Convert accepted quotes into invoices, or create standalone invoices. Track payment status, send reminders, and record payments.',
        steps: [
          'Open an accepted quote and click "Convert to Invoice"',
          'Or create a standalone invoice from the Quotes & Invoices page',
          'Set payment terms, due date, and any notes',
          'Send the invoice to the customer via email',
          'Mark as paid when payment is received',
          'Overdue invoices trigger automated follow-up reminders'
        ]
      }
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    articles: [
      {
        id: 'finance-overview',
        title: 'Customer Finance Profiles',
        content: 'Each customer has a financial summary showing their current balance, credit limit, payment history, risk rating, and account status.',
        steps: [
          'Navigate to the Finance page from the sidebar',
          'Search or select a customer to view their financial profile',
          'Review: current balance, total owed, credit limit, and risk rating',
          'View transaction history with payment methods and reference numbers',
          'Add finance notes to track collections or special arrangements'
        ],
        tips: 'Use the risk rating field to prioritise collections efforts on high-risk accounts.'
      },
      {
        id: 'debtor-management',
        title: 'Debtor & Collections Management',
        content: 'Track overdue accounts with debtor notes, follow-up scheduling, and account flagging to manage collections effectively.',
        steps: [
          'Flag overdue accounts from the customer finance view',
          'Add debtor notes with priority (high, medium, low) and follow-up dates',
          'Configure automated payment reminders in Settings → Automations',
          'Track resolution progress with timestamped notes',
          'Generate ageing reports to see outstanding balances by period'
        ]
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & Reporting',
    icon: BarChart3,
    articles: [
      {
        id: 'analytics-dashboard',
        title: 'Analytics Overview',
        content: 'The Analytics page provides visual charts and KPI cards to help you understand business performance at a glance.',
        steps: [
          'Select the time period using the date range picker',
          'Review KPI cards: revenue, customer count, ticket resolution, conversion rate',
          'Drill into charts for trend analysis',
          'Use filters to segment data by team member, customer status, or region',
          'Export charts and data as CSV or PDF'
        ],
        tips: 'Compare month-over-month trends to spot growth or decline early.'
      },
      {
        id: 'customer-insights',
        title: 'Customer Insights',
        content: 'Advanced analytics that segment your customer base, highlight engagement patterns, and identify at-risk accounts for proactive retention.',
        steps: [
          'Access Customer Insights from the Analytics sub-menu',
          'Review segmentation charts (by status, revenue, engagement)',
          'Identify customers with declining activity for outreach',
          'Monitor customer lifetime value (CLV) trends',
          'Export insight reports for strategic planning meetings'
        ]
      }
    ]
  },
  {
    id: 'employees',
    label: 'Employee Management',
    icon: Users,
    articles: [
      {
        id: 'manage-team',
        title: 'Adding & Managing Employees',
        content: 'Add team members, assign roles, set permissions, and track attendance and productivity from the Employees page.',
        steps: [
          'Click "Add Employee" and fill in their details',
          'Assign a role: Employee, Manager, or Admin',
          'Send a secure invitation link to their email',
          'The employee accepts the invitation to activate their account',
          'Monitor login history and attendance from their profile'
        ],
        tips: 'Use the invitation system instead of sharing passwords for better security.'
      },
      {
        id: 'permissions',
        title: 'Permissions & Privileges',
        content: 'Fine-grained permission controls let you define exactly what each employee can view, create, edit, or delete across every module.',
        steps: [
          'Go to an employee\'s profile and click "Edit Privileges"',
          'Toggle permissions for: Customers, Quotes, Automations, Settings, Analytics',
          'Set financial permissions: can create invoices, adjust credit limits, access PII',
          'Configure automation scope: view-only, execute, or full management',
          'Save changes — permissions take effect immediately'
        ]
      }
    ]
  },
  {
    id: 'integrations',
    label: 'Integrations & API',
    icon: Webhook,
    articles: [
      {
        id: 'api-endpoints',
        title: 'Creating API Endpoints',
        content: 'API endpoints (triggers) let external tools send data into Quikle CRM. Each endpoint gets a unique URL that you paste into your external service.',
        steps: [
          'Navigate to Integrations from the sidebar',
          'Click "Create API Endpoint" and enter a descriptive name',
          'A unique URL is automatically generated for the endpoint',
          'Copy the URL and paste it into your external tool (Zapier, Make, N8N, website form)',
          'Use the ••• menu → Test to verify it works',
          'Monitor incoming events in the activity log'
        ],
        tips: 'Name endpoints with operation keywords: "Create Lead", "Find Customer", "Update Status" — the system routes payloads accordingly.'
      },
      {
        id: 'api-reference',
        title: 'API Reference',
        content: 'All API endpoints accept JSON payloads via POST. The system normalises field names automatically (e.g., full_name → name, customer_name → name).',
        steps: [
          'Method: POST',
          'Content-Type: application/json',
          'Authentication: via unique endpoint key in the URL path',
          'Required fields for create: name, email',
          'Optional fields: phone, address, status, notes, company_address, contact_person',
          'Status values: new, existing, pending, finalised (aliases are auto-mapped)'
        ],
        codeSnippet: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X POST "https://oquiaxbnkdnpixqhxdfq.supabase.co/functions/v1/webhook-receiver/YOUR_ENDPOINT_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "status": "new"
  }'`
          },
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `fetch("https://oquiaxbnkdnpixqhxdfq.supabase.co/functions/v1/webhook-receiver/YOUR_ENDPOINT_KEY", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+1234567890",
    status: "new"
  })
});`
          }
        ],
        tips: 'Missing required fields (name, email) return a 422 error with a schema description to help you debug.'
      },
      {
        id: 'api-operations',
        title: 'API Operation Types',
        content: 'The webhook receiver automatically determines the operation based on keywords in your endpoint name. This allows one system to support create, search, and update operations.',
        steps: [
          'Create/Upsert (default): Endpoint names without special keywords. Creates a new customer or updates if the email already exists.',
          'Search/Find: Include "find" or "search" in the endpoint name. Search by email, phone, name, or customer_id.',
          'Update/Edit: Include "update" or "edit" in the endpoint name. Requires a valid customer_id in the payload.',
        ],
        tips: 'The system unwraps nested payloads automatically — wrap your data in "record", "data", "lead", or "payload" keys if needed.'
      },
      {
        id: 'api-errors',
        title: 'API Error Codes',
        content: 'The webhook endpoint returns standard HTTP status codes with descriptive error messages to help you debug integration issues.',
        steps: [
          '200 OK: Request processed successfully. Response includes the created/updated record.',
          '400 Bad Request: Invalid JSON payload or malformed request body.',
          '404 Not Found: The endpoint key does not match any active API trigger.',
          '422 Unprocessable Entity: Missing required fields (name, email). Response includes schema requirements.',
          '500 Internal Server Error: Unexpected server error. Check webhook logs for details.'
        ]
      },
      {
        id: 'webhooks-outbound',
        title: 'Outbound Webhooks',
        content: 'Configure webhooks that send data from Quikle to external services when events occur inside the CRM.',
        steps: [
          'Go to Integrations → Webhooks tab',
          'Add a new webhook connection with the target URL',
          'Select CRM events to trigger the webhook (e.g., new customer, status change)',
          'Test the connection to confirm the external service receives data',
          'Monitor delivery status and retry failed webhooks'
        ]
      },
      {
        id: 'data-sync',
        title: 'Data Sync Rules',
        content: 'Keep data synchronised between Quikle and external systems with configurable sync rules.',
        steps: [
          'Create a sync rule: choose source system, target system, and data type',
          'Set sync direction: Quikle → External, External → Quikle, or Bidirectional',
          'Configure frequency: real-time, hourly, or daily',
          'Monitor sync history: total synced records, last sync time, errors',
          'Pause or edit rules without losing configuration'
        ]
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    articles: [
      {
        id: 'general-settings',
        title: 'General & Profile Settings',
        content: 'Manage your personal profile, workspace preferences, and notification settings from the centralised Settings page.',
        steps: [
          'Access Settings from the sidebar gear icon',
          'Update your display name and email',
          'Set timezone, language, and date format',
          'Configure notification preferences: email, push, desktop, sound',
          'Set notification frequency: real-time, hourly digest, or daily summary'
        ]
      },
      {
        id: 'company-settings',
        title: 'Company & Branding',
        content: 'Configure your company identity used across quotes, invoices, and customer communications.',
        steps: [
          'Go to Settings → Company (Admin only)',
          'Upload your company logo',
          'Enter business name, address, and tax/VAT number',
          'Set default currency and payment terms',
          'Configure email sender identity'
        ]
      },
      {
        id: 'security-settings',
        title: 'Security & Audit',
        content: 'Manage authentication, session controls, and access the audit trail for compliance.',
        steps: [
          'Navigate to Settings → Security (Admin only)',
          'Enable two-factor authentication',
          'Set session timeout policies',
          'Review login history for all users',
          'Access the full Audit Log for detailed activity tracking'
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    icon: HelpCircle,
    articles: [
      {
        id: 'common-issues',
        title: 'Common Issues',
        content: 'Solutions to frequently encountered problems when using Quikle CRM.',
        steps: [
          'Login issues: Clear browser cache, check email/password, try password reset',
          'Data not loading: Check internet connection, try refreshing the page',
          'Missing customers: Verify filters are not hiding records, check the search term',
          'Email not syncing: Re-authenticate your email provider in Settings → Email',
          'Webhook not receiving data: Verify the endpoint URL is correct and the trigger is active'
        ]
      },
      {
        id: 'contact-support',
        title: 'Getting Help',
        content: 'If you can\'t find the answer in this documentation, use the contextual help system or contact support.',
        steps: [
          'Click the ? button in the bottom-right corner for page-specific help',
          'Search help topics using the search bar in the help panel',
          'Check the Audit Log for error details (Admin only)',
          'Review webhook logs in Integrations for API issues',
          'Contact support with your account details and a description of the issue'
        ]
      }
    ]
  }
];

interface DocumentationSidebarProps {
  categories: DocCategory[];
  activeCategory: string;
  activeArticle: string;
  onSelectArticle: (categoryId: string, articleId: string) => void;
  searchTerm: string;
}

const DocumentationSidebar = ({ categories, activeCategory, activeArticle, onSelectArticle, searchTerm }: DocumentationSidebarProps) => {
  const filteredCategories = categories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(article => {
      if (!searchTerm.trim()) return true;
      const s = searchTerm.toLowerCase();
      return (
        article.title.toLowerCase().includes(s) ||
        article.content.toLowerCase().includes(s) ||
        cat.label.toLowerCase().includes(s) ||
        (article.steps?.some(step => step.toLowerCase().includes(s)) ?? false)
      );
    })
  })).filter(cat => cat.articles.length > 0);

  return (
    <ScrollArea className="h-full">
      <nav className="p-4 space-y-1">
        {filteredCategories.map(category => (
          <div key={category.id} className="mb-3">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <category.icon className="h-3.5 w-3.5" />
              {category.label}
            </div>
            <div className="space-y-0.5">
              {category.articles.map(article => (
                <button
                  key={article.id}
                  onClick={() => onSelectArticle(category.id, article.id)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                    activeCategory === category.id && activeArticle === article.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {article.title}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && searchTerm && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No articles found for "{searchTerm}"
          </p>
        )}
      </nav>
    </ScrollArea>
  );
};

export default DocumentationSidebar;
