import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns true when the currently signed-in user is the shared demo user.
 * Cached for the session.
 */
export const useIsDemoMode = () => {
  const { data } = useQuery({
    queryKey: ["is-demo-mode"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return false;
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_demo")
        .eq("id", auth.user.id)
        .maybeSingle();
      return !!profile?.is_demo;
    },
    staleTime: 5 * 60 * 1000,
  });
  return !!data;
};
