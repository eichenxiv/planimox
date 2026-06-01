import type { SaveFile } from '../types';
import { assignmentText } from './assignment';
import { formatTime } from './timeUtils';

// RFC 4180: 쉼표/큰따옴표/개행을 포함하면 큰따옴표로 감싸고 내부 따옴표는 "" 로 이스케이프.
function csvCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function saveFileToCsv(sf: SaveFile): string {
  const party = sf.party;
  const header = ['시간', '스킬명', '속성', '피해', ...party.map((c) => c.name)];

  const skills = [...sf.bossTimeline.skills].sort((a, b) => a.time - b.time);
  const rows = skills.map((sk) => {
    const base = [formatTime(sk.time), sk.name, sk.attribute ?? '', sk.damage ?? ''];
    const perSlot = party.map((c) =>
      sf.assignments
        .filter((a) => a.bossSkillId === sk.id && a.casterCharIndex === c.index)
        .map((a) => assignmentText(a, party))
        .join(' / '),
    );
    return [...base, ...perSlot];
  });

  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}
