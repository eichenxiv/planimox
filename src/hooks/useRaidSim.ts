import { useEffect, useRef, useState } from 'react';
import { useTimelineStore, activeTab } from '../store/useTimelineStore';
import { useSimStore } from '../store/useSimStore';
import { formatTime } from '../lib/timeUtils';

type Status = 'idle' | 'running' | 'paused';

export const COUNTDOWN_OPTIONS = [0, 5, 16, 21];
const DEFAULT_COUNTDOWN = 5;
const TICK_MS = 150;
const AUTO_END_DELAY_SEC = 3;

export function useRaidSim() {
  const skills = useTimelineStore((s) => activeTab(s).bossTimeline.skills);
  const setHighlighted = useSimStore((s) => s.setHighlighted);

  const [status, setStatus] = useState<Status>('idle');
  const [countdownSec, setCountdownSec] = useState(DEFAULT_COUNTDOWN);
  // 초읽기 중에는 남은 시간(음수), 전투 중에는 경과 시간(양수, 초).
  const [clockSec, setClockSec] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const elapsedRef = useRef(0);

  const stop = () => {
    setStatus('idle');
    elapsedRef.current = 0;
    setClockSec(0);
    setHighlighted(null);
  };

  const recompute = () => {
    const countdownMs = countdownSec * 1000;
    if (elapsedRef.current < countdownMs) {
      setClockSec(-Math.ceil((countdownMs - elapsedRef.current) / 1000));
      setHighlighted(null);
      return;
    }
    const fightSec = (elapsedRef.current - countdownMs) / 1000;
    setClockSec(Math.floor(fightSec));
    if (skills.length === 0) {
      setHighlighted(null);
      return;
    }
    // focus 된 행은 현재 시간 >= 그 행의 시전 완료 시간이 되는 순간 다음 행으로
    let idx = skills.findIndex((s) => s.time > fightSec);
    if (idx === -1) idx = skills.length - 1; // 모든 행이 지나가면 마지막 행 유지
    setHighlighted(skills[idx].id);

    // 마지막 행 도달 후 AUTO_END_DELAY_SEC 가 지나면 종료.
    const lastTime = skills[skills.length - 1].time;
    if (fightSec >= lastTime + AUTO_END_DELAY_SEC) {
      stop();
    }
  };

  const clockText =
    clockSec < 0 ? `-${formatTime(-clockSec)}` : formatTime(clockSec);

  useEffect(() => {
    if (status !== 'running') return;
    if (skills.length === 0) {
      stop();
      return;
    }
    let last = performance.now();
    recompute();
    const id = window.setInterval(() => {
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      recompute();
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [status, countdownSec, skills]);

  const start = () => {
    elapsedRef.current = 0;
    setMenuOpen(false);
    setStatus('running');
  };

  const togglePause = () => {
    setStatus((s) => (s === 'running' ? 'paused' : 'running'));
  };

  const active = status !== 'idle';

  return {
    status,
    active,
    clockText,
    countdownSec,
    setCountdownSec,
    menuOpen,
    setMenuOpen,
    start,
    togglePause,
    stop,
  };
}
