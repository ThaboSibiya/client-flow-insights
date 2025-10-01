
import { supabase } from '@/integrations/supabase/client';

const defaultTemplates = [
  {
    name: 'Printer Services',
    industry: 'printer_services',
    description: 'Template for printer service companies',
    fields: [
      {
        field_name: 'company_name',
        field_label: 'Company Name',
        field_type: 'text',
        is_required: true,
        display_order: 1,
        field_options: { placeholder: 'Enter company name' }
      },
      {
        field_name: 'company_address',
        field_label: 'Company Address',
        field_type: 'textarea',
        is_required: false,
        display_order: 2,
        field_options: { placeholder: 'Enter company address' }
      },
      {
        field_name: 'contact_person',
        field_label: 'Contact Person',
        field_type: 'text',
        is_required: true,
        display_order: 3,
        field_options: { placeholder: 'Enter contact person name' }
      },
      {
        field_name: 'printer_brand',
        field_label: 'Printer Brand',
        field_type: 'select',
        is_required: true,
        display_order: 4,
        field_options: { 
          options: ['HP', 'Canon', 'Epson', 'Brother', 'Xerox', 'Lexmark', 'Other'] 
        }
      },
      {
        field_name: 'printer_model',
        field_label: 'Printer Model',
        field_type: 'text',
        is_required: true,
        display_order: 5,
        field_options: { placeholder: 'Enter printer model' }
      },
      {
        field_name: 'serial_number',
        field_label: 'Serial Number',
        field_type: 'text',
        is_required: false,
        display_order: 6,
        field_options: { placeholder: 'Enter serial number' }
      },
      {
        field_name: 'purchase_date',
        field_label: 'Purchase Date',
        field_type: 'date',
        is_required: false,
        display_order: 7,
        field_options: {}
      },
      {
        field_name: 'service_contract',
        field_label: 'Service Contract Number',
        field_type: 'text',
        is_required: false,
        display_order: 8,
        field_options: { placeholder: 'Enter service contract number' }
      }
    ]
  },
  {
    name: 'Insurance Services',
    industry: 'insurance',
    description: 'Template for insurance companies',
    fields: [
      {
        field_name: 'policy_type',
        field_label: 'Policy Type',
        field_type: 'select',
        is_required: true,
        display_order: 1,
        field_options: { 
          options: ['Life Insurance', 'Car Insurance', 'Home Insurance', 'Business Insurance', 'Health Insurance'] 
        }
      },
      {
        field_name: 'policy_number',
        field_label: 'Policy Number',
        field_type: 'text',
        is_required: false,
        display_order: 2,
        field_options: { placeholder: 'Enter policy number' }
      },
      {
        field_name: 'coverage_amount',
        field_label: 'Coverage Amount',
        field_type: 'number',
        is_required: false,
        display_order: 3,
        field_options: { placeholder: 'Enter coverage amount' }
      },
      {
        field_name: 'premium_frequency',
        field_label: 'Premium Frequency',
        field_type: 'select',
        is_required: false,
        display_order: 4,
        field_options: { 
          options: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'] 
        }
      },
      {
        field_name: 'beneficiary',
        field_label: 'Beneficiary',
        field_type: 'text',
        is_required: false,
        display_order: 5,
        field_options: { placeholder: 'Enter beneficiary name' }
      }
    ]
  },
  {
    name: 'Real Estate',
    industry: 'real_estate',
    description: 'Template for real estate agencies',
    fields: [
      {
        field_name: 'property_type',
        field_label: 'Property Type',
        field_type: 'select',
        is_required: true,
        display_order: 1,
        field_options: { 
          options: ['House', 'Apartment', 'Townhouse', 'Commercial', 'Land', 'Other'] 
        }
      },
      {
        field_name: 'property_address',
        field_label: 'Property Address',
        field_type: 'textarea',
        is_required: true,
        display_order: 2,
        field_options: { placeholder: 'Enter property address' }
      },
      {
        field_name: 'budget_range',
        field_label: 'Budget Range',
        field_type: 'select',
        is_required: false,
        display_order: 3,
        field_options: { 
          options: ['Under R500k', 'R500k - R1M', 'R1M - R2M', 'R2M - R5M', 'Above R5M'] 
        }
      },
      {
        field_name: 'bedrooms',
        field_label: 'Number of Bedrooms',
        field_type: 'number',
        is_required: false,
        display_order: 4,
        field_options: { placeholder: 'Enter number of bedrooms' }
      },
      {
        field_name: 'bathrooms',
        field_label: 'Number of Bathrooms',
        field_type: 'number',
        is_required: false,
        display_order: 5,
        field_options: { placeholder: 'Enter number of bathrooms' }
      }
    ]
  },
  {
    name: 'Business Information',
    industry: 'general_business',
    description: 'Template for general business information',
    fields: [
      {
        field_name: 'company_name',
        field_label: 'Company Name',
        field_type: 'text',
        is_required: true,
        display_order: 1,
        field_options: { placeholder: 'Enter company name' }
      },
      {
        field_name: 'contact_person',
        field_label: 'Contact Person',
        field_type: 'text',
        is_required: true,
        display_order: 2,
        field_options: { placeholder: 'Enter contact person name' }
      },
      {
        field_name: 'address',
        field_label: 'Address',
        field_type: 'textarea',
        is_required: true,
        display_order: 3,
        field_options: { placeholder: 'Enter business address' }
      },
      {
        field_name: 'phone_number',
        field_label: 'Phone Number',
        field_type: 'phone',
        is_required: true,
        display_order: 4,
        field_options: { placeholder: 'Enter phone number' }
      }
    ]
  }
];

export const seedDefaultTemplates = async (userId: string) => {
  try {
    // Check if templates already exist
    const { data: existingTemplates } = await supabase
      .from('industry_templates')
      .select('id')
      .limit(1);

    if (existingTemplates && existingTemplates.length > 0) {
      console.log('Templates already exist, skipping seed');
      return;
    }

    console.log('Seeding default templates...');

    for (const template of defaultTemplates) {
      // Create template
      const { data: createdTemplate, error: templateError } = await supabase
        .from('industry_templates')
        .insert({
          name: template.name,
          industry: template.industry,
          description: template.description,
          is_active: true,
          version: 1,
          user_id: userId
        })
        .select('id')
        .single();

      if (templateError) {
        console.error('Error creating template:', templateError);
        continue;
      }

      // Create template fields
      const fieldsToInsert = template.fields.map(field => ({
        template_id: createdTemplate.id,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        field_options: field.field_options,
        is_required: field.is_required,
        display_order: field.display_order
      }));

      const { error: fieldsError } = await supabase
        .from('template_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error('Error creating template fields:', fieldsError);
      }
    }

    console.log('Default templates seeded successfully');
  } catch (error) {
    console.error('Error seeding default templates:', error);
  }
};
