import { useRef, useState } from 'react';
import { useTimelineStore, activeTab } from '../store/useTimelineStore';
import { saveXivtl, loadXivtlAny } from '../lib/fileIO';
import { uuid } from '../lib/timeUtils';
import { useKeydown } from '../hooks/useKeydown';
import { useTheme } from '../hooks/useTheme';
import { fetchPresetTimeline, type PresetMeta } from '../data/presets';
import { ImportModal } from './ImportModal';
import { ShareModal } from './ShareModal';
import { SettingsModal } from './SettingsModal';
import { HelpModal } from './HelpModal';

export function Header() {
  const snapshot = useTimelineStore((s) => s.snapshot);
  const loadState = useTimelineStore((s) => s.loadState);
  const replaceBossTimeline = useTimelineStore((s) => s.replaceBossTimeline);
  const bossName = useTimelineStore((s) => activeTab(s).bossTimeline.name);
  const resetAll = useTimelineStore((s) => s.resetAll);
  const undo = useTimelineStore((s) => s.undo);
  const redo = useTimelineStore((s) => s.redo);
  const canUndo = useTimelineStore((s) => activeTab(s).past.length > 0);
  const canRedo = useTimelineStore((s) => activeTab(s).future.length > 0);
  const openTimelineTab = useTimelineStore((s) => s.openTimelineTab);

  const [theme, toggleTheme] = useTheme();

  const openRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onPickPreset = async (meta: PresetMeta) => {
    setImportOpen(false);
    try {
      openTimelineTab(await fetchPresetTimeline(meta));
    } catch (e) {
      window.alert(`프리셋 불러오기 실패: ${(e as Error).message}`);
    }
  };

  const onOpenFile = async (file: File) => {
    try {
      const res = await loadXivtlAny(file);
      if (res.kind === 'full') {
        loadState(res.data);
      } else {
        replaceBossTimeline(res.data);
      }
    } catch (e) {
      window.alert(`불러오기 실패: ${(e as Error).message}`);
    }
  };

  useKeydown((e) => {
    if (e.key === 'Escape') setDrawerOpen(false);
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((key === 'z' && e.shiftKey) || key === 'y') {
      e.preventDefault();
      redo();
    }
  });

  const onNew = () => {
    if (window.confirm('타임라인을 포함한 모든 내용을 초기화합니다. 계속할까요?')) {
      resetAll();
    }
  };

  const openFilePicker = () => openRef.current?.click();
  const onSave = () => saveXivtl(snapshot());
  const themeTitle = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';

  const drawerAction = (fn: () => void) => () => {
    setDrawerOpen(false);
    fn();
  };

  return (
    <header className="app-header">
      <h1>Planimox ─ Timeline based Mitigation Planner for FFXIV</h1>

      {/* Desktop */}
      <div className="header-menu">
        <div className="header-actions">
          <button className="btn" onClick={onNew}>새로 만들기</button>
          <button className="btn" onClick={openFilePicker}>열기</button>
          <button className="btn" onClick={onSave}>저장하기</button>

          <span className="menu-divider" />

          <button className="btn" onClick={undo} disabled={!canUndo} title="실행 취소 (Ctrl+Z)">
            ↶ 실행 취소
          </button>
          <button className="btn" onClick={redo} disabled={!canRedo} title="다시 실행 (Ctrl+Y)">
            ↷ 다시 실행
          </button>

          <button className="btn" onClick={() => setImportOpen(true)}>가져오기</button>
          <button className="btn" onClick={() => setShareOpen(true)}>공유하기</button>
        </div>
      </div>

      <button className="btn header-help" onClick={() => setHelpOpen(true)}>
        도움말
      </button>
      <button className="btn settings-open" onClick={() => setSettingsOpen(true)}>
        설정
      </button>
      <button
        className="icon-btn icon-btn--round header-theme"
        onClick={toggleTheme}
        title={themeTitle}
      >
        {theme === 'light' ? '☾' : '☀'}
      </button>

      {/* Mobile */}
      <button
        className="icon-btn menu-hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="메뉴"
        aria-expanded={drawerOpen}
      >
        ≡
      </button>

      {drawerOpen && (
        <>
          <div className="mobile-drawer-backdrop" onMouseDown={() => setDrawerOpen(false)} />
          <nav className="mobile-drawer" aria-label="메뉴">
            <button className="menu-item" onClick={drawerAction(onNew)}>새로 만들기</button>
            <button className="menu-item" onClick={drawerAction(openFilePicker)}>열기</button>
            <button className="menu-item" onClick={drawerAction(onSave)}>저장하기</button>
            <button className="menu-item" onClick={drawerAction(() => setImportOpen(true))}>가져오기</button>
            <button className="menu-item" onClick={drawerAction(() => setShareOpen(true))}>공유하기</button>
            <span className="menu-divider menu-divider--h" />
            <button className="menu-item" onClick={drawerAction(() => setHelpOpen(true))}>도움말</button>
            <button className="menu-item" onClick={drawerAction(() => setSettingsOpen(true))}>설정</button>
            <span className="menu-divider menu-divider--h" />
            <button className="menu-item" onClick={drawerAction(toggleTheme)}>
              {theme === 'light' ? '다크 모드' : '라이트 모드'}
            </button>
          </nav>
        </>
      )}

      <input
        ref={openRef}
        type="file"
        accept=".xivtl,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onOpenFile(f);
          e.target.value = '';
        }}
      />

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onPickPreset={onPickPreset}
          onImport={(skills) =>
            replaceBossTimeline({
              name: bossName,
              skills: skills
                .map((sk) => ({
                  id: uuid(),
                  time: sk.time,
                  name: sk.name,
                  attribute: null,
                  damage: '',
                  description: '',
                }))
                .sort((a, b) => a.time - b.time),
            })
          }
        />
      )}
      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </header>
  );
}
