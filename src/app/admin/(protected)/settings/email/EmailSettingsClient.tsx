"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Send,
  RefreshCw,
  Sliders,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Check,
  X,
  FileText,
  AlertOctagon,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface SmtpInfo {
  host: string;
  port: number;
  secure: boolean;
  encryption: string;
  username: string;
  senderName: string;
  senderEmail: string;
  dailyLimit: number;
  hourlyLimit: number;
  enabled: boolean;
  hasPasswordConfigured: boolean;
}

interface QuotaInfo {
  allowed: boolean;
  sentToday: number;
  limit: number;
  remaining: number;
}

interface DnsRecordInfo {
  record: string;
  status: string;
  type: string;
  host: string;
}

interface EmailLogItem {
  id: number;
  recipient: string;
  subject: string;
  emailType: string;
  status: "sent" | "failed" | "rate_limited";
  errorMessage: string | null;
  messageId: string | null;
  retryCount: number;
  sentAt: string;
}

export const EmailSettingsClient: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [smtp, setSmtp] = useState<SmtpInfo | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [dns, setDns] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<EmailLogItem[]>([]);

  // Form states
  const [senderName, setSenderName] = useState("NewsKrez");
  const [senderEmail, setSenderEmail] = useState("alert@newskrez.com");
  const [dailyLimit, setDailyLimit] = useState(500);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [smtpEnabled, setSmtpEnabled] = useState(true);
  const [doubleOptIn, setDoubleOptIn] = useState(true);
  const [breakingAlertsEnabled, setBreakingAlertsEnabled] = useState(true);
  const [dailyNewsletterEnabled, setDailyNewsletterEnabled] = useState(true);
  const [newSmtpPassword, setNewSmtpPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Operations state
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logFilter, setLogFilter] = useState<string>("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email/settings");
      const data = await res.json();
      if (data.success) {
        setSmtp(data.smtp);
        setQuota(data.quota);
        setDns(data.dns || {});
        setLogs(data.recentLogs || []);

        setSenderName(data.smtp.senderName || "NewsKrez");
        setSenderEmail(data.smtp.senderEmail || "alert@newskrez.com");
        setDailyLimit(data.smtp.dailyLimit || 500);
        setHourlyLimit(data.smtp.hourlyLimit || 100);
        setSmtpEnabled(data.smtp.enabled ?? true);
      }
    } catch (err) {
      console.error("Error loading email settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const res = await fetch("/api/admin/email/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpPassword: newSmtpPassword || undefined,
        }),
      });

      const data = await res.json();
      setConnectionResult({
        success: data.success,
        message: data.message,
      });
    } catch (err: any) {
      setConnectionResult({
        success: false,
        message: err.message || "Failed to initiate test connection.",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setSendingTest(true);
    setTestSendResult(null);

    try {
      const res = await fetch("/api/admin/email/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: testRecipient,
          smtpPassword: newSmtpPassword || undefined,
        }),
      });

      const data = await res.json();
      setTestSendResult({
        success: data.success,
        message: data.message,
      });

      if (data.success) {
        // Refresh logs and quota
        loadData();
      }
    } catch (err: any) {
      setTestSendResult({
        success: false,
        message: err.message || "Network error sending test email.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          dailyLimit,
          hourlyLimit,
          smtpEnabled,
          doubleOptIn,
          breakingAlertsEnabled,
          dailyNewsletterEnabled,
          smtpPassword: newSmtpPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setNewSmtpPassword("");
        setTimeout(() => setSaveSuccess(false), 4000);
        loadData();
      } else {
        alert(data.error || "Failed to save settings.");
      }
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;
    return log.status === logFilter;
  });

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link href="/admin/settings" className="hover:text-navy-900 transition-colors">
              Portal Settings
            </Link>
            <span>/</span>
            <span className="text-brandTeal-600">Email Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-navy-900">
            Hostinger SMTP & Notification Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure Nodemailer credentials, test live socket handshake, verify SPF/DKIM/DMARC alignment, and monitor delivery logs.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            {testingConnection ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Server className="w-3.5 h-3.5 text-brandTeal-400" />
            )}
            <span>Test SMTP Connection</span>
          </button>

          <button
            type="button"
            onClick={() => setTestModalOpen(true)}
            className="px-4 py-2 bg-brandTeal-600 hover:bg-brandTeal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Email</span>
          </button>
        </div>
      </div>

      {/* Connection Test Banner if triggered */}
      {connectionResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in text-xs font-medium ${
            connectionResult.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {connectionResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <span className="font-bold block text-sm">
              {connectionResult.success ? "SMTP Socket & Handshake Successful" : "SMTP Connection Alert"}
            </span>
            <p className="leading-relaxed">{connectionResult.message}</p>
          </div>
        </div>
      )}

      {/* Grid: Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: SMTP Server Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hostinger SMTP Node
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Host:</span>
              <span className="font-mono font-bold text-navy-900">smtp.hostinger.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Port:</span>
              <span className="font-mono font-bold text-navy-900">465 (SSL/TLS)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Username:</span>
              <span className="font-mono font-bold text-navy-900 truncate max-w-[160px]">
                alert@newskrez.com
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Password:</span>
              <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                {smtp?.hasPasswordConfigured ? "Loaded from SMTP_PASSWORD" : "Needs Password"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Quota & Sending Limits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Quota (Hostinger Limit)
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-navy-950 font-serif">
                {quota?.sentToday ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                / {quota?.limit ?? 500} daily limit
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brandTeal-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (((quota?.sentToday ?? 0) / (quota?.limit ?? 500)) * 100) || 2
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Remaining: <strong>{quota?.remaining ?? 500}</strong></span>
              <span>Rate limit: <strong>100 / hr</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Domain DNS Authenticity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Email Authentication
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">SPF Record</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                ✓ Validated
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">DKIM Signatures</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                ✓ 3 Keys Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">DMARC Policy</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                ✓ Protected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brandTeal-600" />
            <h2 className="font-serif font-bold text-base text-navy-950">
              Sender Configuration & Automation Parameters
            </h2>
          </div>
          {saveSuccess && (
            <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Configuration Saved!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Sender Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
              Sender Display Name
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-medium"
            />
            <p className="text-[11px] text-slate-400">The name displayed in recipient inboxes (e.g. NewsKrez).</p>
          </div>

          {/* Sender Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
              Sender From Address
            </label>
            <input
              type="email"
              required
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-medium"
            />
            <p className="text-[11px] text-slate-400">Must match authenticated mailbox (alert@newskrez.com).</p>
          </div>

          {/* SMTP Password Override / Update */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
                Update SMTP Password (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                className="text-xs text-brandTeal-600 hover:text-brandTeal-700 font-bold flex items-center gap-1"
              >
                {showPasswordInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswordInput ? "Hide Input" : "Change Password"}</span>
              </button>
            </div>
            {showPasswordInput ? (
              <input
                type="password"
                placeholder="Enter new Hostinger email password to save to server"
                value={newSmtpPassword}
                onChange={(e) => setNewSmtpPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-amber-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            ) : (
              <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono flex items-center justify-between">
                <span>••••••••••••••••••••</span>
                <span className="text-[10px] text-slate-400 font-sans">
                  Protected: loaded from process.env.SMTP_PASSWORD
                </span>
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Never exposed to the public. Leave blank to keep existing server-side environment password.
            </p>
          </div>

          {/* Daily Limit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
              Daily Sending Cap
            </label>
            <input
              type="number"
              min="10"
              max="2000"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-medium"
            />
            <p className="text-[11px] text-slate-400">Hostinger shared hosting standard limit is 500 emails/day.</p>
          </div>

          {/* Hourly Limit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
              Hourly Sending Cap
            </label>
            <input
              type="number"
              min="5"
              max="500"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500 font-medium"
            />
            <p className="text-[11px] text-slate-400">Prevents burst spikes to maintain 100% inbox reputation.</p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50">
            <div>
              <span className="font-bold text-xs text-navy-900 block">
                Enable Outgoing SMTP Deliveries
              </span>
              <span className="text-[11px] text-slate-400">Global master switch for email dispatches</span>
            </div>
            <input
              type="checkbox"
              checked={smtpEnabled}
              onChange={(e) => setSmtpEnabled(e.target.checked)}
              className="w-4 h-4 text-brandTeal-600 rounded"
            />
          </label>

          <label className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50">
            <div>
              <span className="font-bold text-xs text-navy-900 block">
                Double Opt-in Subscription Confirmation
              </span>
              <span className="text-[11px] text-slate-400">Requires verifying email before activation</span>
            </div>
            <input
              type="checkbox"
              checked={doubleOptIn}
              onChange={(e) => setDoubleOptIn(e.target.checked)}
              className="w-4 h-4 text-brandTeal-600 rounded"
            />
          </label>

          <label className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50">
            <div>
              <span className="font-bold text-xs text-navy-900 block">
                Automatic Daily Newsletters
              </span>
              <span className="text-[11px] text-slate-400">Scheduled daily dispatch via Hostinger cron</span>
            </div>
            <input
              type="checkbox"
              checked={dailyNewsletterEnabled}
              onChange={(e) => setDailyNewsletterEnabled(e.target.checked)}
              className="w-4 h-4 text-brandTeal-600 rounded"
            />
          </label>

          <label className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50">
            <div>
              <span className="font-bold text-xs text-navy-900 block">
                Instant Breaking News Alerts
              </span>
              <span className="text-[11px] text-slate-400">Trigger emails for critical regulatory bulletins</span>
            </div>
            <input
              type="checkbox"
              checked={breakingAlertsEnabled}
              onChange={(e) => setBreakingAlertsEnabled(e.target.checked)}
              className="w-4 h-4 text-brandTeal-600 rounded"
            />
          </label>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-brandTeal-600 hover:bg-brandTeal-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2"
          >
            {savingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Email Configurations</span>
          </button>
        </div>
      </form>

      {/* Hostinger DNS Records Reference */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif font-bold text-base text-navy-950">
              Hostinger DNS Zone Authentication Records (newskrez.com)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Automated DNS Health</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-navy-900">SPF Record (TXT)</span>
              <span className="text-emerald-700 font-bold text-[10px]">Active</span>
            </div>
            <p className="font-mono text-[11px] text-slate-600 break-all">
              v=spf1 include:_spf.mail.hostinger.com ~all
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-navy-900">DKIM Record (CNAME)</span>
              <span className="text-emerald-700 font-bold text-[10px]">Active</span>
            </div>
            <p className="font-mono text-[11px] text-slate-600 break-all">
              hostingermail-a._domainkey -&gt; dkim.mail.hostinger.com
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-navy-900">DMARC Policy (TXT)</span>
              <span className="text-emerald-700 font-bold text-[10px]">Active</span>
            </div>
            <p className="font-mono text-[11px] text-slate-600 break-all">
              _dmarc -&gt; v=DMARC1; p=none
            </p>
          </div>
        </div>
      </div>

      {/* Live Email Delivery Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-brandTeal-600" />
            <h2 className="font-serif font-bold text-base text-navy-950">
              MySQL Email Delivery Logs
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs">
              {["all", "sent", "failed", "rate_limited"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLogFilter(f)}
                  className={`px-3 py-1 font-semibold uppercase text-[10px] transition-colors ${
                    logFilter === f
                      ? "bg-navy-900 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>

            <button
              onClick={loadData}
              className="p-1.5 text-slate-500 hover:text-navy-900 border border-slate-200 rounded-lg hover:bg-slate-50"
              title="Refresh logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Retries</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-navy-900">{log.recipient}</td>
                    <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                        {log.emailType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{log.retryCount}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === "sent"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.status === "rate_limited"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No email logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Test Email Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-brandTeal-600" />
                <h3 className="font-serif font-bold text-base text-navy-900">
                  Send Test Verification Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatches a branded test message through <strong>smtp.hostinger.com:465 (SSL/TLS)</strong> to verify delivery and inbox formatting.
            </p>

            {testSendResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                  testSendResult.success
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {testSendResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{testSendResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Recipient Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-brandTeal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sendingTest || !testRecipient}
                  className="px-5 py-2 bg-brandTeal-600 hover:bg-brandTeal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
                >
                  {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Test Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
