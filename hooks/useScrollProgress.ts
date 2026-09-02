'use client';

import { useScroll } from '@react-three/drei';
import { useMemo } from 'react';

export function useScrollProgress() {
  const { scroll, pages } = useScroll();
  
  const progress = useMemo(() => {
    if (pages <= 1) return 0;
    return scroll.current / (pages - 1);
  }, [scroll.current, pages]);

  return progress;
}

export function useSceneProgress(sceneStart: number, sceneEnd: number) {
  const progress = useScrollProgress();
  
  const sceneProgress = useMemo(() => {
    const clamped = Math.max(0, Math.min(1, (progress - sceneStart) / (sceneEnd - sceneStart)));
    return clamped;
  }, [progress, sceneStart, sceneEnd]);

  return sceneProgress;
}

export function useScrollDirection() {
  const { scroll } = useScroll();
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const lastScroll = useRef(scroll.current);

  useEffect(() => {
    if (scroll.current > lastScroll.current) {
      setDirection('down');
    } else if (scroll.current < lastScroll.current) {
      setDirection('up');
    }
    lastScroll.current = scroll.current;
  }, [scroll.current]);

  return direction;
}