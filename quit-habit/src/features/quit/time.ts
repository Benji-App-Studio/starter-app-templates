import { useEffect, useState } from 'react';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;
export const MINUTE_MS = 60 * 1000;

export type Duration = { days: number; hours: number; minutes: number; seconds: number };

export function splitDuration(ms: number): Duration {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** "12 days", "1 day 4 hours", "3 hours", "12 minutes". Two largest units at most. */
export function formatDuration(ms: number): string {
  const { days, hours, minutes } = splitDuration(ms);
  const parts: string[] = [];
  if (days > 0) {
    parts.push(plural(days, 'day'));
  }
  if (hours > 0 && days < 7) {
    parts.push(plural(hours, 'hour'));
  }
  if (days === 0 && hours < 3) {
    parts.push(plural(Math.max(minutes, hours === 0 && minutes === 0 ? 1 : minutes), 'minute'));
  }
  return parts.slice(0, 2).join(' ');
}

/** "4h 12m" for compact spots. */
export function formatDurationShort(ms: number): string {
  const { days, hours, minutes } = splitDuration(ms);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${Math.max(1, minutes)}m`;
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** The current time, refreshed every `intervalMs`. Drives every live number on screen. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
