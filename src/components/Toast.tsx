import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  const e = err as {
    data?: { error?: string; message?: string };
    error?: string;
    message?: string;
  };
  return e?.data?.error || e?.data?.message || e?.error || e?.message || fallback;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} className="text-green-600" />,
  error: <AlertCircle size={20} className="text-red-500" />,
  warning: <AlertTriangle size={20} className="text-amber-500" />,
  info: <Info size={20} className="text-blue-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
};

const textColors: Record<ToastType, string> = {
  success: "text-green-800",
  error: "text-red-800",
  warning: "text-amber-800",
  info: "text-blue-800",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss(toast.id);
    }, 200);
  };

  if (!visible) return null;

  return (
    <div
      className={`relative flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-slide-in ${bgColors[toast.type]} ${
        exiting ? "animate-slide-out" : ""
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
      <p className={`flex-1 text-sm font-medium ${textColors[toast.type]}`}>{toast.message}</p>
      <button
        onClick={handleDismiss}
        className={`flex-shrink-0 rounded-lg p-1 transition-colors ${textColors[toast.type]} hover:opacity-60`}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 max-w-[calc(100vw-1.5rem)] flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}