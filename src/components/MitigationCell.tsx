import { memo, useRef, useState } from 'react';
import type { Assignment, BossSkill, Character } from '../types';
import { useTimelineStore } from '../store/useTimelineStore';
import type { ActiveEffect } from '../lib/skillState';
import { cx } from '../lib/cx';
import { useClickOutside } from '../hooks/useClickOutside';
import { resolveAssignment } from '../lib/assignment';
import { SkillIcon } from './SkillIcon';
import { SkillAutocomplete } from './SkillAutocomplete';

interface Props {
  row: BossSkill;
  character: Character;
  party: Character[];
  // 행 × 캐릭터 파생 데이터는 BossSkillRow 에서 계산.
  myAssignmentsHere: Assignment[];
  effectsOnMe: ActiveEffect[];
  isActive: boolean;
}

function MitigationCellImpl({
  row,
  character,
  party,
  myAssignmentsHere,
  effectsOnMe,
  isActive,
}: Props) {
  const unassignSkill = useTimelineStore((s) => s.unassignSkill);
  const [editing, setEditing] = useState(false);
  const cellRef = useRef<HTMLTableCellElement>(null);

  const canPick = character.jobId !== null;

  useClickOutside(cellRef, () => setEditing(false), editing);

  const targetName = (idx: number): string =>
    idx === character.index ? '본인' : party.find((c) => c.index === idx)?.name ?? `?${idx}`;

  const handleCellClick = () => {
    if (canPick) setEditing(true);
  };

  const handleSkillContextMenu = (e: React.MouseEvent, assignmentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    unassignSkill(assignmentId);
  };

  return (
    <td
      ref={cellRef}
      className={cx('mit-cell', isActive && 'mit-cell--active', canPick && 'mit-cell--pickable')}
      onClick={handleCellClick}
    >
      <div className="mit-cell-inner">
        {effectsOnMe.length > 0 && (
          <div className="mit-effects" title="현재 적용 중인 효과">
            {effectsOnMe.map((e) => (
              <SkillIcon
                key={e.assignment.id}
                skill={e.jobSkill}
                size={14}
                faded
                title={`적용 중: ${e.jobSkill.name}\nfrom ${targetName(e.assignment.casterCharIndex)} @ ${e.startedAt}s`}
              />
            ))}
          </div>
        )}

        {myAssignmentsHere.map((a) => {
          const { skill, label, targetName } = resolveAssignment(a, party);
          // 임의 텍스트 할당인 경우 skill 이 없으므로 별도 처리.
          if (!skill) {
            if (!label) return null;
            return (
              <div
                key={a.id}
                className="mit-row mit-row--custom"
                onContextMenu={(e) => handleSkillContextMenu(e, a.id)}
                title={`${label}\n우클릭 시 제거`}
              >
                <div className="mit-row-icon" />
                <div className="mit-row-name">{label}</div>
              </div>
            );
          }
          return (
            <div
              key={a.id}
              className="mit-row"
              onContextMenu={(e) => handleSkillContextMenu(e, a.id)}
              title={`${label}${targetName ? ` → ${targetName}` : ''}\n우클릭 시 제거`}
            >
              <div className="mit-row-icon">
                <SkillIcon skill={skill} size={26} />
              </div>
              <div className="mit-row-name">
                {label}
                {targetName && <span className="mit-row-target"> → {targetName}</span>}
              </div>
            </div>
          );
        })}

        {editing && canPick && (
          <SkillAutocomplete
            row={row}
            caster={character}
            autoFocus
            onClose={() => setEditing(false)}
          />
        )}
      </div>
    </td>
  );
}

function sameAssignments(a: Assignment[], b: Assignment[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function sameEffects(a: ActiveEffect[], b: ActiveEffect[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].assignment !== b[i].assignment) return false;
    if (a[i].jobSkill !== b[i].jobSkill) return false;
    if (a[i].startedAt !== b[i].startedAt) return false;
  }
  return true;
}

function areEqual(prev: Props, next: Props): boolean {
  return (
    prev.row === next.row &&
    prev.character === next.character &&
    prev.party === next.party &&
    prev.isActive === next.isActive &&
    sameAssignments(prev.myAssignmentsHere, next.myAssignmentsHere) &&
    sameEffects(prev.effectsOnMe, next.effectsOnMe)
  );
}

export const MitigationCell = memo(MitigationCellImpl, areEqual);
