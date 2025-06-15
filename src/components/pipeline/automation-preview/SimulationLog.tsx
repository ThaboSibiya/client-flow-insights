
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface SimulationLogProps {
    log: string[];
}

const SimulationLog = ({ log }: SimulationLogProps) => {
    if (log.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 pt-4">
            <h4 className="font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Simulation Log</h4>
            <ScrollArea className="h-48 w-full rounded-md border bg-muted/30 font-mono text-xs">
                <div className="p-3">
                    {log.map((log, i) => (
                        <p key={i} className="whitespace-pre-wrap">{log}</p>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default SimulationLog;
