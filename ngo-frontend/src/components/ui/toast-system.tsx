import React from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastItem = { ...toast, id, duration: toast.duration || 4500 };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-dismiss
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, newToast.duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenient helper functions
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, type: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, type: "error" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, type: "info" }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, type: "warning" }),
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type?: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-teal-500 shrink-0" />;
    }
  };

  const getBorderColor = (type?: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/40 bg-emerald-950/90 text-emerald-100";
      case "error":
        return "border-rose-500/40 bg-rose-950/90 text-rose-100";
      case "warning":
        return "border-amber-500/40 bg-amber-950/90 text-amber-100";
      default:
        return "border-teal-500/40 bg-slate-900/95 text-slate-100";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md ${getBorderColor(
              t.type
            )}`}
          >
            <div className="mt-0.5">{getIcon(t.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs leading-tight text-white">
                {t.title}
              </div>
              {t.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
