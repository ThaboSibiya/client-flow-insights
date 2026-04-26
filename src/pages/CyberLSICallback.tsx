import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Status = "validating" | "redirecting" | "error" | "not_linked";

const CyberLSICallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("validating");
  const [message, setMessage] = useState<string>("Verifying your CyberLSI sign-in…");

  useEffect(() => {
    const authParam = searchParams.get("authParam");

    if (!authParam) {
      setStatus("error");
      setMessage("Missing authentication parameter. Please try again from the CyberLSI app.");
      return;
    }

    let cancelled = false;

    const validate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("cyberlsi-validate", {
          body: { authParam },
        });

        if (cancelled) return;

        if (error) {
          setStatus("error");
          setMessage(error.message || "We couldn't verify your CyberLSI sign-in.");
          return;
        }

        if (!data?.isValid) {
          setStatus("error");
          setMessage(data?.message || "Your CyberLSI sign-in could not be verified.");
          return;
        }

        if (!data.linked) {
          setStatus("not_linked");
          setMessage(
            data.message ||
              "Your CyberLSI account isn't linked to a CRM user yet. Sign in with email and link CyberLSI from your profile.",
          );
          return;
        }

        if (data.signInUrl) {
          setStatus("redirecting");
          setMessage("Sign-in verified. Redirecting…");
          // The magic-link URL will sign the user in and redirect back into the app.
          window.location.replace(data.signInUrl);
          return;
        }

        setStatus("error");
        setMessage("Unexpected response from CyberLSI verification.");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Unexpected error during verification.");
      }
    };

    validate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const Icon =
    status === "validating" || status === "redirecting"
      ? Loader2
      : status === "not_linked"
      ? ShieldAlert
      : status === "error"
      ? ShieldAlert
      : ShieldCheck;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon
              className={`h-6 w-6 text-primary ${
                status === "validating" || status === "redirecting" ? "animate-spin" : ""
              }`}
            />
          </div>
          <CardTitle>CyberLSI Sign-in</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {(status === "error" || status === "not_linked") && (
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => navigate("/auth")} className="w-full">
              Go to sign-in
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CyberLSICallback;
