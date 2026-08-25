import React, { useState } from "react";
import { useNotificationStore } from "@/store";
import { timeAgo } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  CreditCard,
  AlertTriangle,
  FileCheck,
  Info,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead, getUnreadCount } = useNotificationStore();
  const unreadCount = getUnreadCount();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "collection":
        return <FileCheck className="h-4 w-4 text-emerald-600" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      case "new_loan":
        return <CreditCard className="h-4 w-4 text-teal-600" />;
      default:
        return <Info className="h-4 w-4 text-sky-600" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-0 zoom-in-95">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {unreadCount} new
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markRead(n.id);
                if (n.link) {
                  onClose();
                  navigate(n.link);
                }
              }}
              className={`p-2.5 flex items-start gap-2.5 rounded-xl transition-colors cursor-pointer ${
                !n.read
                  ? "bg-teal-50/60 dark:bg-teal-950/30"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
