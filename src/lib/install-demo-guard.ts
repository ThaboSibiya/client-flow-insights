import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isDemoModeSync, primeDemoGuard } from "@/lib/demo-guard";

/**
 * Edge functions that have real-world side effects (send messages, charge money,
 * provision users). Blocked when the signed-in user is in demo mode.
 */
const BLOCKED_FUNCTIONS = new Set<string>([
  // Email
  "send-email",
  "send-transactional-email",
  "send-validated-email",
  "send-notification-email",
  "send-reminder-with-invoices",
  "send-employee-invitation",
  "sync-emails",
  // Messaging
  "send-whatsapp",
  "send-telegram",
  "send-sms",
  // Billing
  "paystack-initialize",
  "paystack-verify",
  "paystack-cancel",
  "paystack-webhook",
  // Outbound webhooks
  "webhook-dispatch",
  "trigger-webhook",
]);

let installed = false;

/**
 * Monkey-patches `supabase.functions.invoke` so demo-mode users cannot trigger
 * destructive/external side effects, without having to edit every call site.
 */
export const installDemoGuard = () => {
  if (installed) return;
  installed = true;

  // Populate the sync cache used by isDemoModeSync().
  void primeDemoGuard();

  // Re-prime on auth changes so launching the demo flips the flag without reload.
  supabase.auth.onAuthStateChange(() => {
    void primeDemoGuard();
  });

  const originalInvoke = supabase.functions.invoke.bind(supabase.functions);

  (supabase.functions as any).invoke = async (
    functionName: string,
    options?: any
  ) => {
    if (isDemoModeSync() && BLOCKED_FUNCTIONS.has(functionName)) {
      toast.info("This action is disabled in demo mode.", {
        description: `Outbound call to "${functionName}" was blocked.`,
      });
      return {
        data: null,
        error: {
          name: "DemoModeBlocked",
          message: `"${functionName}" is disabled in demo mode.`,
          context: { demoBlocked: true },
        },
      };
    }
    return originalInvoke(functionName, options);
  };
};
