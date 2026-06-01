import { Toolbar } from './components/Toolbar';
import { TimelineTable } from './components/TimelineTable';
import { BossSkillEditor } from './components/BossSkillEditor';
import { Header } from './components/Header';
import { useTimelineStore } from './store/useTimelineStore';
import { readSharePath } from './lib/shareApi';
import { useEffect } from 'react';

export default function App() {
  const addBossSkill = useTimelineStore((s) => s.addBossSkill);
  const loadSharedState = useTimelineStore((s) => s.loadSharedState);

  useEffect(() => {
    let cancelled = false;
    readSharePath().then((shared) => {
      if (cancelled || !shared) return;
      loadSharedState(shared);
      history.replaceState(null, '', '/');
    });
    return () => {
      cancelled = true;
    };
  }, [loadSharedState]);

  return (
    <div className="app">
      <Header />
      <Toolbar />
      <main className="app-main">
        <TimelineTable />
      </main>
      <div className="editor-bar">
        <div className="editor-bar-title">타임라인 추가</div>
        <BossSkillEditor onSubmit={(data) => addBossSkill(data)} />
      </div>
    </div>
  );
}
