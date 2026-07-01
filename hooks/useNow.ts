/**
 * Ticking clock. Returns Date.now() on an interval so screens re-derive from the
 * single quit-timestamp every tick — we never store a running counter (spec §1).
 */
import { useEffect, useState } from 'react';

export function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
