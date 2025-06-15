
-- Create custom types for status and type to ensure data consistency
CREATE TYPE public.quote_invoice_type AS ENUM ('quote', 'invoice');
CREATE TYPE public.quote_invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'accepted', 'rejected');

-- Create the main table for quotes and invoices
CREATE TABLE public.quotes_invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT,
    "type" public.quote_invoice_type NOT NULL,
    "number" TEXT NOT NULL,
    subject TEXT,
    status public.quote_invoice_status NOT NULL DEFAULT 'draft',
    issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a table for the line items within each quote or invoice
CREATE TABLE public.quote_invoice_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_invoice_id UUID REFERENCES public.quotes_invoices(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    rate NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_quotes_invoices_user_id ON public.quotes_invoices(user_id);
CREATE INDEX idx_quote_invoice_items_quote_invoice_id ON public.quote_invoice_items(quote_invoice_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quotes_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes_invoices
CREATE POLICY "Users can manage their own quotes and invoices"
ON public.quotes_invoices
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for quote_invoice_items
CREATE POLICY "Users can manage their own quote and invoice items"
ON public.quote_invoice_items
FOR ALL
USING (auth.uid() = user_id);
