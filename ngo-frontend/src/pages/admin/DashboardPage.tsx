import React, { useState, useMemo, useEffect } from "react";
import {
  useCustomerStore,
  useLoanStore,
  useSavingsStore,
  useCollectionStore,
  useBranchStore,
  useDueItems,
} from "@/store";
import { formatCurrency, formatCurrencyFull, formatDateTime, getInitials } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast-system";
import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-state";
import {
  HandCoins,
  FileText,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Users,
  Building2,
  CalendarCheck,
  ArrowUpRight,
  Receipt,
  Eye,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { CombinedCollectionModal } from "@/components/collection/CombinedCollectionModal";
import { useNavigate } from "react-router-dom";

type TrendRange = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = useCustomerStore();
  const { loans } = useLoanStore();
  const { accounts } = useSavingsStore();
  const { collections } = useCollectionStore();
  const { branches, selectedBranchId } = useBranchStore();

  const dueItems = useDueItems(selectedBranchId);
  const [trendRange, setTrendRange] = useState<TrendRange>("daily");
  const [dailySubRange, setDailySubRange] = useState<7 | 14 | 30>(7);
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-25");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const [selectedCustomerIdForCollect, setSelectedCustomerIdForCollect] = useState<string | null>(null);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data hydration transition (immediate for seeded data)
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Compute live financial totals
  const totalOutstanding = loans
    .filter((l) => l.status === "active" || l.status === "overdue")
    .reduce((sum, l) => sum + Number(l.outstanding || 0), 0);

  const totalSavings = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  const branchCollections = selectedBranchId
    ? collections.filter((c) => String(c.branchId) === String(selectedBranchId))
    : collections;

  const todayCollections = branchCollections.slice(0, 8);
  const todayLoanTotal = branchCollections.reduce((sum, c) => sum + Number(c.loanAmount || 0), 0);
  const todaySavingsTotal = branchCollections.reduce((sum, c) => sum + Number(c.savingsAmount || 0), 0);
  const todayTotal = todayLoanTotal + todaySavingsTotal;

  const activeLoansCount = loans.filter((l) => l.status === "active").length;
  const activeCustomersCount = customers.filter((c) => c.status === "active").length;

  // DYNAMIC COLLECTION TREND GENERATOR
  const trendData = useMemo(() => {
    if (trendRange === "daily") {
      const count = dailySubRange;
      const days = ["19 Aug", "20 Aug", "21 Aug", "22 Aug", "23 Aug", "24 Aug", "25 Aug", "26 Aug", "27 Aug", "28 Aug", "29 Aug", "30 Aug", "31 Aug", "01 Sep"];
      const baseValues = [
        { label: "19 Aug", loan: 82000, savings: 14000 },
        { label: "20 Aug", loan: 94000, savings: 18000 },
        { label: "21 Aug", loan: 89000, savings: 16500 },
        { label: "22 Aug", loan: 102000, savings: 21000 },
        { label: "23 Aug", loan: 98000, savings: 19000 },
        { label: "24 Aug", loan: 110000, savings: 22500 },
        { label: "25 Aug", loan: todayLoanTotal > 0 ? todayLoanTotal : 105000, savings: todaySavingsTotal > 0 ? todaySavingsTotal : 20500 },
      ];

      if (count === 7) {
        return baseValues.map((d) => ({
          name: d.label,
          loan: d.loan,
          savings: d.savings,
          total: d.loan + d.savings,
          rate: Math.round((d.loan / (d.loan + 12000)) * 100),
        }));
      }

      // 14 or 30 days
      const result = [];
      for (let i = 1; i <= count; i++) {
        const loan = Math.round(75000 + Math.sin(i) * 25000 + (i * 1200));
        const savings = Math.round(14000 + Math.cos(i) * 6000 + (i * 300));
        result.push({
          name: `Day ${i}`,
          loan,
          savings,
          total: loan + savings,
          rate: Math.min(99, Math.round(90 + (i % 8))),
        });
      }
      return result;
    }

    if (trendRange === "weekly") {
      return [
        { name: "W1 (Jul)", loan: 520000, savings: 98000, total: 618000, rate: 93 },
        { name: "W2 (Jul)", loan: 560000, savings: 105000, total: 665000, rate: 95 },
        { name: "W3 (Jul)", loan: 590000, savings: 112000, total: 702000, rate: 94 },
        { name: "W4 (Jul)", loan: 610000, savings: 118000, total: 728000, rate: 96 },
        { name: "W1 (Aug)", loan: 580000, savings: 110000, total: 690000, rate: 92 },
        { name: "W2 (Aug)", loan: 640000, savings: 125000, total: 765000, rate: 97 },
        { name: "W3 (Aug)", loan: 710000, savings: 140000, total: 850000, rate: 98 },
        { name: "W4 (Aug)", loan: 695000, savings: 138000, total: 833000, rate: 96 },
      ];
    }

    if (trendRange === "monthly") {
      return [
        { name: "Jan", loan: 2100000, savings: 410000, total: 2510000, rate: 92 },
        { name: "Feb", loan: 2250000, savings: 435000, total: 2685000, rate: 94 },
        { name: "Mar", loan: 2400000, savings: 460000, total: 2860000, rate: 93 },
        { name: "Apr", loan: 2350000, savings: 450000, total: 2800000, rate: 91 },
        { name: "May", loan: 2600000, savings: 495000, total: 3095000, rate: 96 },
        { name: "Jun", loan: 2750000, savings: 520000, total: 3270000, rate: 97 },
        { name: "Jul", loan: 2900000, savings: 550000, total: 3450000, rate: 98 },
        { name: "Aug (MTD)", loan: 2625000, savings: 513000, total: 3138000, rate: 96 },
      ];
    }

    if (trendRange === "yearly") {
      return [
        { name: "2022", loan: 18500000, savings: 3200000, total: 21700000, rate: 89 },
        { name: "2023", loan: 24200000, savings: 4400000, total: 28600000, rate: 92 },
        { name: "2024", loan: 31000000, savings: 5900000, total: 36900000, rate: 95 },
        { name: "2025", loan: 38400000, savings: 7100000, total: 45500000, rate: 97 },
        { name: "2026 (YTD)", loan: 20975000, savings: 3833000, total: 24808000, rate: 98 },
      ];
    }

    // Custom range
    return [
      { name: "Period 1", loan: 340000, savings: 65000, total: 405000, rate: 93 },
      { name: "Period 2", loan: 420000, savings: 78000, total: 498000, rate: 95 },
      { name: "Period 3", loan: 390000, savings: 72000, total: 462000, rate: 94 },
      { name: "Period 4", loan: 460000, savings: 89000, total: 549000, rate: 97 },
      { name: "Period 5", loan: 510000, savings: 96000, total: 606000, rate: 98 },
    ];
  }, [trendRange, dailySubRange, todayLoanTotal, todaySavingsTotal]);

  const trendTotalInflow = trendData.reduce((sum, d) => sum + d.total, 0);
  const trendTotalLoan = trendData.reduce((sum, d) => sum + d.loan, 0);
  const trendTotalSavings = trendData.reduce((sum, d) => sum + d.savings, 0);
  const avgEfficiency = Math.round(
    trendData.reduce((sum, d) => sum + d.rate, 0) / (trendData.length || 1)
  );

  const handleCollectCustomer = (customerId: string) => {
    setSelectedCustomerIdForCollect(customerId);
    setIsCollectModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-8 w-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-96 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <div className="h-72 w-full animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" />
          </div>
          <div className="h-72 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Dashboard Render Error">
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Executive Financial Overview / নির্বাহী ড্যাশবোর্ড
            </h1>
            <Badge variant="default" className="text-xs">Live System</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time dual-account credit portfolio, member savings vault, and multi-branch collection trends.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="default"
            size="default"
            className="gap-2 shadow-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
            onClick={() => {
              setSelectedCustomerIdForCollect(null);
              setIsCollectModalOpen(true);
            }}
          >
            <HandCoins className="h-4 w-4 text-teal-200" />
            + New Collection
          </Button>

          <Button
            variant="outline"
            size="default"
            className="gap-2"
            onClick={() => navigate("/admin/reports")}
          >
            <FileText className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Combined Collection"
          titleBn="আজকের মোট আদায়"
          value={formatCurrency(todayTotal)}
          variant="teal"
          icon={HandCoins}
          trend={{ value: "+14.2% vs yesterday", isPositive: true }}
          subtitle={`Loan: ${formatCurrency(todayLoanTotal)} • Savings: ${formatCurrency(todaySavingsTotal)}`}
        />

        <StatCard
          title="Active Loan Portfolio"
          titleBn="মোট বিতরণকৃত ঋণ স্থিতি"
          value={formatCurrency(totalOutstanding)}
          variant="amber"
          icon={CreditCard}
          subtitle={`${activeLoansCount} Running Weekly Cycles`}
        />

        <StatCard
          title="Member Savings Vault"
          titleBn="সদস্য মোট সঞ্চয় তহবিল"
          value={formatCurrency(totalSavings)}
          variant="emerald"
          icon={PiggyBank}
          trend={{ value: "+৳18,500 this week", isPositive: true }}
          subtitle="Total member deposits in vault"
        />

        <StatCard
          title="Collection Efficiency"
          titleBn="আজকের আদায় হার"
          value="96.4%"
          variant="indigo"
          icon={TrendingUp}
          trend={{ value: "Target: 95.0%", isPositive: true }}
          subtitle="Dual account recovery rate"
        />
      </div>

      {/* COLLECTION PERFORMANCE & TREND ENGINE */}
      <Card className="rounded-3xl p-6 space-y-5 border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Collection Performance & Trend / আদায় পারফরম্যান্স ও প্রবণতা
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dual-stream tracking of Loan Installments vs. Savings Deposits over selected period.
            </p>
          </div>

          {/* Time Range Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "daily", label: "Daily" },
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly" },
              { id: "custom", label: "Custom" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setTrendRange(tab.id as TrendRange);
                  toast.info(`Switched trend view to ${tab.label}`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  trendRange === tab.id
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Sub-selectors */}
            {trendRange === "daily" && (
              <div className="flex items-center gap-1 ml-2 border-l border-slate-200 dark:border-slate-700 pl-2">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setDailySubRange(days as any)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium cursor-pointer ${
                      dailySubRange === days
                        ? "bg-teal-100 text-teal-900 font-bold dark:bg-teal-950 dark:text-teal-200"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            )}

            {trendRange === "custom" && (
              <div className="flex items-center gap-1.5 ml-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-8 text-xs w-32"
                />
                <span className="text-xs text-slate-400">to</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-8 text-xs w-32"
                />
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Metric Badges for Selected Period */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Period Inflow (মোট আদায়)
            </span>
            <div className="text-lg font-extrabold text-teal-900 dark:text-teal-200 financial-value mt-0.5">
              {formatCurrency(trendTotalInflow)}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Loan Recovered
            </span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white financial-value mt-0.5">
              {formatCurrency(trendTotalLoan)}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Savings Deposited
            </span>
            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 financial-value mt-0.5">
              {formatCurrency(trendTotalSavings)}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Avg Recovery Rate
            </span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <span>{avgEfficiency}%</span>
              <Badge variant="success" className="text-[10px]">Optimal</Badge>
            </div>
          </div>
        </div>

        {/* Recharts Area / Bar Visualization */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `৳${(v / 1000).toLocaleString()}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "#334155",
                    borderRadius: "14px",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  name="Loan Repayment"
                  dataKey="loan"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#loanGrad)"
                />
                <Area
                  type="monotone"
                  name="Savings Deposit"
                  dataKey="savings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#savingsGrad)"
                />
              </AreaChart>
            ) : (
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `৳${(v / 1000).toLocaleString()}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderRadius: "14px",
                  }}
                />
                <Legend iconType="circle" />
                <Bar name="Loan Repayment" dataKey="loan" fill="#0f766e" radius={[6, 6, 0, 0]} />
                <Bar name="Savings Deposit" dataKey="savings" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two-Column Section: Today's Due Recovery Queue & Recent Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Due Field Recovery */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-teal-700" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Today's Due Recovery Queue / আজকের আদায় তালিকা
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {dueItems.length} members scheduled for weekly collection
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => navigate("/admin/due")}
              >
                View Full Queue ({dueItems.length})
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {dueItems.slice(0, 5).map((item) => (
                <div
                  key={item.customer.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 p-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(item.customer.name)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.customer.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.customer.customerId} • {item.customer.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                    <div className="text-right">
                      <div className="font-bold financial-value text-teal-800 dark:text-teal-300">
                        {formatCurrency(item.totalDue)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Loan: {formatCurrency(item.installment.expected)} + Sav: {formatCurrency(item.savingsAccount.monthlyContribution / 4)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 text-xs bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                      onClick={() => handleCollectCustomer(item.customer.id)}
                    >
                      <HandCoins className="h-3.5 w-3.5 mr-1 text-teal-200" /> Collect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Recent Verified Money Receipts */}
        <div className="space-y-4">
          <Card className="rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Recent Receipts
                </h3>
              </div>
              <Badge variant="default" className="text-[10px]">Real-time</Badge>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayCollections.map((col) => {
                const cust = customers.find((c) => c.id === col.customerId);
                return (
                  <div key={col.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-teal-800 dark:text-teal-300 text-[11px]">
                        {col.receiptNo}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        {cust?.name || "Customer"}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(col.collectedAt).split(",")[1]}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold financial-value text-slate-900 dark:text-white text-xs">
                        {formatCurrency(col.totalAmount)}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
                        {col.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Collection Modal Trigger */}
      <CombinedCollectionModal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        preselectedCustomerId={selectedCustomerIdForCollect || undefined}
      />
    </div>
    </ErrorBoundary>
  );
};

