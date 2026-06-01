import { useState } from 'react';
import type { JobSkill } from '../types';
import { iconUrl } from '../data/jobSkills';

interface Props {
  skill: JobSkill;
  size?: number;
  onClick?: () => void;
  title?: string;
  faded?: boolean;
}

export function SkillIcon({ skill, size = 28, onClick, title, faded }: Props) {
  const [errored, setErrored] = useState(false);
  const label = skill.nameKo ?? skill.name;
  const tip = title ?? `${skill.name}\n적용 ${skill.durationSec}s / 쿨 ${skill.cooldownSec}s`;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    opacity: faded ? 0.45 : 1,
    cursor: onClick ? 'pointer' : 'default',
  };

  if (errored) {
    return (
      <span
        className="skill-icon skill-icon--text"
        style={{ ...style, fontSize: Math.max(9, Math.floor(size / 3)), lineHeight: 1 }}
        title={tip}
        onClick={onClick}
      >
        {label.slice(0, 4)}
      </span>
    );
  }
  return (
    <img
      className="skill-icon"
      src={iconUrl(skill.iconId)}
      alt={label}
      title={tip}
      style={style}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      onClick={onClick}
    />
  );
}
