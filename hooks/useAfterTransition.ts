import { useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';

export function useAfterTransition(fallbackMs = 600): boolean {
  const navigation = useNavigation();
  const [done, setDone] = useState(false);
  useEffect(() => {
    const unsub = (navigation as { addListener: (t: string, cb: (e: { data?: { closing?: boolean } }) => void) => () => void }).addListener(
      'transitionEnd',
      (e) => {
        if (!e?.data?.closing) setDone(true);
      }
    );
    const t = setTimeout(() => setDone(true), fallbackMs);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, [navigation, fallbackMs]);
  return done;
}
