import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response('Server error', { status: 500, headers: corsHeaders });
    }

    const body = await req.text();

    // Verify Paystack signature (REQUIRED for production security)
    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
      console.error('Missing Paystack webhook signature');
      return new Response('Missing signature', { status: 401, headers: corsHeaders });
    }
    
    const hash = createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature');
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { event: eventType, data } = event;

    switch (eventType) {
      case 'charge.success': {
        const userId = data.metadata?.user_id;
        const planName = data.metadata?.plan_name;

        if (!userId) {
          console.error('No user_id in metadata');
          break;
        }

        // Update subscription to active
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_name: planName || 'Solo',
            plan_amount: data.amount / 100,
            currency: data.currency,
            status: 'active',
            paystack_reference: data.reference,
            paystack_customer_code: data.customer?.customer_code || null,
            paystack_authorization_code: data.authorization?.authorization_code || null,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error updating subscription:', error);
        }

        // Log event
        await supabase.from('subscription_events').insert({
          user_id: userId,
          event_type: 'payment_success',
          paystack_reference: data.reference,
          metadata: {
            amount: data.amount / 100,
            currency: data.currency,
            plan_name: planName,
            channel: data.channel,
          },
        });

        console.log(`Subscription activated for user ${userId}, plan: ${planName}`);
        break;
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        const subCode = data.subscription_code;
        
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('paystack_subscription_code', subCode)
          .maybeSingle();

        if (sub) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('user_id', sub.user_id);

          await supabase.from('subscription_events').insert({
            user_id: sub.user_id,
            event_type: eventType,
            metadata: data,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const custCode = data.customer?.customer_code;
        
        if (custCode) {
          const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('paystack_customer_code', custCode)
            .maybeSingle();

          if (sub) {
            await supabase
              .from('user_subscriptions')
              .update({ status: 'past_due' })
              .eq('user_id', sub.user_id);

            await supabase.from('subscription_events').insert({
              user_id: sub.user_id,
              event_type: 'payment_failed',
              metadata: data,
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
