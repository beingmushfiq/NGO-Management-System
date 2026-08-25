import React, { useState } from "react";
import { useAuditStore, type ErrorSeverity, type ErrorLogEntry } from "@/store/audit-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Trash2,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Server,
  WifiOff,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "@/components/ui/toast-system";

export const ErrorLogInspectorModal: React.FC = () => {
  const {
    errorLogs,
    isErrorModalOpen,
    closeErrorModal,
    markErrorResolved,
    clearErrorLogs,
  } = useAuditStore();

  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = errorLogs.filter((err) => {
    const matchesSev = severityFilter === "ALL" || err.severity === severityFilter;
    const matchesSearch =
      err.message.toLowerCase().includes(search.toLowerCase()) ||
      err.errorCode?.toLowerCase().includes(search.toLowerCase()) ||
      err.endpoint?.toLowerCase().includes(search.toLowerCase()) ||
      err.componentName?.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const handleCopyTrace = (err: ErrorLogEntry) => {
    const content = JSON.stringify(err, null, 2);
    navigator.clipboard.writeText(content);
    setCopiedId(err.id);
    toast.success("Copied Error Diagnostics", "JSON error details copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(errorLogs, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `NGO_Error_Logs_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    toast.success("Error Logs Exported", `Exported ${errorLogs.length} error incidents to JSON.`);
  };

  return (
    <Dialog open={isErrorModalOpen} onOpenChange={closeErrorModal}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  System Error & Exception Inspector
                  <Badge variant="destructive" className="text-[10px]">
                    {errorLogs.length} Incidents
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time network exceptions, API 4xx/5xx responses, and idempotency collision logs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                disabled={errorLogs.length === 0}
                className="text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearErrorLogs();
                  toast.info("Logs Cleared", "Error log stream emptied.");
                }}
                disabled={errorLogs.length === 0}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search endpoint, message, component..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
            {["ALL", "CRITICAL", "API_ERROR", "NETWORK_OFFLINE", "VALIDATION"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
                  severityFilter === sev
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {sev.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Error Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-transparent">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Zero Error Incidents
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                No matching exceptions or API errors reported for this filter.
              </p>
            </div>
          ) : (
            filteredLogs.map((err) => {
              const isExpanded = expandedErrorId === err.id;
              return (
                <div
                  key={err.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            err.severity === "CRITICAL"
                              ? "destructive"
                              : err.severity === "API_ERROR"
                              ? "destructive"
                              : "warning"
                          }
                          className="text-[10px] font-mono"
                        >
                          {err.severity}
                        </Badge>
                        {err.statusCode && (
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            HTTP {err.statusCode}
                          </span>
                        )}
                        {err.endpoint && (
                          <span className="text-xs font-mono font-semibold text-teal-800 dark:text-teal-400">
                            {err.endpoint}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white pt-1">
                        {err.message}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDateTime(err.timestamp)}
                        </span>
                        {err.componentName && (
                          <span>Component: <strong className="text-slate-600 dark:text-slate-300">{err.componentName}</strong></span>
                        )}
                        {err.userRole && (
                          <span>Role: <strong className="text-slate-600 dark:text-slate-300">{err.userRole}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyTrace(err)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                        title="Copy diagnostics JSON"
                      >
                        {copiedId === err.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => setExpandedErrorId(isExpanded ? null : err.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                        title="Toggle Stack Trace"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Stack Trace */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {err.stackTrace || JSON.stringify(err, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
