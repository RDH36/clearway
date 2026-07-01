/**
 * Health recovery timeline (spec §3 / design brief B3). Time-based markers that
 * unlock by elapsed clean time. Calm, factual, encouraging — never graphic.
 */
import { DAY_MS, HOUR_MS, MINUTE_MS, MONTH_MS, WEEK_MS } from '@/constants/time';

export type HealthMarker = {
  id: string;
  atMs: number;
  title: string;
  body: string;
};

export type UpcomingMarker = HealthMarker & { inMs: number };

export const HEALTH_MARKERS: HealthMarker[] = [
  {
    id: '20m',
    atMs: 20 * MINUTE_MS,
    title: 'Heart rate settles',
    body: 'Your heart rate and blood pressure start easing back toward normal.',
  },
  {
    id: '8h',
    atMs: 8 * HOUR_MS,
    title: 'Oxygen rebalances',
    body: 'Nicotine levels are dropping and oxygen in your blood is rising.',
  },
  {
    id: '24h',
    atMs: DAY_MS,
    title: 'Carbon monoxide clears',
    body: 'Most carbon monoxide has left your body — breathing feels a little fuller.',
  },
  {
    id: '3d',
    atMs: 3 * DAY_MS,
    title: 'Taste & smell return',
    body: 'Nerve endings recover, so flavours and smells start coming back.',
  },
  {
    id: '1w',
    atMs: WEEK_MS,
    title: 'Cravings begin to ease',
    body: 'The sharpest urges start to space out as your brain rebalances.',
  },
  {
    id: '2w',
    atMs: 2 * WEEK_MS,
    title: 'Breathing easier',
    body: 'Circulation improves and everyday activity starts to feel lighter.',
  },
  {
    id: '1mo',
    atMs: MONTH_MS,
    title: 'Lungs working better',
    body: 'Lung function climbs as airways keep clearing.',
  },
  {
    id: '3mo',
    atMs: 3 * MONTH_MS,
    title: 'Noticeably more capacity',
    body: 'Lung capacity is measurably better — stairs and walks feel easier.',
  },
];

/** Markers whose time has been reached (revealed + lit). */
export function unlocked(msClean: number): HealthMarker[] {
  return HEALTH_MARKERS.filter((m) => msClean >= m.atMs);
}

/** Markers still ahead, each with the time remaining (dimmed + countdown). */
export function upcoming(msClean: number): UpcomingMarker[] {
  return HEALTH_MARKERS.filter((m) => msClean < m.atMs).map((m) => ({
    ...m,
    inMs: m.atMs - msClean,
  }));
}

/** The next marker about to unlock, or null once all are revealed. */
export function nextMarker(msClean: number): UpcomingMarker | null {
  return upcoming(msClean)[0] ?? null;
}
