/** "45 min", "1 h 30 min", or "Off" for the timer setting. */
export function formatTimer(minutes: number | null): string {
  if (minutes === null) {
    return 'Off';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const rest = minutes % 60;
  return rest === 0 ? `${minutes / 60} h` : `${Math.floor(minutes / 60)} h ${rest} min`;
}

/** "44:59" or "1:29:59" for a running countdown. */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

/** "1 h 12 min" or "35 min" for a length of time already spent. */
export function formatDuration(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  return formatTimer(minutes);
}

/** "Tonight", "Last night", "Tue 24 Nov" for a session start. */
export function formatNight(timestamp: number, now = Date.now()): string {
  const day = (t: number) => {
    // A night that starts before 6 am belongs to the evening before it.
    const d = new Date(t - 6 * 3600_000);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const diff = Math.round((day(now) - day(timestamp)) / 86_400_000);
  if (diff <= 0) {
    return 'Tonight';
  }
  if (diff === 1) {
    return 'Last night';
  }
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
