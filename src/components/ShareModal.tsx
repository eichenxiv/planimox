import { useEffect, useRef, useState } from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { createShare } from '../lib/shareApi';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
}

export function ShareModal({ onClose }: Props) {
  const snapshot = useTimelineStore((s) => s.snapshot);
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [csv, setCsv] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    createShare(snapshot())
      .then(setLink)
      .catch((e) => setError((e as Error).message));
  }, [snapshot]);

  // CSV 체크 시 ?format=csv 를 붙인다(구글 시트 IMPORTDATA 등에서 CSV 로 받기 위함).
  const shareLink = link ? link + (csv ? '?format=csv' : '') : '';

  const copy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      // 클립보드 API 가 막힌 환경(비-HTTPS 등) 폴백.
      taRef.current?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal header="공유하기" size="sm" onClose={onClose}>
      <textarea
        ref={taRef}
        className="field modal-textarea"
        readOnly
        value={error ? '' : shareLink || '링크 생성 중…'}
        autoFocus
        onFocus={(e) => shareLink && e.currentTarget.select()}
      />
      {error && <div className="modal-error">공유 링크 생성 실패: {error}</div>}
      <div className="modal-actions modal-actions--split">
        <label className="share-csv">
          <input type="checkbox" checked={csv} onChange={(e) => setCsv(e.target.checked)} />
          <span>CSV로 공유</span>
        </label>
        <div className="share-actions-buttons">
          <button className="btn" onClick={copy} disabled={!shareLink}>
            {copied ? '복사됨!' : '클립보드 복사'}
          </button>
          <button className="btn" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
}
