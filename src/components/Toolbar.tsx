import { useTimelineStore } from '../store/useTimelineStore';
import { RaidSimControls } from './RaidSimControls';
import { TabBar } from './TabBar';

export function Toolbar() {
  const clearAssignments = useTimelineStore((s) => s.clearAssignments);

  const onReset = () => {
    if (
      window.confirm(
        '타임라인은 유지하고 캐릭터 스킬 배정만 모두 초기화합니다. 계속할까요?',
      )
    ) {
      clearAssignments();
    }
  };

  return (
    <div className="toolbar">
      <TabBar />
      <RaidSimControls />
      <button className="btn btn--link toolbar-reset" onClick={onReset} title="배정 초기화">
        초기화
      </button>
    </div>
  );
}
