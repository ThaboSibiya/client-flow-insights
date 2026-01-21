/**
 * Form Submission Service with PII Encryption
 * Handles secure storage and retrieval of form submissions with encrypted PII
 * Includes validation and sanitization for all form data
 */

import { supabase } from '@/integrations/supabase/client';
import { encryptPII, decryptPII, encryptPIIFields, decryptPIIFields } from '@/utils/piiEncryption';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';
import { validateAndSanitizeFormSubmission, redactFormDataForLogging } from '@/utils/formDataSanitization';
import type { Database, Json } from '@/integrations/supabase/types';

export interface FormSubmissionData {
  id?: string;
  company_owner_id?: string;
  form_name: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  form_data: Json;
  source_url?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  processed?: boolean;
  created_at?: string;
}

/**
 * Creates a new form submission with validation, sanitization, and encrypted PII
 */
export async function createFormSubmission(
  submission: Omit<FormSubmissionData, 'id' | 'created_at'>
): Promise<{ data: FormSubmissionData | null; error: Error | null; validationErrors?: string[] }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate and sanitize the submission (including form_data)
    const { data: validatedData, encryptedFields, errors } = await validateAndSanitizeFormSubmission(submission);
    
    if (errors) {
      const errorMessages = errors.errors.map(e => e.message);
      logSecureSecurityEvent({
        action: 'form_submission_validation_rejected',
        resource_type: 'form_submission',
        success: false,
        metadata: { errors: errorMessages }
      });
      return { 
        data: null, 
        error: new Error('Validation failed: ' + errorMessages.join(', ')),
        validationErrors: errorMessages
      };
    }

    if (!validatedData) {
      throw new Error('Form validation failed with no specific errors');
    }

    // Encrypt additional PII fields (customer_name, customer_email, customer_phone)
    const encryptedData = await encryptPIIFields(validatedData, [
      'customer_name',
      'customer_email',
      'customer_phone'
    ]);

    const { data, error } = await supabase
      .from('form_submissions')
      .insert([{
        form_name: encryptedData.form_name,
        customer_name: encryptedData.customer_name || null,
        customer_email: encryptedData.customer_email || null,
        customer_phone: encryptedData.customer_phone || null,
        form_data: (encryptedData.form_data || {}) as Json,
        source_url: encryptedData.source_url || null,
        processed: encryptedData.processed || false,
        company_owner_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    // Decrypt for return
    const decryptedData = data ? await decryptPIIFields(data, [
      'customer_name',
      'customer_email',
      'customer_phone'
    ]) : null;

    logSecureSecurityEvent({
      action: 'form_submission_created',
      resource_type: 'form_submission',
      resource_id: data?.id,
      success: true,
      metadata: { 
        form_name: submission.form_name,
        encrypted_fields_in_form_data: encryptedFields.length,
        form_data_redacted: submission.form_data && typeof submission.form_data === 'object' && !Array.isArray(submission.form_data)
          ? redactFormDataForLogging(submission.form_data as Record<string, unknown>) 
          : {}
      }
    });

    return { data: decryptedData as FormSubmissionData, error: null };
  } catch (error) {
    console.error('Error creating form submission:', error);
    logSecureSecurityEvent({
      action: 'form_submission_creation_failed',
      resource_type: 'form_submission',
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves form submissions with decrypted PII
 */
export async function getFormSubmissions(
  filters?: {
    processed?: boolean;
    form_name?: string;
    limit?: number;
  }
): Promise<{ data: FormSubmissionData[] | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('form_submissions')
      .select('*')
      .eq('company_owner_id', user.id)
      .order('created_at', { ascending: false });

    if (filters?.processed !== undefined) {
      query = query.eq('processed', filters.processed);
    }

    if (filters?.form_name) {
      query = query.eq('form_name', filters.form_name);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Decrypt PII fields for all submissions
    const decryptedData = data ? await Promise.all(
      data.map(submission => decryptPIIFields(submission, [
        'customer_name',
        'customer_email',
        'customer_phone'
      ]))
    ) : null;

    logSecureSecurityEvent({
      action: 'form_submissions_retrieved',
      resource_type: 'form_submission',
      success: true,
      metadata: { count: data?.length || 0 }
    });

    return { data: decryptedData as FormSubmissionData[], error: null };
  } catch (error) {
    console.error('Error retrieving form submissions:', error);
    logSecureSecurityEvent({
      action: 'form_submissions_retrieval_failed',
      resource_type: 'form_submission',
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a form submission (e.g., marking as processed)
 */
export async function updateFormSubmission(
  id: string,
  updates: Partial<FormSubmissionData>
): Promise<{ data: FormSubmissionData | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Encrypt PII fields if they're being updated
    const encryptedUpdates = await encryptPIIFields(updates, [
      'customer_name',
      'customer_email',
      'customer_phone'
    ]);

    // Convert form_data to Json type if present
    const updatePayload = {
      ...encryptedUpdates,
      ...(encryptedUpdates.form_data ? { form_data: encryptedUpdates.form_data as Json } : {}),
    };

    const { data, error } = await supabase
      .from('form_submissions')
      .update(updatePayload)
      .eq('id', id)
      .eq('company_owner_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Decrypt for return
    const decryptedData = data ? await decryptPIIFields(data, [
      'customer_name',
      'customer_email',
      'customer_phone'
    ]) : null;

    logSecureSecurityEvent({
      action: 'form_submission_updated',
      resource_type: 'form_submission',
      resource_id: id,
      success: true
    });

    return { data: decryptedData as FormSubmissionData, error: null };
  } catch (error) {
    console.error('Error updating form submission:', error);
    logSecureSecurityEvent({
      action: 'form_submission_update_failed',
      resource_type: 'form_submission',
      resource_id: id,
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a form submission (with audit log)
 */
export async function deleteFormSubmission(
  id: string
): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('form_submissions')
      .delete()
      .eq('id', id)
      .eq('company_owner_id', user.id);

    if (error) throw error;

    logSecureSecurityEvent({
      action: 'form_submission_deleted',
      resource_type: 'form_submission',
      resource_id: id,
      success: true,
      metadata: { reason: 'user_requested' }
    });

    return { error: null };
  } catch (error) {
    console.error('Error deleting form submission:', error);
    logSecureSecurityEvent({
      action: 'form_submission_deletion_failed',
      resource_type: 'form_submission',
      resource_id: id,
      success: false,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    return { error: error as Error };
  }
}
