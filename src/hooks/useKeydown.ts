import { useEffect, useRef } from 'react';

export function useKeydown(handler: (e: KeyboardEvent) => void) {
  const cb = useRef(handler);
  cb.current = handler;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => cb.current(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
