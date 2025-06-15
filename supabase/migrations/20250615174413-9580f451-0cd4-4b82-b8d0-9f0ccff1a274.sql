
-- Add columns to store company address and contact info for invoices/quotes
ALTER TABLE public.profiles
ADD COLUMN company_address TEXT,
ADD COLUMN company_email TEXT,
ADD COLUMN company_phone TEXT;
