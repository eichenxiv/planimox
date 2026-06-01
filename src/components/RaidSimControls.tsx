import { useRef } from 'react';
import { cx } from '../lib/cx';
import { useClickOutside } from '../hooks/useClickOutside';
import { useRaidSim, COUNTDOWN_OPTIONS } from '../hooks/useRaidSim';

export function RaidSimControls() {
  const {
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
  } = useRaidSim();

  const pickerRef = useRef<HTMLDivElement>(null);
  useClickOutside(pickerRef, () => setMenuOpen(false), menuOpen);

  return (
    <div className="sim-controls">
      {!active ? (
        <>
          <button className="btn btn--link sim-btn" onClick={start} title="초읽기 후 시뮬레이션을 시작합니다.">
            시뮬레이션 시작
          </button>
          <div className="sim-countdown-picker" ref={pickerRef}>
            <button
              className="icon-btn sim-caret"
              onClick={() => setMenuOpen((o) => !o)}
              title={`초읽기 ${countdownSec}초`}
            >
              ▾
            </button>
            {menuOpen && (
              <div className="sim-menu">
                {COUNTDOWN_OPTIONS.map((sec) => (
                  <button
                    key={sec}
                    className={cx('menu-item', 'sim-menu-item', sec === countdownSec && 'is-active')}
                    onClick={() => {
                      setCountdownSec(sec);
                      setMenuOpen(false);
                    }}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <span className="btn btn--link sim-btn sim-btn--active">
            진행 중
          </span>
          <span className="sim-clock">{clockText}</span>
          <button className="btn btn--link sim-btn" onClick={togglePause}>
            {status === 'paused' ? '재개' : '일시정지'}
          </button>
          <button className="btn btn--link sim-btn" onClick={stop}>
            종료
          </button>
        </>
      )}
    </div>
  );
}
