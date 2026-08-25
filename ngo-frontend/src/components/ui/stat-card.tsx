import React from "react";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  titleBn?: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "teal" | "emerald" | "amber" | "rose" | "slate" | "indigo";
  className?: string;
  onClick?: () => void;
}

const colorMap = {
  teal: {
    bg: "bg-teal-50/70 dark:bg-teal-950/30",
    border: "border-teal-200/60 dark:border-teal-800/40",
    text: "text-teal-900 dark:text-teal-100",
    iconBg: "bg-teal-600 text-white",
    subtle: "text-teal-700 dark:text-teal-300",
  },
  emerald: {
    bg: "bg-emerald-50/70 dark:bg-emerald-950/30",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
    text: "text-emerald-900 dark:text-emerald-100",
    iconBg: "bg-emerald-600 text-white",
    subtle: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    bg: "bg-amber-50/70 dark:bg-amber-950/30",
    border: "border-amber-200/60 dark:border-amber-800/40",
    text: "text-amber-900 dark:text-amber-100",
    iconBg: "bg-amber-500 text-white",
    subtle: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    bg: "bg-rose-50/70 dark:bg-rose-950/30",
    border: "border-rose-200/60 dark:border-rose-800/40",
    text: "text-rose-900 dark:text-rose-100",
    iconBg: "bg-rose-600 text-white",
    subtle: "text-rose-700 dark:text-rose-300",
  },
  indigo: {
    bg: "bg-indigo-50/70 dark:bg-indigo-950/30",
    border: "border-indigo-200/60 dark:border-indigo-800/40",
    text: "text-indigo-900 dark:text-indigo-100",
    iconBg: "bg-indigo-600 text-white",
    subtle: "text-indigo-700 dark:text-indigo-300",
  },
  slate: {
    bg: "bg-slate-50/70 dark:bg-slate-800/40",
    border: "border-slate-200/70 dark:border-slate-700/60",
    text: "text-slate-900 dark:text-slate-100",
    iconBg: "bg-slate-700 text-white",
    subtle: "text-slate-600 dark:text-slate-400",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  titleBn,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "slate",
  className,
  onClick,
}) => {
  const styles = colorMap[variant] || colorMap.slate;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-5 transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md relative overflow-hidden",
        styles.border,
        onClick && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>
            {titleBn && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                ({titleBn})
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight financial-value text-slate-900 dark:text-white">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs pt-1">
              <span
                className={cn(
                  "font-medium inline-flex items-center",
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                vs last week
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs",
              styles.iconBg
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};
