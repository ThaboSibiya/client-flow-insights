import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

let cached: boolean | null = null;

/**
 * Synchronously checks the cached demo flag. Returns false if cache is empty.
 * Call `primeDemoGuard()` once on app load to populate.
 */
export const isDemoModeSync = () => cached === true;

export const primeDemoGuard = async () => {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      cached = false;
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("is_demo")
      .eq("id", auth.user.id)
      .maybeSingle();
    cached = !!data?.is_demo;
  } catch {
    cached = false;
  }
};

export const clearDemoGuardCache = () => {
  cached = null;
};

/**
 * Use to block destructive/external actions in demo mode.
 * Returns true when the action should be blocked (and toasts the user).
 */
export const blockedInDemo = (actionLabel = "This action") => {
  if (isDemoModeSync()) {
    toast.info(`${actionLabel} is disabled in demo mode.`);
    return true;
  }
  return false;
};
