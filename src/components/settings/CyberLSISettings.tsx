import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

/**
 * Opt-in CyberLSI MFA settings card.
 * Lives inside the existing General settings section so users with
 * the CyberLSI app can enable it. Users without the app can ignore it.
 */
const CyberLSISettings = () => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [cyberlsiUserId, setCyberlsiUserId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = profile as (typeof profile & {
      cyberlsi_enabled?: boolean | null;
      cyberlsi_user_id?: string | null;
    }) | null;
    if (p) {
      setEnabled(!!p.cyberlsi_enabled);
      setCyberlsiUserId(p.cyberlsi_user_id || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;

    if (enabled && !cyberlsiUserId.trim()) {
      toast({
        title: "CyberLSI user ID required",
        description: "Enter the user ID from your CyberLSI app to enable sign-in.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          cyberlsi_enabled: enabled,
          cyberlsi_user_id: enabled ? cyberlsiUserId.trim() : null,
          cyberlsi_linked_at: enabled ? new Date().toISOString() : null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: enabled ? "CyberLSI enabled" : "CyberLSI disabled",
        description: enabled
          ? "You can now sign in to the CRM from your CyberLSI app."
          : "CyberLSI sign-in has been turned off for your account.",
      });

      refetch();
    } catch (err) {
      toast({
        title: "Couldn't save",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle>CyberLSI Sign-in</CardTitle>
        </div>
        <CardDescription>
          Optional. If you use the CyberLSI mobile app, enable this to sign in to the CRM directly from your phone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="cyberlsi-enabled" className="text-base">
              Enable CyberLSI sign-in
            </Label>
            <p className="text-sm text-muted-foreground">
              Only turn this on if you have the CyberLSI app installed.
            </p>
          </div>
          <Switch
            id="cyberlsi-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={saving}
          />
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label htmlFor="cyberlsi-user-id">CyberLSI User ID</Label>
            <Input
              id="cyberlsi-user-id"
              value={cyberlsiUserId}
              onChange={(e) => setCyberlsiUserId(e.target.value)}
              placeholder="e.g. tom.davis.01.03"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              The user ID shown in your CyberLSI mobile app. Required to link your accounts.
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default CyberLSISettings;
