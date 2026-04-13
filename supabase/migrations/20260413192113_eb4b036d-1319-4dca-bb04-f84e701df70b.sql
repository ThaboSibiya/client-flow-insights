-- Fix 1: Customer Documents bucket - restrict SELECT to owner-scoped
DROP POLICY IF EXISTS "Allow authenticated users to read their own files" ON storage.objects;
CREATE POLICY "Allow authenticated users to read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-docs'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Fix 1b: Tighten INSERT policy too
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-docs'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Fix 2: Security Definer View - recreate with security_invoker
DROP VIEW IF EXISTS public.v_reconciliation_overview;
CREATE VIEW public.v_reconciliation_overview
WITH (security_invoker = true)
AS
SELECT
  r.id AS reconciliation_id,
  r.customer_id,
  r.invoice_id,
  i.invoice_number,
  r.payment_id,
  p.payment_number,
  r.matched_amount,
  r.reconciliation_status,
  GREATEST(
    COALESCE(i.updated_at, i.created_at),
    COALESCE(p.updated_at, p.created_at),
    r.updated_at,
    r.created_at
  ) AS last_activity_at
FROM reconciliations r
LEFT JOIN invoices i ON i.id = r.invoice_id
LEFT JOIN payments p ON p.id = r.payment_id;