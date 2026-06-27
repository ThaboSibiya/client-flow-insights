import { Info } from "lucide-react";
import { useIsDemoMode } from "@/hooks/useIsDemoMode";

const DemoBanner = () => {
  const isDemo = useIsDemoMode();
  if (!isDemo) return null;

  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 text-primary text-xs px-4 py-2 flex items-center justify-center gap-2">
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span>
        <strong>Demo mode</strong> — data resets hourly. External actions (email, SMS, payments) are disabled.
      </span>
    </div>
  );
};

export default DemoBanner;
