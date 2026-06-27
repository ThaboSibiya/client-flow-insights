
CREATE OR REPLACE FUNCTION public.seed_demo_workspace(p_workspace_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_owner_id uuid;
  v_customer_id uuid;
  v_invoice_id uuid;
  i int;
  v_names text[] := ARRAY[
    'Acme Industries','Blue Sky Cafe','Coastal Logistics','Delta Engineering','Evergreen Farms',
    'Falcon Security','Greenline Plumbing','Horizon Media','Ivory Dental','Jubilee Catering',
    'Keystone Builders','Lighthouse IT','Maple Auto Repair','Northwind Apparel','Oak Valley Vets',
    'Pinnacle Real Estate','Quartz Studios','Riverside Bakery','Summit Fitness','Trinity Law',
    'Urban Florist','Velocity Couriers','Willow Spa','Xenon Labs','Yellowstone Tours'
  ];
  v_emails text[] := ARRAY['hello','info','contact','admin','sales','team'];
  v_statuses text[] := ARRAY['paid','pending','overdue','partial'];
  v_priorities text[] := ARRAY['low','medium','high','urgent'];
  v_ticket_statuses text[] := ARRAY['open','in_progress','pending','resolved'];
  v_subjects text[] := ARRAY[
    'Quote follow-up needed','Service request for Q3','Invoice discrepancy','New onboarding inquiry',
    'Equipment maintenance booking','Refund request','Contract renewal','Project status update',
    'Payment confirmation','Site visit scheduling','Issue with last delivery','Custom quote request',
    'Renewal reminder','Technical support','Account upgrade question'
  ];
BEGIN
  SELECT created_by INTO v_owner_id FROM public.workspaces WHERE id = p_workspace_id AND is_demo = true;
  IF v_owner_id IS NULL THEN
    RAISE NOTICE 'Workspace % is not a demo workspace, skipping', p_workspace_id;
    RETURN;
  END IF;

  -- Wipe (defensive: catch missing-table or cast errors so the demo still seeds).
  BEGIN
    DELETE FROM public.payments WHERE invoice_id IN (SELECT id FROM public.invoices WHERE workspace_id = p_workspace_id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.invoices WHERE workspace_id = p_workspace_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.ticket_comments WHERE ticket_id IN (SELECT id::text FROM public.tickets WHERE workspace_id = p_workspace_id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.ticket_activities WHERE ticket_id IN (SELECT id FROM public.tickets WHERE workspace_id = p_workspace_id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.tickets WHERE workspace_id = p_workspace_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.followups WHERE customer_id IN (SELECT id FROM public.customers WHERE workspace_id = p_workspace_id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.meeting_notes WHERE customer_id IN (SELECT id FROM public.customers WHERE workspace_id = p_workspace_id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.scheduled_calls WHERE customer_id IN (SELECT id FROM public.customers WHERE workspace_id = p_workspace_id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    DELETE FROM public.customers WHERE workspace_id = p_workspace_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  FOR i IN 1..array_length(v_names, 1) LOOP
    INSERT INTO public.customers (
      workspace_id, user_id, name, email, phone, status, source, created_at
    ) VALUES (
      p_workspace_id,
      v_owner_id,
      v_names[i],
      lower(v_emails[1 + (i % array_length(v_emails,1))]) || '@' || lower(replace(v_names[i],' ','')) || '.demo',
      '+27' || lpad((10000000 + i*7919)::text, 9, '0'),
      CASE WHEN i % 4 = 0 THEN 'lead' WHEN i % 3 = 0 THEN 'prospect' ELSE 'active' END,
      CASE WHEN i % 3 = 0 THEN 'website' WHEN i % 3 = 1 THEN 'referral' ELSE 'cold_outreach' END,
      now() - (i || ' days')::interval
    ) RETURNING id INTO v_customer_id;

    IF i % 2 = 0 THEN
      BEGIN
        INSERT INTO public.invoices (
          workspace_id, user_id, customer_id, invoice_number, total_amount, status, due_date, issue_date
        ) VALUES (
          p_workspace_id,
          v_owner_id,
          v_customer_id,
          'INV-DEMO-' || lpad(i::text, 4, '0'),
          (500 + (i * 137) % 9500)::numeric,
          v_statuses[1 + (i % 4)],
          now() + ((i % 30) - 15 || ' days')::interval,
          now() - (i || ' days')::interval
        ) RETURNING id INTO v_invoice_id;

        IF i % 4 = 0 THEN
          BEGIN
            INSERT INTO public.payments (
              user_id, customer_id, invoice_id, amount, status, payment_method, payment_date, payment_number
            ) VALUES (
              v_owner_id, v_customer_id, v_invoice_id,
              (500 + (i * 137) % 9500)::numeric,
              'completed', 'eft', now() - ((i/2) || ' days')::interval,
              'PAY-DEMO-' || lpad(i::text, 4, '0')
            );
          EXCEPTION WHEN OTHERS THEN NULL; END;
        END IF;
      EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;

    IF i % 5 != 0 THEN
      BEGIN
        INSERT INTO public.tickets (
          workspace_id, user_id, customer_id, subject, description, status, priority, created_at
        ) VALUES (
          p_workspace_id, v_owner_id, v_customer_id,
          v_subjects[1 + (i % array_length(v_subjects,1))],
          'Demo ticket auto-generated for ' || v_names[i] || '. Sample notes about the customer request.',
          v_ticket_statuses[1 + (i % 4)],
          v_priorities[1 + (i % 4)],
          now() - ((i*3) || ' hours')::interval
        );
      EXCEPTION WHEN OTHERS THEN NULL; END;
    END IF;
  END LOOP;
END;
$function$;
