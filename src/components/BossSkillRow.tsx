import { useState } from 'react';
import type { BossSkill, Character } from '../types';
import { useTimelineStore } from '../store/useTimelineStore';
import { useSimStore } from '../store/useSimStore';
import { formatTime } from '../lib/timeUtils';
import { cx } from '../lib/cx';
import { timelineColSpan, countOptional } from '../lib/columns';
import { activeEffectsAt, assignmentsAtRow, type ComputeCtx } from '../lib/skillState';
import type { OptionalColumns } from '../store/useSettingsStore';
import { MitigationCell } from './MitigationCell';
import { BossSkillEditor } from './BossSkillEditor';

interface Props {
  row: BossSkill;
  party: Character[];
  visibleParty: Character[]; // 설정에서 보이도록 한 캐릭터 목록
  optional: OptionalColumns;
  ctx: ComputeCtx; // 표 전체에서 1회 생성해 전달(스킬 상태 계산용 인덱스).
}

const attrLabel: Record<NonNullable<BossSkill['attribute']>, string> = {
  magic: '마법',
  physical: '물리',
  dark: '암흑',
};

export function BossSkillRow({ row, party, visibleParty, optional, ctx }: Props) {
  const optionalCount = countOptional(optional);
  const updateBossSkill = useTimelineStore((s) => s.updateBossSkill);
  const removeBossSkill = useTimelineStore((s) => s.removeBossSkill);
  const addPhaseDividerAfter = useTimelineStore((s) => s.addPhaseDividerAfter);
  const highlighted = useSimStore((s) => s.highlightedSkillId === row.id);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="boss-row">
        <td colSpan={timelineColSpan(visibleParty.length, optionalCount)}>
          <BossSkillEditor
            initial={row}
            submitLabel="저장"
            onCancel={() => setEditing(false)}
            onSubmit={(data) => {
              updateBossSkill(row.id, data);
              setEditing(false);
            }}
          />
        </td>
      </tr>
    );
  }

  const edit = () => setEditing(true);

  return (
    <tr className={cx('boss-row', highlighted && 'boss-row--highlight')}>
      <td className="boss-cell boss-cell--time" onDoubleClick={edit}>{row.cast == null ? '' : formatTime(row.cast)}</td>
      <td className="boss-cell boss-cell--time" onDoubleClick={edit}>{formatTime(row.time)}</td>
      <td className="boss-cell boss-cell--name" onDoubleClick={edit}>{row.name}</td>
      {optional.attribute && (
        <td className={cx('boss-cell', 'boss-cell--attr', row.attribute && `attr-${row.attribute}`)} onDoubleClick={edit}>
          {row.attribute ? attrLabel[row.attribute] : '-'}
        </td>
      )}
      {optional.damage && <td className="boss-cell boss-cell--damage" onDoubleClick={edit}>{row.damage}</td>}
      {optional.description && <td className="boss-cell boss-cell--desc" onDoubleClick={edit}>{row.description}</td>}
      {visibleParty.map((c) => {
        const myAssignmentsHere = assignmentsAtRow(ctx, row.id, c.index);
        const allActive = activeEffectsAt(ctx, row, c.index);
        const effectsOnMe = allActive.filter(
          (e) => !(e.assignment.bossSkillId === row.id && e.assignment.casterCharIndex === c.index),
        );
        return (
          <MitigationCell
            key={c.index}
            row={row}
            character={c}
            party={party}
            myAssignmentsHere={myAssignmentsHere}
            effectsOnMe={effectsOnMe}
            isActive={allActive.length > 0}
          />
        );
      })}
      <td className="boss-cell boss-cell--actions">
        <div className="boss-row-actions">
          <button className="icon-btn" onClick={() => addPhaseDividerAfter(row.id)} title="이 행 아래에 페이즈 구분선 추가">⌖</button>
          <button className="icon-btn" onClick={() => {
            if (window.confirm(`"${row.name}" 행을 삭제할까요?`)) removeBossSkill(row.id);
          }} title="삭제">✕</button>
        </div>
      </td>
    </tr>
  );
}
