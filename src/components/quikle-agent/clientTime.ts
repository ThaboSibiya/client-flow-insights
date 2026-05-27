// Client-side time awareness payload shared by every agent request.
export interface ClientTime {
  iso: string;
  timezone: string;
  localHour: number;
  partOfDay: 'late night' | 'morning' | 'afternoon' | 'evening' | 'night';
  localDate: string; // YYYY-MM-DD in user's local zone
}

function partOfDay(hour: number): ClientTime['partOfDay'] {
  if (hour < 5) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export function getClientTime(): ClientTime {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const localHour = now.getHours();
  // YYYY-MM-DD in local time (avoids UTC drift across midnight)
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return {
    iso: now.toISOString(),
    timezone,
    localHour,
    partOfDay: partOfDay(localHour),
    localDate: `${y}-${m}-${d}`,
  };
}

export function localDateFromIso(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
