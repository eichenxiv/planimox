import { marked } from 'marked';
import readme from '../../README.md?raw';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
}

const readmeHtml = marked.parse(readme, { async: false });

export function HelpModal({ onClose }: Props) {
  return (
    <Modal header="도움말" onClose={onClose}>
      <div className="md-content" dangerouslySetInnerHTML={{ __html: readmeHtml }} />
    </Modal>
  );
}
