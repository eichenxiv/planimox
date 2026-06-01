import { Fragment, useMemo } from 'react';
import { PHASE_END } from '../types';
import { useTimelineStore, activeTab } from '../store/useTimelineStore';
import { timelineColSpan, countOptional, COL_WIDTH } from '../lib/columns';
import { makeCtx } from '../lib/skillState';
import { useSettingsStore } from '../store/useSettingsStore';
import { CharacterHeader } from './CharacterHeader';
import { BossSkillRow } from './BossSkillRow';
import { PhaseDividerRow } from './PhaseDividerRow';

export function TimelineTable() {
  const skills = useTimelineStore((s) => activeTab(s).bossTimeline.skills);
  const party = useTimelineStore((s) => s.party);
  const phaseDividers = useTimelineStore((s) => activeTab(s).phaseDividers);
  const assignments = useTimelineStore((s) => activeTab(s).assignments);
  const visibleColumns = useSettingsStore((s) => s.visibleColumns);
  const optional = useSettingsStore((s) => s.optionalColumns);

  // 스킬 상태 계산용 컨텍스트(시간 인덱스 포함)를 표 단위로 1회만 만든다.
  const ctx = useMemo(() => makeCtx(skills, assignments), [skills, assignments]);

  // 설정에서 켜둔 캐릭터 열만 렌더한다(데이터는 그대로 유지, 표시 전용).
  const visibleParty = party.filter((c) => visibleColumns[c.index] ?? true);

  const colSpan = timelineColSpan(visibleParty.length, countOptional(optional));
  const dividersBefore = (skillId: string) =>
    phaseDividers.filter((d) => d.beforeSkillId === skillId);
  const dividersAtEnd = phaseDividers.filter((d) => d.beforeSkillId === PHASE_END);

  return (
    <div className="table-wrap">
      <table className="timeline-table">
        <colgroup>
          <col style={{ width: COL_WIDTH.castStart }} />
          <col style={{ width: COL_WIDTH.castEnd }} />
          <col style={{ width: COL_WIDTH.name }} />
          {optional.attribute && <col style={{ width: COL_WIDTH.attribute }} />}
          {optional.damage && <col style={{ width: COL_WIDTH.damage }} />}
          {optional.description && <col style={{ width: COL_WIDTH.description }} />}
          {visibleParty.map((c) => (
            <col key={c.index} />
          ))}
          <col style={{ width: COL_WIDTH.actions }} />
        </colgroup>
        <thead>
          <tr>
            <th className="boss-head">시전 시작</th>
            <th className="boss-head">시전 완료</th>
            <th className="boss-head">스킬 이름</th>
            {optional.attribute && <th className="boss-head">속성</th>}
            {optional.damage && <th className="boss-head">피해량</th>}
            {optional.description && <th className="boss-head">비고</th>}
            {visibleParty.map((c) => (
              <CharacterHeader key={c.index} character={c} />
            ))}
            <th className="boss-head boss-head--actions">관리</th>
          </tr>
        </thead>
        <tbody>
          {skills.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="empty-row">
                추가 된 타임라인이 없습니다.
              </td>
            </tr>
          )}
          {skills.map((row) => (
            <Fragment key={row.id}>
              {dividersBefore(row.id).map((d) => (
                <PhaseDividerRow key={d.id} divider={d} colSpan={colSpan} />
              ))}
              <BossSkillRow
                row={row}
                party={party}
                visibleParty={visibleParty}
                optional={optional}
                ctx={ctx}
              />
            </Fragment>
          ))}
          {dividersAtEnd.map((d) => (
            <PhaseDividerRow key={d.id} divider={d} colSpan={colSpan} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
