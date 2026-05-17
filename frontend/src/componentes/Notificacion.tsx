import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUiStore } from '../estado/estadoUi';

const iconMap = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
  error:   <XCircle    className="w-5 h-5 text-red-400    shrink-0" />,
  info:    <Info       className="w-5 h-5 text-blue-400   shrink-0" />,
};

const bgMap = {
  success: 'bg-emerald-950/90 border-emerald-700/50',
  error:   'bg-red-950/90     border-red-700/50',
  info:    'bg-blue-950/90    border-blue-700/50',
};

export const ContenedorNotificaciones = () => {
  const { toasts, removeToast } = useUiStore();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' };
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger entrada
    requestAnimationFrame(() => {
      ref.current?.classList.remove('translate-x-full', 'opacity-0');
    });
  }, []);

  return (
    <div
      ref={ref}
      className={`
        pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl
        text-white text-sm font-medium backdrop-blur-md
        transition-all duration-300 ease-out
        translate-x-full opacity-0
        ${bgMap[toast.type]}
      `}
    >
      {iconMap[toast.type]}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/50 hover:text-white transition-colors ml-1 mt-0.5"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ContenedorNotificaciones;
