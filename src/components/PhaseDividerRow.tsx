import type { PhaseDivider } from '../types';
import { useTimelineStore } from '../store/useTimelineStore';

interface Props {
  divider: PhaseDivider;
  colSpan: number;
}

export function PhaseDividerRow({ divider, colSpan }: Props) {
  const updatePhaseDivider = useTimelineStore((s) => s.updatePhaseDivider);
  const removePhaseDivider = useTimelineStore((s) => s.removePhaseDivider);
  const movePhaseDivider = useTimelineStore((s) => s.movePhaseDivider);

  return (
    <tr className="phase-divider-row">
      <td colSpan={colSpan}>
        <div className="phase-divider">
          <span className="phase-divider-mark">⌖</span>
          <input
            className="field field--flush phase-divider-label"
            value={divider.label}
            placeholder="페이즈 구분선"
            onChange={(e) => updatePhaseDivider(divider.id, e.target.value)}
          />
          <span className="phase-divider-actions">
            <button className="icon-btn" title="위로 이동" onClick={() => movePhaseDivider(divider.id, -1)}>
              ▲
            </button>
            <button className="icon-btn" title="아래로 이동" onClick={() => movePhaseDivider(divider.id, 1)}>
              ▼
            </button>
            <button className="icon-btn" title="구분선 삭제" onClick={() => removePhaseDivider(divider.id)}>
              ✕
            </button>
          </span>
        </div>
      </td>
    </tr>
  );
}
