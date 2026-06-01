import { useEffect, useState } from 'react';
import type { AttackAttribute, BossSkill } from '../types';
import { parseTime, formatTime } from '../lib/timeUtils';
import { cx } from '../lib/cx';

type ErrorField = 'cast' | 'time' | 'name' | null;

interface Props {
  initial?: BossSkill;
  onSubmit: (data: {
    cast?: number;
    time: number;
    name: string;
    attribute: AttackAttribute | null;
    damage: string;
    description: string;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function BossSkillEditor({ initial, onSubmit, onCancel, submitLabel = '추가' }: Props) {
  const [castTimeText, setCastTimeText] = useState(
    initial?.cast != null ? formatTime(initial.cast) : '',
  );
  const [timeText, setTimeText] = useState(initial ? formatTime(initial.time) : '');
  const [name, setName] = useState(initial?.name ?? '');
  const [attribute, setAttribute] = useState<AttackAttribute | null>(initial?.attribute ?? null);
  const [damage, setDamage] = useState(initial?.damage ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<ErrorField>(null);

  useEffect(() => {
    if (initial) {
      setCastTimeText(initial.cast != null ? formatTime(initial.cast) : '');
      setTimeText(formatTime(initial.time));
      setName(initial.name);
      setAttribute(initial.attribute);
      setDamage(initial.damage);
      setDescription(initial.description);
    }
  }, [initial]);

  const fail = (field: ErrorField, message: string) => {
    setError(message);
    setErrorField(field);
  };

  const submit = () => {
    const t = parseTime(timeText);
    if (t == null) { fail('time', '시간 형식이 잘못되었습니다 (예: 01:10 또는 70)'); return; }
    if (!name.trim()) { fail('name', '스킬 이름이 비어 있습니다'); return; }

    let cast: number | undefined;
    if (castTimeText.trim() !== '') {
      const ct = parseTime(castTimeText);
      if (ct == null) { fail('cast', '시간 형식이 잘못되었습니다 (예: 01:10 또는 70)'); return; }
      cast = ct;
    }

    setError(null);
    setErrorField(null);
    onSubmit({ cast, time: t, name: name.trim(), attribute, damage: damage.trim(), description: description.trim() });
    if (!initial) {
      setCastTimeText(''); setTimeText(''); setName(''); setAttribute(null); setDamage(''); setDescription('');
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="boss-editor">
      <input
        className={cx('field', 'be-time', errorField === 'cast' && 'field--invalid')}
        placeholder="시전 시작"
        value={castTimeText}
        onChange={(e) => setCastTimeText(e.target.value)}
        onKeyDown={onEnter}
      />
      <input
        className={cx('field', 'be-time', 'be-must', errorField === 'time' && 'field--invalid')}
        placeholder="시전 완료 (00:00)"
        value={timeText}
        onChange={(e) => setTimeText(e.target.value)}
        onKeyDown={onEnter}
      />
      <input
        className={cx('field', 'be-name', 'be-must', errorField === 'name' && 'field--invalid')}
        placeholder="스킬 이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={onEnter}
      />
      <select
        className="field"
        value={attribute ?? ''}
        onChange={(e) => setAttribute(e.target.value === '' ? null : (e.target.value as AttackAttribute))}
      >
        <option value="">-</option>
        <option value="magic">마법</option>
        <option value="physical">물리</option>
        <option value="dark">암흑</option>
      </select>
      <input
        className="field be-damage"
        placeholder="예상 피해량"
        value={damage}
        onChange={(e) => setDamage(e.target.value)}
        onKeyDown={onEnter}
      />
      <input
        className="field be-desc"
        placeholder="비고"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={onEnter}
      />
      <button className="btn btn--primary" onClick={submit}>{submitLabel}</button>
      {onCancel && <button className="btn btn--subtle" onClick={onCancel}>취소</button>}
      {error && <span className="be-error">{error}</span>}
    </div>
  );
}
