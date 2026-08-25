import React from "react";
import { cn } from "@/lib/cn";
import {
  Inbox,
  Users,
  CreditCard,
  PiggyBank,
  Receipt,
  Search,
  FolderOpen,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./button";

export type EmptyStateVariant = "customers" | "loans" | "savings" | "collections" | "search" | "general";

interface EmptyStateProps {
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  actionText?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

const variantIconMap: Record<EmptyStateVariant, LucideIcon> = {
  customers: Users,
  loans: CreditCard,
  savings: PiggyBank,
  collections: Receipt,
  search: Search,
  general: Inbox,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  titleBn,
  description,
  descriptionBn,
  variant = "general",
  icon,
  actionText,
  actionIcon: ActionIcon = Plus,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className,
}) => {
  const Icon = icon || variantIconMap[variant] || Inbox;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-dashed border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-xs transition-all",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/80 dark:border-slate-700 text-teal-700 dark:text-teal-400 mb-4 transition-transform hover:scale-105">
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        {title}
        {titleBn && (
          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 font-bengali mt-0.5">
            {titleBn}
          </span>
        )}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
        {descriptionBn && (
          <span className="block text-xs text-slate-400 dark:text-slate-500 font-bengali mt-1">
            {descriptionBn}
          </span>
        )}
      </p>

      {(onAction || onSecondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {actionText && onAction && (
            <Button
              onClick={onAction}
              size="sm"
              variant="default"
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-xs"
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 text-teal-200" />}
              {actionText}
            </Button>
          )}

          {secondaryActionText && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
};
