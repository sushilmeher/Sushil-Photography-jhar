import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Cloud,
  Layers,
  ArrowRight,
  ShieldCheck,
  Table,
  UploadCloud,
  FileCheck,
  ExternalLink,
  Code2,
  Copy,
  Download,
  Terminal,
} from 'lucide-react';
import { supabaseService, SUPABASE_PROJECT_ID, SUPABASE_URL } from '../services/supabase';
import { api } from '../services/api';

const SQL_SCHEMA_SCRIPT = `-- ==============================================================================
-- Sushil Photography Jhar (SPJ) - PostgreSQL / Supabase Database Schema
-- Project: rlewwujizdhnornbwhaq
-- Database: PostgreSQL 15+ (Supabase Cloud Database)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bookings & Appointments Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service TEXT NOT NULL,
    event_type TEXT DEFAULT 'Wedding',
    event_date DATE NOT NULL,
    event_time TEXT,
    location TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled')),
    package_name TEXT,
    amount NUMERIC(10, 2) DEFAULT 0.00,
    advance_amount NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON public.bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 2. Payments & Bank Transfers Table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT DEFAULT 'Advance Payment',
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Verification' CHECK (status IN ('Pending Verification', 'Successful', 'Failed', 'Refunded', 'Partial')),
    transaction_id TEXT,
    receipt_number TEXT,
    date DATE DEFAULT CURRENT_DATE,
    screenshot_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(date);

-- 3. Orders & Deliverables Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service TEXT NOT NULL,
    status TEXT DEFAULT 'Received' CHECK (status IN ('Received', 'In Progress', 'Editing', 'Album Design', 'Ready for Delivery', 'Completed', 'Cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    advance_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bookings" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Allow public select payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update payments" ON public.payments FOR UPDATE USING (true);

CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);`;

const SAMPLE_QUERIES = [
  {
    title: 'Total Revenue & Verified Collections',
    sql: `SELECT 
    COUNT(*) as total_transactions,
    SUM(amount) as total_collected_inr,
    AVG(amount) as average_transaction
FROM public.payments
WHERE status = 'Successful';`,
  },
  {
    title: 'Pending Bank Transfers Requiring Verification',
    sql: `SELECT id, customer_name, customer_phone, amount, transaction_id, date, created_at
FROM public.payments
WHERE status = 'Pending Verification'
ORDER BY created_at DESC;`,
  },
  {
    title: 'Upcoming Photography Shoots (Next 30 Days)',
    sql: `SELECT id, customer_name, customer_phone, service, event_date, location, status
FROM public.bookings
WHERE event_date >= CURRENT_DATE 
  AND event_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY event_date ASC;`,
  },
  {
    title: 'Monthly Booking Volume & Sales',
    sql: `SELECT 
    TO_CHAR(event_date, 'YYYY-Mon') as month,
    COUNT(*) as total_events,
    SUM(amount) as total_booked_value,
    SUM(advance_amount) as total_advance_received
FROM public.bookings
GROUP BY TO_CHAR(event_date, 'YYYY-Mon')
ORDER BY MIN(event_date) DESC;`,
  },
];

