import { useLayoutEffect, useRef, useState } from 'react';
import { useTimelineStore, activeTab } from '../store/useTimelineStore';

const MAX_INACTIVE_LEN = 10;
const PLACEHOLDER = 'New Timeline';

function truncate(name: string): string {
  const trimmed = name.trim() || '무제';
  return trimmed.length > MAX_INACTIVE_LEN
    ? trimmed.slice(0, MAX_INACTIVE_LEN) + '…'
    : trimmed;
}

export function TabBar() {
  const tabOrder = useTimelineStore((s) => s.tabOrder);
  const activeTabId = useTimelineStore((s) => s.activeTabId);
  const tabs = useTimelineStore((s) => s.tabs);
  const bossName = useTimelineStore((s) => activeTab(s).bossTimeline.name);
  const setBossName = useTimelineStore((s) => s.setBossName);
  const switchTab = useTimelineStore((s) => s.switchTab);
  const addTab = useTimelineStore((s) => s.addTab);
  const removeTab = useTimelineStore((s) => s.removeTab);

  const canClose = tabOrder.length > 1;

  // 활성 탭 이름 input 을 내용 길이에 맞춰 자동으로 늘린다.
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(0);
  useLayoutEffect(() => {
    if (mirrorRef.current) setInputWidth(mirrorRef.current.offsetWidth);
  }, [bossName]);

  return (
    <div className="tab-bar">
      {tabOrder.map((id) => {
        if (id === activeTabId) {
          return (
            <div key={id} className="tab tab-active">
              <span className="tab-name-mirror" ref={mirrorRef} aria-hidden>
                {bossName || PLACEHOLDER}
              </span>
              <input
                className="field field--flush tab-name-input"
                style={{ width: inputWidth + 2 }}
                value={bossName}
                onChange={(e) => setBossName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                placeholder={PLACEHOLDER}
              />
              {canClose && (
                <button
                  className="icon-btn tab-close"
                  title="탭 닫기"
                  onClick={() => removeTab(id)}
                >
                  ×
                </button>
              )}
            </div>
          );
        }
        const name = tabs[id]?.bossTimeline.name ?? '';
        return (
          <div
            key={id}
            className="tab"
            title={name.trim() || 'New Timeline'}
            onClick={() => switchTab(id)}
          >
            <span className="tab-name">{truncate(name)}</span>
            <button
              className="icon-btn tab-close"
              title="탭 닫기"
              onClick={(e) => {
                e.stopPropagation();
                removeTab(id);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
      <button className="icon-btn tab-add" title="새 타임라인 추가" onClick={addTab}>
        +
      </button>
    </div>
  );
}
