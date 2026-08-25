import React, { useState } from "react";
import { useAuditStore, type AuditActionType, type AuditLogEntry } from "@/store/audit-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  FileCheck2,
  Search,
  Download,
  Calendar,
  User,
  Building,
  HandCoins,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { toast } from "@/components/ui/toast-system";

export const ActivityLogModal: React.FC = () => {
  const { auditLogs, isAuditModalOpen, closeAuditModal } = useAuditStore();
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === "ALL" || log.action.includes(actionFilter);
    const matchesSearch =
      log.actionTitle.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionIcon = (action: AuditActionType) => {
    if (action.includes("COLLECTION")) return HandCoins;
    if (action.includes("LOAN")) return CreditCard;
    if (action.includes("SAVINGS")) return PiggyBank;
    if (action.includes("MEMBER")) return User;
    return ShieldCheck;
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Action", "Actor", "Role", "Branch", "Target", "Amount (BDT)", "Details", "Timestamp", "IP Address"];
    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.actionTitle}"`,
      `"${log.actorName}"`,
      log.actorRole,
      `"${log.branchName}"`,
      `"${log.targetEntity} (${log.targetId})"`,
      log.amount || 0,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${formatDateTime(log.timestamp)}"`,
      log.ipAddress || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `NGO_Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Audit Trail Exported", `Downloaded ${filteredLogs.length} activity audit log records.`);
  };

  return (
    <Dialog open={isAuditModalOpen} onOpenChange={closeAuditModal}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Institutional Activity Log & Audit Trail
                  <Badge variant="default" className="text-[10px] bg-teal-700 text-white">
                    {auditLogs.length} Records
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Immutable microfinance compliance journal tracking loans, recoveries, KYC, and vault changes.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={auditLogs.length === 0}
              className="text-xs gap-1.5 self-start sm:self-auto"
            >
              <Download className="h-3.5 w-3.5" /> Export Audit CSV
            </Button>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search activity, borrower, actor, receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
            {[
              { key: "ALL", label: "All Logs" },
              { key: "COLLECTION", label: "Collections" },
              { key: "LOAN", label: "Disbursements" },
              { key: "MEMBER", label: "Member KYC" },
              { key: "SAVINGS", label: "Savings Vault" },
              { key: "SETTINGS", label: "Admin Events" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setActionFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
                  actionFilter === f.key
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Clock className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Activity Records Found
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search keywords or category filters.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 mt-0.5">
                        <ActionIcon className="h-5 w-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {log.actionTitle}
                          </h4>
                          {log.actionTitleBn && (
                            <span className="text-xs text-slate-400 font-bengali">
                              ({log.actionTitleBn})
                            </span>
                          )}
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {log.action}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {log.details}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 flex-wrap">
                          <span>
                            Actor: <strong className="text-slate-700 dark:text-slate-200">{log.actorName}</strong>
                          </span>
                          <span>•</span>
                          <span>{log.branchName}</span>
                          <span>•</span>
                          <span>{log.targetEntity}</span>
                          {log.ipAddress && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px]">{log.ipAddress}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {log.amount !== undefined && (
                        <div className="text-sm font-extrabold text-teal-800 dark:text-teal-300 financial-value">
                          {formatCurrency(log.amount)}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