export const AdminSupabaseManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'queries'>('status');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedQueryIdx, setCopiedQueryIdx] = useState<number | null>(null);

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [lastTestedTime, setLastTestedTime] = useState<string | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState<{ bookings: number; payments: number }>({
    bookings: 0,
    payments: 0,
  });

  // Recent data in Supabase
  const [remoteBookings, setRemoteBookings] = useState<any[]>([]);
  const [remotePayments, setRemotePayments] = useState<any[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionMessage('');
    try {
      const result = await supabaseService.testConnection();
      setIsConnected(result.success);
      setConnectionMessage(result.message);
      setLastTestedTime(new Date().toLocaleTimeString());
      if (result.success) {
        fetchRemoteData();
      }
    } catch (err: any) {
      setIsConnected(false);
      setConnectionMessage(err?.message || 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const fetchRemoteData = async () => {
    setLoadingRemote(true);
    try {
      const [bks, pymts] = await Promise.all([
        supabaseService.fetchBookings(),
        supabaseService.fetchPayments(),
      ]);
      setRemoteBookings(bks || []);
      setRemotePayments(pymts || []);
    } catch (err) {
      console.warn('Could not query Supabase tables:', err);
    } finally {
      setLoadingRemote(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncStatus('Fetching local bookings & payments...');
    try {
      const [localBookings, localPayments] = await Promise.all([
        api.getBookings(),
        api.getPayments(),
      ]);

      setSyncStatus(`Syncing ${localBookings.length} bookings and ${localPayments.length} payments to Supabase Cloud...`);

      let bSuccess = 0;
      for (const b of localBookings) {
        const res = await supabaseService.saveBooking(b);
        if (res.success) bSuccess++;
      }

      let pSuccess = 0;
      for (const p of localPayments) {
        const res = await supabaseService.savePayment(p);
        if (res.success) pSuccess++;
      }

      setSyncedCount({ bookings: bSuccess, payments: pSuccess });
      setSyncStatus(`Sync Completed! ${bSuccess} bookings & ${pSuccess} payments synchronized with Supabase.`);
      fetchRemoteData();
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyQuery = (sql: string, idx: number) => {
    navigator.clipboard.writeText(sql);
    setCopiedQueryIdx(idx);
    setTimeout(() => setCopiedQueryIdx(null), 3000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SQL_SCHEMA_SCRIPT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sushil_photography_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const supabaseSqlEditorUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Cloud className="w-3.5 h-3.5" />
            <span>PostgreSQL & Supabase Cloud</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            SQL Database & Supabase Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            PostgreSQL relational schemas, real-time table sync, and SQL query generator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={supabaseSqlEditorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#d4af37]" />
            <span>Open Supabase SQL Editor</span>
          </a>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-60"
          >
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Sync All to Cloud</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#272732] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'status'
              ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
              : 'bg-[#181822] text-zinc-400 hover:text-white border border-[#272732]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Connection & Cloud Data</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sql'
              ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
              : 'bg-[#181822] text-zinc-400 hover:text-white border border-[#272732]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>PostgreSQL Schema DDL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'queries'
              ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
              : 'bg-[#181822] text-zinc-400 hover:text-white border border-[#272732]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Useful SQL Queries</span>
        </button>
      </div>

      {/* TAB 1: CONNECTION & DATA STATUS */}
      {activeTab === 'status' && (
        <div className="space-y-8">
          {/* Connection Status Card */}
          <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#272732] pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-white">
                    PostgreSQL Connection Status
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">
                    Supabase Project: <strong className="text-[#d4af37]">{SUPABASE_PROJECT_ID}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1c28] hover:bg-[#252535] text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5 border border-[#2e2e42]"
                >
                  <RefreshCw className={`w-3 h-3 ${testingConnection ? 'animate-spin text-[#d4af37]' : ''}`} />
                  <span>Re-test</span>
                </button>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                  {isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{isConnected ? 'Connected & Active' : 'Connecting / Verifying'}</span>
                </span>
              </div>
            </div>

            {connectionMessage && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${isConnected ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'}`}>
                <Server className="w-4 h-4 shrink-0" />
                <span>{connectionMessage} {lastTestedTime && `(Checked at ${lastTestedTime})`}</span>
              </div>
            )}

            {syncStatus && (
              <div className="p-4 rounded-2xl bg-[#181822] border border-[#d4af37]/30 text-xs text-[#f5e7b2] flex items-center gap-2 font-mono">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''} text-[#d4af37] shrink-0`} />
                <span>{syncStatus}</span>
              </div>
            )}

            {/* Credentials Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-sans">Database Host / Endpoint</span>
                <code className="text-white font-bold truncate block">{SUPABASE_URL}</code>
              </div>

              <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-sans">Database Engine</span>
                <code className="text-emerald-400 font-bold truncate block">PostgreSQL 15+ (Supabase)</code>
              </div>

              <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-sans">Active Tables</span>
                <code className="text-[#d4af37] font-bold block">bookings, payments, orders</code>
              </div>
            </div>
          </div>

          {/* Database Schema & Tables Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bookings Table Overview */}
            <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#d4af37]" />
                  <span>Bookings Table ('bookings')</span>
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {remoteBookings.length} records in Cloud
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                Stores appointment submissions, shoot dates, packages, customer contacts, and venue details.
              </p>

              <div className="bg-[#181822] border border-[#272732] rounded-2xl p-4 max-h-60 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2">
                {remoteBookings.length > 0 ? (
                  remoteBookings.map((b, idx) => (
                    <div key={b.id || idx} className="p-2.5 rounded-lg bg-[#101015] border border-[#272732] flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-white font-bold">{b.id}</span> • {b.customer_name}
                        <div className="text-zinc-500 text-[10px]">{b.service} • {b.event_date}</div>
                      </div>
                      <span className="text-emerald-400 font-bold">{b.status || 'Confirmed'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    <span>No remote rows found yet. Click "Sync All to Cloud" to push existing bookings.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payments Table Overview */}
            <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Payments Table ('payments')</span>
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {remotePayments.length} records in Cloud
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                Stores transaction UTRs, HDFC bank transfers, UPI logs, and receipt voucher records.
              </p>

              <div className="bg-[#181822] border border-[#272732] rounded-2xl p-4 max-h-60 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2">
                {remotePayments.length > 0 ? (
                  remotePayments.map((p, idx) => (
                    <div key={p.id || idx} className="p-2.5 rounded-lg bg-[#101015] border border-[#272732] flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-white font-bold">{p.id}</span> • {p.customer_name}
                        <div className="text-zinc-500 text-[10px]">{p.payment_method} • TRX: {p.transaction_id}</div>
                      </div>
                      <span className="text-[#d4af37] font-bold">₹{(p.amount || 0).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    <span>No payment rows queried yet. Automatic sync active on every new payment submission.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POSTGRESQL SCHEMA DDL SCRIPT */}
      {activeTab === 'sql' && (
        <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272732] pb-4">
            <div>
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#d4af37]" />
                <span>PostgreSQL Database Schema (DDL)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Run this SQL script in your Supabase SQL Editor to create or update all tables, indexes, and RLS policies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#d4af37]" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSql}
                className="px-4 py-2 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-[#0b0b0f] border border-[#272732] rounded-2xl p-5 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
              <code>{SQL_SCHEMA_SCRIPT}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: USEFUL SQL QUERIES */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#d4af37]" />
                <span>Ready-to-Run Studio SQL Analytics Queries</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Copy and run these analytical queries directly inside Supabase SQL Editor for deep business insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SAMPLE_QUERIES.map((q, idx) => (
                <div key={idx} className="bg-[#181822] border border-[#272732] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#d4af37] font-cinzel">{q.title}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyQuery(q.sql, idx)}
                        className="px-2.5 py-1 rounded-lg bg-[#222230] hover:bg-[#2b2b3d] text-[11px] font-semibold text-zinc-300 flex items-center gap-1 border border-[#333348]"
                      >
                        {copiedQueryIdx === idx ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedQueryIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="bg-[#0e0e14] p-3 rounded-xl text-[11px] font-mono text-zinc-300 overflow-x-auto border border-[#252533]">
                      <code>{q.sql}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

