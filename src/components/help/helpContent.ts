
import { LucideIcon, Users, MessageCircle, BarChart3, FileText, UserCog, Bot, LayoutDashboard, UserPlus, Settings, Webhook, DollarSign, Shield, LineChart } from 'lucide-react';

interface HelpSection {
  title: string;
  content: string;
  icon?: LucideIcon;
  steps?: string[];
  tips?: string;
}

interface PageHelp {
  title: string;
  description: string;
  sections: HelpSection[];
}

export const helpContent: Record<string, PageHelp> = {
  dashboard: {
    title: "Dashboard",
    description: "Your business overview and control center",
    sections: [
      {
        title: "Understanding Your Dashboard",
        content: "The dashboard provides a real-time overview of your business performance with key metrics and quick actions.",
        icon: LayoutDashboard,
        steps: [
          "Review the metric cards at the top for quick insights",
          "Check the activity feed for recent customer interactions",
          "Use quick actions to navigate to common tasks",
          "Monitor alerts and notifications in the sidebar"
        ],
        tips: "Refresh the page to see the latest data updates"
      },
      {
        title: "Key Metrics Explained",
        content: "Your dashboard shows critical business indicators to help you make informed decisions.",
        steps: [
          "Total Customers: All customers in your database",
          "Active Tickets: Open support requests requiring attention",
          "Monthly Revenue: Income generated this month",
          "Response Time: Average time to respond to customers"
        ]
      },
      {
        title: "Quick Actions",
        content: "Use the quick action buttons to perform common tasks without navigating to other pages.",
        steps: [
          "Add Customer: Create a new customer record",
          "Create Ticket: Start a new support request",
          "Send Quote: Generate a new quote for a customer",
          "View Analytics: Access detailed business reports"
        ]
      }
    ]
  },
  customers: {
    title: "Customers",
    description: "Manage your customer database and relationships",
    sections: [
      {
        title: "Adding New Customers",
        content: "Create comprehensive customer profiles with all relevant information.",
        icon: Users,
        steps: [
          "Click the 'Add Customer' button in the top right",
          "Fill in the customer's basic information (name, email, phone)",
          "Add their address and business details",
          "Set their status (Lead, Active, Inactive)",
          "Add any initial notes or comments",
          "Save the customer profile"
        ],
        tips: "Use consistent formatting for phone numbers and addresses to maintain clean data"
      },
      {
        title: "Managing Customer Information",
        content: "Keep customer data accurate and up-to-date for better service delivery.",
        steps: [
          "Click on any customer to view their full profile",
          "Use the edit button to update information",
          "Add comments to track interaction history",
          "Update status as relationships progress",
          "View associated tickets and quotes"
        ]
      },
      {
        title: "Using Filters and Search",
        content: "Quickly find customers using the search and filter tools.",
        steps: [
          "Use the search box to find customers by name or email",
          "Apply status filters to see specific customer types",
          "Use date filters to see recently added customers",
          "Combine filters for more specific results"
        ]
      }
    ]
  },
  conversations: {
    title: "Conversations",
    description: "Your central communication hub for customer interactions",
    sections: [
      {
        title: "Managing Customer Communications",
        content: "Keep track of all customer conversations in one organized place.",
        icon: MessageCircle,
        steps: [
          "Select a conversation from the left panel",
          "Read through the message history",
          "Type your response in the message box",
          "Add attachments if needed",
          "Send your message or save as draft"
        ],
        tips: "Use templates for common responses to save time"
      },
      {
        title: "Setting Priority and Status",
        content: "Organize conversations by urgency and progress to ensure nothing falls through the cracks.",
        steps: [
          "Click the priority dropdown to set urgency level",
          "Update status based on conversation progress",
          "Assign conversations to team members",
          "Set follow-up reminders for important conversations"
        ]
      },
      {
        title: "Internal Notes and Collaboration",
        content: "Use internal notes to collaborate with your team without customers seeing.",
        steps: [
          "Toggle to 'Internal Note' mode",
          "Add context for other team members",
          "Document important customer information",
          "Share insights about customer needs or issues"
        ]
      }
    ]
  },
  pipeline: {
    title: "Pipeline",
    description: "Track your sales and support workflows visually",
    sections: [
      {
        title: "Using the Pipeline Board",
        content: "Drag and drop items between stages to track progress visually.",
        icon: Bot,
        steps: [
          "View items organized by stage",
          "Drag cards between stages to update status",
          "Click on cards to view detailed information",
          "Use filters to focus on specific items",
          "Monitor time spent in each stage"
        ],
        tips: "Regular pipeline reviews help identify bottlenecks and opportunities"
      },
      {
        title: "Managing Sales Opportunities",
        content: "Track potential sales from initial contact to closed deals.",
        steps: [
          "Start with leads in the 'New Lead' stage",
          "Move to 'Contacted' after initial outreach",
          "Qualify leads based on budget, authority, need, timeline",
          "Send proposals and move to 'Proposal Sent'",
          "Navigate negotiations and close deals"
        ]
      },
      {
        title: "Support Ticket Workflow",
        content: "Manage customer support requests efficiently through the ticket pipeline.",
        steps: [
          "New tickets start in 'New' stage",
          "Assign tickets to appropriate team members",
          "Move to 'In Progress' when work begins",
          "Use 'Pending' for customer responses",
          "Resolve and close completed tickets"
        ]
      }
    ]
  },
  quotes: {
    title: "Quotes & Invoices",
    description: "Create and manage your financial documents",
    sections: [
      {
        title: "Creating Professional Quotes",
        content: "Generate branded quotes that help win new business.",
        icon: FileText,
        steps: [
          "Click 'Create Quote' and select a customer",
          "Add line items with descriptions and pricing",
          "Apply any discounts or special pricing",
          "Review the quote preview for accuracy",
          "Send directly to customer via email"
        ],
        tips: "Clear, detailed descriptions help customers understand the value you provide"
      },
      {
        title: "Converting Quotes to Invoices",
        content: "Seamlessly turn accepted quotes into invoices for payment.",
        steps: [
          "Open the accepted quote",
          "Click 'Convert to Invoice'",
          "Verify all details are correct",
          "Set payment terms and due date",
          "Send invoice to customer"
        ]
      },
      {
        title: "Tracking Payments",
        content: "Monitor outstanding invoices and payment status.",
        steps: [
          "Use the status filter to see unpaid invoices",
          "Send payment reminders for overdue invoices",
          "Mark invoices as paid when payment received",
          "Generate reports for financial analysis"
        ]
      }
    ]
  },
  analytics: {
    title: "Analytics",
    description: "Gain insights into your business performance",
    sections: [
      {
        title: "Understanding Your Reports",
        content: "Use analytics to make data-driven business decisions.",
        icon: BarChart3,
        steps: [
          "Select the time period you want to analyze",
          "Review key performance indicators at the top",
          "Examine charts for trends and patterns",
          "Use filters to drill down into specific data",
          "Export reports for sharing or further analysis"
        ],
        tips: "Compare different time periods to identify growth trends"
      },
      {
        title: "Key Metrics to Monitor",
        content: "Focus on the metrics that matter most for your business growth.",
        steps: [
          "Revenue trends: Track income over time",
          "Customer acquisition: Monitor new customer growth",
          "Response times: Ensure quick customer service",
          "Conversion rates: Measure sales effectiveness",
          "Customer satisfaction: Monitor service quality"
        ]
      }
    ]
  },
  employees: {
    title: "Employees",
    description: "Manage your team and their system access",
    sections: [
      {
        title: "Managing Team Members",
        content: "Add and manage your team's access to the CRM system.",
        icon: UserCog,
        steps: [
          "Click 'Add Employee' to create new team member",
          "Fill in their contact and role information",
          "Assign appropriate permissions level",
          "Send login credentials securely",
          "Monitor their system usage and performance"
        ],
        tips: "Regular permission reviews ensure security and appropriate access levels"
      },
      {
        title: "Setting User Permissions",
        content: "Control what each team member can access and modify in the system.",
        steps: [
          "Choose from Employee, Manager, or Admin roles",
          "Customize specific permissions as needed",
          "Set financial approval limits",
          "Review and update permissions regularly",
          "Document permission changes for security"
        ]
      }
    ]
  },
  onboarding: {
    title: "Onboarding",
    description: "Get started with system setup and data import",
    sections: [
      {
        title: "Initial System Setup",
        content: "Configure your CRM for optimal use with your business processes.",
        icon: UserPlus,
        steps: [
          "Complete your company profile information",
          "Upload your company logo and branding",
          "Set up your team members and roles",
          "Configure basic system preferences",
          "Import existing customer data"
        ],
        tips: "Take time to set up the system properly - it will save time later"
      },
      {
        title: "Importing Customer Data",
        content: "Bring your existing customer information into the system.",
        steps: [
          "Prepare your data in CSV format",
          "Use the import wizard to map fields",
          "Review and clean data before final import",
          "Verify imported data is accurate",
          "Set up any missing information"
        ]
      }
    ]
  },
  settings: {
    title: "Settings",
    description: "Configure your workspace, preferences, and integrations",
    sections: [
      {
        title: "General Settings",
        content: "Manage your profile, workspace name, timezone, and language preferences.",
        icon: Settings,
        steps: [
          "Navigate to Settings from the sidebar",
          "Update your display name and contact email",
          "Set your preferred timezone and date format",
          "Choose your default language",
          "Save changes to apply immediately"
        ],
        tips: "Changes to timezone affect how dates display across the entire CRM"
      },
      {
        title: "Appearance & Themes",
        content: "Customise the look and feel of your workspace with light, dark, or system themes.",
        steps: [
          "Go to Settings → Appearance",
          "Select a theme: Light, Dark, or System",
          "Preview the colour palette for your chosen theme",
          "Check the readability preview to ensure text is clear",
          "Theme changes apply instantly across the app"
        ]
      },
      {
        title: "Company & Branding",
        content: "Set up your company details used in quotes, invoices, and email communications.",
        steps: [
          "Upload your company logo",
          "Fill in business name, address, and VAT/tax number",
          "Configure email sender name and reply-to address",
          "Set default currency and payment terms",
          "These details auto-populate in financial documents"
        ],
        tips: "A complete company profile builds trust with customers on every quote and invoice"
      },
      {
        title: "Security Settings",
        content: "Control authentication, session timeouts, and audit trail settings.",
        steps: [
          "Enable two-factor authentication for your account",
          "Set session timeout duration",
          "Review recent login history",
          "Configure password complexity requirements",
          "Access the full audit log from here"
        ]
      }
    ]
  },
  integrations: {
    title: "Integrations",
    description: "Connect external tools, APIs, and webhooks to your CRM",
    sections: [
      {
        title: "API Endpoints (Triggers)",
        content: "Create unique API endpoints that external tools can send data to, automatically ingesting leads, updating customers, or searching records.",
        icon: Webhook,
        steps: [
          "Click 'Create API Endpoint' and give it a descriptive name",
          "Copy the unique URL generated for your endpoint",
          "Paste the URL into your external tool (Zapier, Make, website form, etc.)",
          "Send a test payload using the ••• menu → Test",
          "Monitor incoming events in the webhook logs"
        ],
        tips: "Name your endpoint with keywords like 'find', 'update', or 'create' to control the operation type automatically"
      },
      {
        title: "Webhook Connections",
        content: "Set up outbound webhooks to notify external services when events happen inside Quikle.",
        steps: [
          "Navigate to Integrations → Webhooks tab",
          "Add a new connection with the target URL",
          "Select which CRM events should trigger the webhook",
          "Test the connection to verify delivery",
          "Monitor trigger counts and last-triggered timestamps"
        ]
      },
      {
        title: "Data Sync Rules",
        content: "Keep data synchronised between Quikle and external systems like accounting software or marketing platforms.",
        steps: [
          "Create a new sync rule with source and target systems",
          "Choose the data type to sync (customers, invoices, etc.)",
          "Set the sync frequency (real-time, hourly, daily)",
          "Define the sync direction (one-way or bidirectional)",
          "Review sync history and resolve any conflicts"
        ]
      }
    ]
  },
  finance: {
    title: "Finance",
    description: "Track customer balances, transactions, and financial health",
    sections: [
      {
        title: "Customer Finance Overview",
        content: "View and manage financial summaries for each customer including balances, credit limits, and payment history.",
        icon: DollarSign,
        steps: [
          "Navigate to Finance from the sidebar",
          "Select a customer to view their financial profile",
          "Review current balance, credit limit, and risk rating",
          "Check recent transactions and payment history",
          "Add finance notes for internal tracking"
        ],
        tips: "Set credit limits proactively to prevent overdue balances from growing unchecked"
      },
      {
        title: "Transactions & Payments",
        content: "Record and track all financial transactions tied to customers.",
        steps: [
          "View transactions filtered by type (payment, charge, credit)",
          "Add new manual transactions with reference numbers",
          "Track payment methods and due dates",
          "Monitor balance-after amounts for audit trails",
          "Export transaction history for accounting"
        ]
      },
      {
        title: "Debtor Management",
        content: "Track overdue accounts and manage collections with structured follow-up workflows.",
        steps: [
          "Filter customers by account status (overdue, at risk)",
          "Add debtor notes with priority and follow-up dates",
          "Set up automated payment reminders via automation settings",
          "Track resolution progress over time",
          "Flag accounts that need escalation"
        ]
      }
    ]
  },
  'audit-log': {
    title: "Audit Log",
    description: "Track all system activity for security and compliance",
    sections: [
      {
        title: "Understanding the Audit Log",
        content: "The audit log records every significant action taken in your CRM, providing a complete trail for security reviews and compliance.",
        icon: Shield,
        steps: [
          "Access Audit Log from the sidebar (Admin only)",
          "Filter by date range, user, or action type",
          "Review entries showing who did what and when",
          "Export logs for external compliance tools",
          "Set up alerts for sensitive actions"
        ],
        tips: "Regular audit log reviews help catch unusual activity early and maintain data integrity"
      },
      {
        title: "Action Types Tracked",
        content: "The system tracks a wide range of actions for comprehensive visibility.",
        steps: [
          "Customer records: creates, updates, deletes, status changes",
          "Financial actions: invoice creation, payment recording, credit adjustments",
          "Employee actions: login/logout, permission changes, data access",
          "System changes: settings updates, integration modifications",
          "File access: document views, downloads, and shares"
        ]
      }
    ]
  },
  'customer-insights': {
    title: "Customer Insights",
    description: "Advanced analytics and AI-powered customer intelligence",
    sections: [
      {
        title: "Insights Dashboard",
        content: "Get a deep understanding of customer behaviour, trends, and opportunities through visual analytics.",
        icon: LineChart,
        steps: [
          "Navigate to Customer Insights from Analytics",
          "Review customer segmentation charts",
          "Analyse engagement patterns over time",
          "Identify at-risk customers for proactive outreach",
          "Monitor customer lifetime value trends"
        ],
        tips: "Use insights to personalise your outreach — customers who feel understood are more likely to stay"
      },
      {
        title: "Reporting & Export",
        content: "Generate detailed customer reports for stakeholders and strategic planning.",
        steps: [
          "Select the metrics and date range for your report",
          "Choose chart types and visualisation options",
          "Export as PDF or spreadsheet for sharing",
          "Schedule recurring reports for automated delivery",
          "Compare periods to track improvement"
        ]
      }
    ]
  }
};
