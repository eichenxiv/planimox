import { useEffect, useState } from 'react';
import { cx } from '../lib/cx';
import { Modal } from './Modal';
import {
  fetchPresetList,
  groupPresets,
  type PresetGroup,
  type PresetMeta,
} from '../data/presets';

interface ParsedSkill {
  time: number;
  name: string;
}

interface Props {
  onImport: (skills: ParsedSkill[]) => void;
  onPickPreset: (meta: PresetMeta) => void;
  onClose: () => void;
}

type Tab = 'import' | 'preset';

const LINE_RE = /^(\d+):([0-5]?\d)\s+(\S.*?)\s*$/;

function parseImport(text: string):
  | { ok: true; skills: ParsedSkill[] }
  | { ok: false; error: string } {
  const lines = text.split(/\r?\n/);
  const skills: ParsedSkill[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.trim() === '') continue;
    const m = raw.match(LINE_RE);
    if (!m) {
      return {
        ok: false,
        error: `형식 오류: 라인 ${i + 1} | "${raw.trim()}"`,
      };
    }
    const min = parseInt(m[1], 10);
    const sec = parseInt(m[2], 10);
    skills.push({ time: min * 60 + sec, name: m[3] });
  }
  if (skills.length === 0) {
    return { ok: false, error: '가져올 내용이 없습니다.' };
  }
  return { ok: true, skills };
}

const INDENT_STEP = 12;
const BASE_PAD = 8;

function PresetGroupView({
  group,
  depth,
  parentPath,
  collapsed,
  onToggle,
  onPick,
}: {
  group: PresetGroup;
  depth: number;
  parentPath: string;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
  onPick: (meta: PresetMeta) => void;
}) {
  const key = parentPath ? `${parentPath}/${group.name}` : group.name;
  const isCollapsed = collapsed.has(key);
  return (
    <>
      <button
        type="button"
        className="menu-item preset-group-label"
        style={{ paddingLeft: BASE_PAD + depth * INDENT_STEP }}
        onClick={() => onToggle(key)}
        aria-expanded={!isCollapsed}
      >
        <span className="preset-caret">{isCollapsed ? '▸' : '▾'}</span>
        {group.name}
      </button>
      {!isCollapsed && (
        <>
          {group.items.map((m) => (
            <button
              key={m.id}
              type="button"
              className="menu-item preset-item"
              style={{ paddingLeft: BASE_PAD + (depth + 1) * INDENT_STEP }}
              onClick={() => onPick(m)}
            >
              {m.label}
            </button>
          ))}
          {group.groups.map((g) => (
            <PresetGroupView
              key={g.name}
              group={g}
              depth={depth + 1}
              parentPath={key}
              collapsed={collapsed}
              onToggle={onToggle}
              onPick={onPick}
            />
          ))}
        </>
      )}
    </>
  );
}

export function ImportModal({ onImport, onPickPreset, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('import');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetMeta[] | null>(null);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    if (tab !== 'preset' || presets !== null) return;
    fetchPresetList()
      .then(setPresets)
      .catch((err) => {
        setPresets([]);
        setPresetError((err as Error).message);
      });
  }, [tab, presets]);

  const submit = () => {
    const res = parseImport(text);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onImport(res.skills);
    onClose();
  };

  const tree = presets ? groupPresets(presets) : null;

  const header = (
    <div className="modal-tabs">
      <button
        type="button"
        className={cx('modal-tab', tab === 'import' && 'modal-tab--active')}
        onClick={() => setTab('import')}
      >
        타임라인 가져오기
      </button>
      <button
        type="button"
        className={cx('modal-tab', tab === 'preset' && 'modal-tab--active')}
        onClick={() => setTab('preset')}
      >
        프리셋
      </button>
    </div>
  );

  return (
    <Modal header={header} onClose={onClose}>
      {tab === 'import' ? (
          <>
            <p className="modal-hint">
              한 줄에 하나씩 "시간 스킬명" 순서로 입력하세요.
            </p>
            <textarea
              className="field modal-textarea"
              autoFocus
              placeholder={'00:05 광역 공격\n04:00 4인 쉐어\n11:30 전멸기'}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
            />
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-actions">
              <button className="btn" onClick={submit} disabled={text.trim() === ''}>
                가져오기
              </button>
              <button className="btn" onClick={onClose}>
                취소
              </button>
            </div>
          </>
        ) : (
          <div className="preset-list">
            {presets === null ? (
              <div className="preset-note">불러오는 중...</div>
            ) : presetError ? (
              <div className="preset-note modal-error">프리셋 로드 실패: {presetError}</div>
            ) : presets.length === 0 ? (
              <div className="preset-note">등록된 프리셋이 없습니다.</div>
            ) : (
              <>
                {tree!.items.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="menu-item preset-item"
                    style={{ paddingLeft: BASE_PAD }}
                    onClick={() => onPickPreset(m)}
                  >
                    {m.label}
                  </button>
                ))}
                {tree!.groups.map((g) => (
                  <PresetGroupView
                    key={g.name}
                    group={g}
                    depth={0}
                    parentPath=""
                    collapsed={collapsed}
                    onToggle={toggleGroup}
                    onPick={onPickPreset}
                  />
                ))}
              </>
            )}
          </div>
        )}
    </Modal>
  );
}
