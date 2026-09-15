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
} from 'lucide-react';
import { supabaseService, SUPABASE_PROJECT_ID, SUPABASE_URL } from '../services/supabase';
import { api } from '../services/api';

export const AdminSupabaseManager: React.FC = () => {
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Database Integration</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Supabase Cloud Database & Storage
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time persistence for appointments, bookings, payments, and order records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2.5 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs font-semibold text-zinc-200 flex items-center gap-2 transition-colors"
          >
            {testingConnection ? <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" /> : <Database className="w-4 h-4 text-[#d4af37]" />}
            <span>Test Connection</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-60"
          >
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Sync All Data to Supabase</span>
          </button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#272732] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">
                Supabase Connection Status
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                Project ID: <strong className="text-[#d4af37]">{SUPABASE_PROJECT_ID}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <span className="text-zinc-500 text-[10px] uppercase font-sans">API Endpoint</span>
            <code className="text-white font-bold truncate block">{SUPABASE_URL}</code>
          </div>

          <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-1">
            <span className="text-zinc-500 text-[10px] uppercase font-sans">Auth Role / Key</span>
            <code className="text-emerald-400 font-bold truncate block">sb_publishable_...8zdttH</code>
          </div>

          <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-1">
            <span className="text-zinc-500 text-[10px] uppercase font-sans">Tables Synchronized</span>
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
            Stores customer appointment submissions, shoot dates, event packages, and venue details.
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
                <span>No remote rows found yet. Click "Sync All Data to Supabase" to push existing bookings.</span>
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
  );
};
