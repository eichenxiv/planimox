import type { Character, SlotRole } from '../types';
import { JOBS, JOBS_BY_SLOT } from '../data/jobs';
import { useTimelineStore } from '../store/useTimelineStore';

interface Props {
  character: Character;
}

function slotRole(index: number): SlotRole {
  if (index < 2) return 'tank';
  if (index < 4) return 'healer';
  return 'dealer';
}

export function CharacterHeader({ character }: Props) {
  const setJob = useTimelineStore((s) => s.setJob);

  const jobMeta = character.jobId ? JOBS[character.jobId] : null;
  const jobOptions = JOBS_BY_SLOT[slotRole(character.index)];

  const onJobChange = (val: string) => {
    if (val === '') {
      setJob(character.index, null);
      return;
    }
    if (character.jobId && character.jobId !== val) {
      const ok = window.confirm(
        `${character.name}의 직업과 모든 배정을 초기화합니다.`,
      );
      if (!ok) return;
    }
    setJob(character.index, val as Character['jobId']);
  };

  return (
    <th
      className="char-header"
      style={{ borderTop: jobMeta ? `3px solid ${jobMeta.color}` : '3px solid #444' }}
    >
      <div className="char-name">{character.name}</div>
      <select
        className="field char-job"
        value={character.jobId ?? ''}
        onChange={(e) => onJobChange(e.target.value)}
      >
        <option value="">(직업 선택)</option>
        {jobOptions.map((j) => (
          <option key={j} value={j}>
            {JOBS[j].name} ({j})
          </option>
        ))}
      </select>
    </th>
  );
}
