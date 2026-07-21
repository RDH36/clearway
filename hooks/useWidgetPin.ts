import { useEffect, useRef, useState } from 'react';
import { pinnedWidgetCount, requestPinClearwayWidget } from '@/modules/widget-pin';
import { refreshWidget } from '@/components/widget/refresh';
import { haptics } from '@/lib/haptics';

export type WidgetPinStatus = 'idle' | 'waiting' | 'help' | 'added';

const POLL_MS = 1000;
const HELP_AFTER_MS = 8000;

export function useWidgetPin(onAdded?: () => void) {
  const [status, setStatus] = useState<WidgetPinStatus>('idle');
  const baseline = useRef(0);
  const startedAt = useRef(0);
  const onAddedRef = useRef(onAdded);

  useEffect(() => {
    onAddedRef.current = onAdded;
  });

  useEffect(() => {
    if (status !== 'waiting' && status !== 'help') return;
    const id = setInterval(() => {
      if (pinnedWidgetCount() > baseline.current) {
        haptics.milestone();
        setStatus('added');
        refreshWidget();
        onAddedRef.current?.();
        return;
      }
      if (status === 'waiting' && Date.now() - startedAt.current >= HELP_AFTER_MS) {
        setStatus('help');
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [status]);

  const request = () => {
    haptics.tap();
    baseline.current = pinnedWidgetCount();
    startedAt.current = Date.now();
    setStatus(requestPinClearwayWidget() ? 'waiting' : 'help');
  };

  const dismissHelp = () => setStatus('idle');

  return { status, request, dismissHelp };
}
