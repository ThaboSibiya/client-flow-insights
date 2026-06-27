import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const DemoLanding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const launchDemo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("demo-signin");
      if (error || !data?.access_token) {
        throw error ?? new Error("Could not launch demo");
      }
      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionErr) throw sessionErr;

      toast.success("Demo ready — enjoy!");
      navigate("/", { replace: true });
      // Hard reload so providers pick up the new session cleanly
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      console.error(err);
      toast.error("Could not launch demo. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Sales Demo
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Try Quikle, no signup
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            One click drops you into a fully-loaded demo workspace with sample customers,
            tickets, invoices, and a live pipeline. Data resets every hour.
          </p>
        </div>

        <Button
          size="lg"
          onClick={launchDemo}
          disabled={loading}
          className="px-8 h-12 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Preparing your demo…
            </>
          ) : (
            <>
              Launch Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Outbound emails, SMS, and payments are disabled in demo mode.
        </p>
      </div>
    </div>
  );
};

export default DemoLanding;
