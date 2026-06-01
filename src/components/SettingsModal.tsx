import { useTimelineStore } from '../store/useTimelineStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
}

const OPTIONAL_LABELS: { key: 'attribute' | 'damage' | 'description'; label: string }[] = [
  { key: 'attribute', label: '속성' },
  { key: 'damage', label: '피해량' },
  { key: 'description', label: '비고' },
];

export function SettingsModal({ onClose }: Props) {
  const party = useTimelineStore((s) => s.party);
  const visibleColumns = useSettingsStore((s) => s.visibleColumns);
  const toggleColumn = useSettingsStore((s) => s.toggleColumn);
  const optionalColumns = useSettingsStore((s) => s.optionalColumns);
  const toggleOptional = useSettingsStore((s) => s.toggleOptional);

  return (
    <Modal header="설정" size="sm" onClose={onClose}>
      <div className="settings-section">
          <div className="settings-section-title">추가 정보</div>
          <div className="settings-columns">
            {OPTIONAL_LABELS.map(({ key, label }) => (
              <label key={key} className="menu-item settings-item">
                <input
                  type="checkbox"
                  checked={optionalColumns[key]}
                  onChange={() => toggleOptional(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-section-title">캐릭터</div>
          <div className="settings-columns">
            {party.map((c) => (
              <label key={c.index} className="menu-item settings-item">
                <input
                  type="checkbox"
                  checked={visibleColumns[c.index] ?? true}
                  onChange={() => toggleColumn(c.index)}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>
    </Modal>
  );
}
