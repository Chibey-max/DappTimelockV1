'use client';
import { CheckIcon, XIcon, InfoIcon, WarningIcon } from '@/components/ui/Icons';

const CONFIG = {
  success: { Icon: CheckIcon, color: 'var(--green)',  bg: 'rgba(16,185,129,0.1)'  },
  error:   { Icon: XIcon,     color: 'var(--red)',    bg: 'rgba(239,68,68,0.1)'   },
  info:    { Icon: InfoIcon,  color: 'var(--blue)',   bg: 'rgba(59,130,246,0.1)'  },
  warning: { Icon: WarningIcon,color:'var(--gold)',   bg: 'rgba(245,166,35,0.1)'  },
};

function Toast({ toast, onRemove }) {
  const cfg = CONFIG[toast.type] || CONFIG.info;
  return (
    <div className={`toast ${toast.type}`}>
      <div className="toast-icon-wrap" style={{ background: cfg.bg }}>
        <cfg.Icon size={14} color={cfg.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="toast-title">{toast.title}</div>
        {toast.message && (
          <div className="toast-msg" dangerouslySetInnerHTML={{ __html: toast.message }} />
        )}
      </div>
      <button className="toast-close" onClick={() => onRemove(toast.id)}>
        <XIcon size={12} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <Toast key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}
