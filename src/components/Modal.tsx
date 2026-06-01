import type { ReactNode } from 'react';
import { useKeydown } from '../hooks/useKeydown';
import { cx } from '../lib/cx';

interface Props {
  // 헤더 좌측 영역. 단순 제목 문자열이거나, 탭 등 임의 노드.
  header: ReactNode;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm';
}

// 모달 공통 골격: 배경 클릭/Esc 로 닫기, 헤더 + 닫기 버튼.
// 개별 모달은 header 와 본문(children)만.
export function Modal({ header, onClose, children, size }: Props) {
  useKeydown((e) => {
    if (e.key === 'Escape') onClose();
  });

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={cx('modal', size === 'sm' && 'modal--sm')} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {header}
          <button className="icon-btn modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
