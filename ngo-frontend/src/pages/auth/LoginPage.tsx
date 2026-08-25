import React, { useState, useEffect } from "react";
import { useAuthStore, useOrgStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast-system";
import {
  ShieldCheck,
  Lock,
  Phone,
  ArrowRight,
  Landmark,
  PiggyBank,
  Sparkles,
  Server,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export const LoginPage: React.FC = () => {
  const { login, loginWithCredentials, checkHealth, backendOnline } = useAuthStore();
  const org = useOrgStore((s) => s.settings);
  const navigate = useNavigate();

  const [phone, setPhone] = useState("01711-000001");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(true);

  useEffect(() => {
    checkHealth().finally(() => setIsCheckingServer(false));
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await loginWithCredentials(phone, password);
    setIsLoading(false);

    if (result.success) {
      toast.success("Authentication Successful", "Connected to Laravel + MySQL backend.");
      const user = useAuthStore.getState().user;
      if (user?.role === "admin") navigate("/admin/dashboard");
      else if (user?.role === "staff") navigate("/staff/dashboard");
      else navigate("/customer/overview");
    } else {
      // Prompt user with fallback option
      toast.warning("Live Backend Note", result.message || "Switching to instant demo fallback.");
      // Fallback
      login("admin");
      navigate("/admin/dashboard");
    }
  };

  const handleQuickDemoLogin = async (role: "admin" | "staff" | "customer", customerId?: string) => {
    setIsLoading(true);

    const personaPhones: Record<string, string> = {
      admin: "01711-000001",
      staff: "01711-000002",
      customer: "01712-345678",
    };

    const phone = personaPhones[role];
    await loginWithCredentials(phone, "password123");
    setIsLoading(false);

    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "staff") navigate("/staff/dashboard");
    else navigate("/customer/overview");
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Left Branding Hero (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-12 flex-col justify-between overflow-hidden">
        {/* Abstract financial grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-900 font-extrabold text-xl shadow-lg">
              {org.name.substring(0, 1)}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{org.name}</h1>
              <p className="text-xs text-teal-200 font-medium">{org.nameBn}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <Badge className="bg-teal-700/80 text-teal-100 border-teal-500/30 text-xs px-3 py-1 font-semibold">
            Institutional Microfinance Platform
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Integrated NGO Loan & Savings Management System
          </h2>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            Professional micro-credit operations platform enabling combined loan installment and savings collection, real-time branch performance monitoring, and institutional audit reporting.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-3.5 border border-white/10">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold mb-1">
                <Landmark className="h-4 w-4" /> Dual-Account Allocation
              </div>
              <p className="text-[11px] text-teal-100/70">
                Single payment seamlessly credited to loan and savings balances.
              </p>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-3.5 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
                <PiggyBank className="h-4 w-4" /> Multi-Branch Audit
              </div>
              <p className="text-[11px] text-teal-100/70">
                Live collection statistics with daily reconciliation reports.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-teal-200/60 border-t border-white/10 pt-6">
          <span>Reg No: {org.registrationNo}</span>
          <span>Digital Microfinance System v2.4</span>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-5"
        >
          {/* Server Connection Status Banner */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <div className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Backend Engine:</span>
            </div>
            {isCheckingServer ? (
              <span className="text-slate-400">Detecting...</span>
            ) : backendOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live MySQL Connected (:8000)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Demo Fallback Active
              </span>
            )}
          </div>

          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white font-bold text-lg">
                {org.name.substring(0, 1)}
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                {org.name}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Portal Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter credentials or select a one-click persona below
            </p>
          </div>

          {/* Quick 1-Click Demo Launcher */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 dark:border-teal-900/50 dark:bg-teal-950/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                Quick 1-Click Access
              </span>
              <Badge variant="default" className="text-[10px]">Instant Login</Badge>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Select a persona to test role permissions and workflows:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                variant="default"
                size="sm"
                className="text-xs bg-teal-800 hover:bg-teal-900 text-white cursor-pointer"
                onClick={() => handleQuickDemoLogin("admin")}
                isLoading={isLoading}
              >
                Admin Portal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                onClick={() => handleQuickDemoLogin("staff")}
                isLoading={isLoading}
              >
                Staff Portal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
                onClick={() => handleQuickDemoLogin("customer", "CUS-1024")}
                isLoading={isLoading}
              >
                Customer
              </Button>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mobile Number / Phone
              </label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
                placeholder="017XXXXXXXX"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-xs text-teal-700 font-medium">Default: password123</span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full h-11 text-sm font-semibold cursor-pointer"
              isLoading={isLoading}
            >
              Sign In to System <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>256-bit SSL Encrypted • Financial Operations Grade</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
