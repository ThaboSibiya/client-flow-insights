/**
 * Form Submission Service with PII Encryption
 * Handles secure storage and retrieval of form submissions with encrypted PII
 */

import { supabase } from '@/integrations/supabase/client';
import { encryptPII, decryptPII, encryptPIIFields, decryptPIIFields } from '@/utils/piiEncryption';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';
import type { Database } from '@/integrations/supabase/types';

export interface FormSubmissionData {
  id?: string;
  company_owner_id?: string;
  form_name: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  form_data: any;
  source_url?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  processed?: boolean;
  created_at?: string;
}

/**
 * Creates a new form submission with encrypted PII
 */
export async function createFormSubmission(
  submission: Omit<FormSubmissionData, 'id' | 'created_at'>
): Promise<{ data: FormSubmissionData | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Encrypt PII fields
    const encryptedData = await encryptPIIFields(submission, [
      'customer_name',
      'customer_email',
      'customer_phone'
    ]);

    const { data, error } = await supabase
      .from('form_submissions')
      .insert({
        ...encryptedData,
        company_owner_id: user.id,
      })
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
      metadata: { form_name: submission.form_name }
    });

    return { data: decryptedData, error: null };
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

    return { data: decryptedData, error: null };
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

    const { data, error } = await supabase
      .from('form_submissions')
      .update(encryptedUpdates)
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

    return { data: decryptedData, error: null };
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
