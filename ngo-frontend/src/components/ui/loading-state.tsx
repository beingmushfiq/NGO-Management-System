import React from "react";
import { cn } from "@/lib/cn";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";

// ─── SPINNER COMPONENT ────────────────────────────────────────
interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
  labelBn?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
  xl: "h-14 w-14 border-4",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  label,
  labelBn,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <div
        className={cn(
          "rounded-full border-teal-200 border-t-teal-700 dark:border-teal-900/60 dark:border-t-teal-400 animate-spin",
          sizeMap[size],
          className
        )}
      />
      {(label || labelBn) && (
        <div className="text-center">
          {label && (
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {label}
            </p>
          )}
          {labelBn && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
              {labelBn}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── TABLE SKELETON ───────────────────────────────────────────
interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 5,
  className,
}) => {
  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900", className)}>
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between p-3 gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={cn(
                  "h-3.5 animate-pulse rounded bg-slate-200 dark:bg-slate-800",
                  cIdx === 0 ? "w-28" : cIdx === cols - 1 ? "w-16" : "w-20"
                )}
                style={{ animationDelay: `${(rIdx + cIdx) * 60}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── CARD SKELETON ────────────────────────────────────────────
export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-7 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
};

// ─── DETAIL SKELETON ──────────────────────────────────────────
export const DetailSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-6 max-w-5xl", className)}>
      {/* Banner Skeleton */}
      <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 p-8 animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-300 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-slate-300 dark:bg-slate-700" />
            <div className="h-7 w-56 rounded bg-slate-300 dark:bg-slate-700" />
            <div className="h-3.5 w-40 rounded bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
        <div className="h-10 w-32 rounded-xl bg-slate-300 dark:bg-slate-700" />
      </div>

      {/* Grid Skeleton */}
      <CardSkeleton count={3} />

      {/* Table Skeleton */}
      <TableSkeleton rows={4} cols={5} />
    </div>
  );
};

// ─── FULL PAGE LOADER ─────────────────────────────────────────
export const FullPageLoader: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({
  title = "Connecting to Microfinance Core Ledger...",
  subtitle = "লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="flex flex-col items-center rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm text-center animate-in zoom-in-95">
        <div className="relative mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-inner">
            <Sparkles className="h-8 w-8 animate-spin duration-1000" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-teal-500/30 animate-ping opacity-30" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bengali">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
