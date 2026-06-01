import { useEffect, useRef, useState } from 'react';
import type { BossSkill, Character, JobSkill } from '../types';
import { skillsForJob } from '../data/jobSkills';
import { makeCtx, pickerStateFor, type PickerState } from '../lib/skillState';
import { useTimelineStore, activeTab } from '../store/useTimelineStore';
import { SkillIcon } from './SkillIcon';

interface Props {
  row: BossSkill;
  caster: Character;
  autoFocus?: boolean;
  onClose?: () => void;
}

interface MatchEntry {
  skill: JobSkill;
  state: PickerState;
}

const MAX_VISIBLE = 12;

export function SkillAutocomplete({ row, caster, autoFocus, onClose }: Props) {
  const assignments = useTimelineStore((s) => activeTab(s).assignments);
  const rows = useTimelineStore((s) => activeTab(s).bossTimeline.skills);
  const party = useTimelineStore((s) => s.party);
  const assignSkill = useTimelineStore((s) => s.assignSkill);
  const assignCustomSkill = useTimelineStore((s) => s.assignCustomSkill);

  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [pendingTarget, setPendingTarget] = useState<JobSkill | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  if (!caster.jobId) return null;

  const ctx = makeCtx(rows, assignments);
  const all = skillsForJob(caster.jobId);

  const q = query.trim().toLowerCase();
  const matches: MatchEntry[] = all
    .filter((s) => {
      if (!q) return true;
      const ko = s.nameKo?.toLowerCase() ?? '';
      const en = s.name.toLowerCase();
      return ko.includes(q) || en.includes(q);
    })
    .map((s) => ({ skill: s, state: pickerStateFor(ctx, row, caster.index, s) }))
    .sort((a, b) => {
      const av = a.state === 'available' ? 0 : 1;
      const bv = b.state === 'available' ? 0 : 1;
      if (av !== bv) return av - bv;
      return (a.skill.nameKo ?? a.skill.name).localeCompare(b.skill.nameKo ?? b.skill.name);
    })
    .slice(0, MAX_VISIBLE);

  const firstAvailableIndex = (from: number, dir: 1 | -1): number => {
    if (matches.length === 0) return -1;
    let idx = from;
    for (let i = 0; i < matches.length; i++) {
      idx = (idx + dir + matches.length) % matches.length;
      if (matches[idx].state === 'available') return idx;
    }
    return -1;
  };

  const commit = (skill: JobSkill, state: PickerState) => {
    if (state !== 'available') return;
    if (skill.targetable) {
      setPendingTarget(skill);
      setQuery('');
    } else {
      assignSkill(row.id, caster.index, skill.id, caster.index);
      setQuery('');
      setHighlight(0);
      inputRef.current?.focus();
    }
  };

  const commitCustom = () => {
    const text = query.trim();
    if (!text) return;
    assignCustomSkill(row.id, caster.index, text);
    setQuery('');
    setHighlight(0);
    inputRef.current?.focus();
  };

  const commitHighlight = () => {
    const at = matches[highlight];
    if (at && at.state === 'available') {
      commit(at.skill, at.state);
      return;
    }
    const idx = matches.findIndex((m) => m.state === 'available');
    if (idx >= 0) {
      commit(matches[idx].skill, matches[idx].state);
      return;
    }
    // 드롭다운에 선택 가능한 스킬이 없으면 입력 텍스트를 그대로 배정.
    commitCustom();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = firstAvailableIndex(highlight, 1);
      if (next >= 0) setHighlight(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = firstAvailableIndex(highlight, -1);
      if (next >= 0) setHighlight(next);
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitHighlight();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (pendingTarget) setPendingTarget(null);
      else onClose?.();
    }
  };

  const pickTarget = (targetCharIndex: number) => {
    if (!pendingTarget) return;
    assignSkill(row.id, caster.index, pendingTarget.id, targetCharIndex);
    setPendingTarget(null);
    setHighlight(0);
    inputRef.current?.focus();
  };

  return (
    <div className="mit-autocomplete" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        type="text"
        size={1}
        className="field mit-autocomplete-input"
        value={query}
        placeholder="스킬 검색..."
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
        }}
        onKeyDown={onKeyDown}
        disabled={pendingTarget !== null}
      />
      {!pendingTarget && (matches.length > 0 || query.trim() !== '') && (
        <div className="mit-autocomplete-list">
          {matches.map((m, i) => {
            const disabled = m.state !== 'available';
            return (
              <button
                key={m.skill.id}
                type="button"
                className={
                  `menu-item mit-autocomplete-item mit-autocomplete-item--${m.state}` +
                  (i === highlight ? ' is-highlight' : '')
                }
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(m.skill, m.state)}
                onMouseEnter={() => setHighlight(i)}
                title={
                  m.state === 'cooldown'
                    ? '재사용 대기 중'
                    : m.state === 'already-picked'
                      ? '이미 배정됨'
                      : ''
                }
              >
                <SkillIcon skill={m.skill} size={18} />
                <span className="mit-autocomplete-name">{m.skill.nameKo ?? m.skill.name}</span>
                <span className="mit-autocomplete-meta">
                  {m.skill.durationSec}s/{m.skill.cooldownSec}s
                  {m.skill.targetable && ' · 대인'}
                </span>
              </button>
            );
          })}
          {query.trim() !== '' && !matches.some((m) => m.state === 'available') && (
            <button
              type="button"
              className="menu-item mit-autocomplete-item mit-autocomplete-item--custom"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commitCustom}
              title="입력한 텍스트를 그대로 추가"
            >
              <span className="mit-autocomplete-name">"{query.trim()}" 직접 추가</span>
            </button>
          )}
        </div>
      )}
      {pendingTarget && (
        <div className="mit-autocomplete-targets">
          <div className="mit-autocomplete-targets-header">
            {pendingTarget.nameKo ?? pendingTarget.name} 대상
          </div>
          <div className="mit-autocomplete-targets-grid">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pickTarget(caster.index)}
            >
              본인
            </button>
            {party
              .filter((c) => c.index !== caster.index)
              .map((c) => (
                <button
                  key={c.index}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickTarget(c.index)}
                >
                  {c.name}
                </button>
              ))}
          </div>
          <button
            type="button"
            className="mit-autocomplete-targets-cancel"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setPendingTarget(null);
              inputRef.current?.focus();
            }}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
