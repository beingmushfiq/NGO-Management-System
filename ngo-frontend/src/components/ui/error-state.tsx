import React, { useState } from "react";
import { cn } from "@/lib/cn";
import {
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ServerCrash,
  WifiOff,
  ShieldAlert,
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { useAuthStore } from "@/store";

interface ErrorStateProps {
  title?: string;
  titleBn?: string;
  message?: string;
  errorCode?: string;
  statusCode?: number;
  stackTrace?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
  showFallbackToDemo?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something Went Wrong",
  titleBn = "একটি ত্রুটি ঘটেছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন",
  message = "The system encountered an unexpected condition while communicating with the database or services.",
  errorCode = "SYSTEM_ERROR",
  statusCode,
  stackTrace,
  onRetry,
  onGoBack,
  className,
  showFallbackToDemo = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setMode } = useAuthStore();

  const handleCopyTrace = () => {
    const text = `Error Code: ${errorCode}\nStatus: ${statusCode || "N/A"}\nMessage: ${message}\nStack: ${stackTrace || "No trace available"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isNetwork = errorCode.includes("NETWORK") || statusCode === 0;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 max-w-2xl mx-auto my-6 animate-in fade-in-50",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 mb-4">
        {isNetwork ? (
          <WifiOff className="h-8 w-8" />
        ) : (
          <AlertTriangle className="h-8 w-8" />
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Badge variant="destructive" className="font-mono text-[10px] uppercase tracking-wider">
          {errorCode} {statusCode ? `(${statusCode})` : ""}
        </Badge>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      {titleBn && (
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali mb-3">
          {titleBn}
        </p>
      )}

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mb-6 leading-relaxed">
        {message}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="default"
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again / আবার চেষ্টা করুন
          </Button>
        )}

        {showFallbackToDemo && (
          <Button
            onClick={() => {
              setMode("demo");
              window.location.reload();
            }}
            size="sm"
            variant="outline"
            className="text-xs border-slate-300 dark:border-slate-700"
          >
            Switch to Demo Mode
          </Button>
        )}

        {onGoBack && (
          <Button
            onClick={onGoBack}
            size="sm"
            variant="ghost"
            className="text-xs gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Go Back
          </Button>
        )}
      </div>

      {/* Technical Diagnostics Collapsible */}
      {stackTrace && (
        <div className="w-full mt-4 pt-4 border-t border-rose-200/60 dark:border-rose-900/40 text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Technical Stack Trace & Diagnostics</span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto relative">
              <button
                onClick={handleCopyTrace}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy Trace"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <pre className="whitespace-pre-wrap pr-16">{stackTrace}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── ERROR BOUNDARY COMPONENT ─────────────────────────────────
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("UI Component Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.fallbackTitle || "Render Error in Module"}
          titleBn="এই মডিউলে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে"
          message={this.state.error?.message || "An unexpected error disrupted this view."}
          errorCode="REACT_COMPONENT_CRASH"
          stackTrace={this.state.error?.stack || this.state.errorInfo?.componentStack || undefined}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          onGoBack={() => window.location.assign("/admin/dashboard")}
        />
      );
    }

    return this.props.children;
  }
}
