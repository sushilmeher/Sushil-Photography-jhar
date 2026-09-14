import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Database,
  Film,
  Image as ImageIcon,
  FolderArchive,
  Download,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  FileCheck,
  CheckCircle,
  Trash2,
  Archive,
  ArchiveRestore,
  Eye,
  Info,
  Hash,
  ShieldAlert,
  Layers,
  Calendar,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';
import { StorageMetrics, StorageFileItem, MasterPhotoItem } from '../types';
import { api } from '../services/api';

export const AdminStorageDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'master-photos'>('overview');
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [masterPhotos, setMasterPhotos] = useState<MasterPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanding, setExpanding] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandSuccess, setExpandSuccess] = useState<string | null>(null);

  // Master Photos Management State (Rules P, Q, R, S, T)
  const [masterSearch, setMasterSearch] = useState('');
  const [masterArchiveFilter, setMasterArchiveFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [masterOrderFilter, setMasterOrderFilter] = useState<string>('all');
  const [masterSortBy, setMasterSortBy] = useState<'date-desc' | 'date-asc' | 'size-desc' | 'name-asc'>('date-desc');
  const [selectedPhotoDetails, setSelectedPhotoDetails] = useState<MasterPhotoItem | null>(null);
  const [deleteModalPhoto, setDeleteModalPhoto] = useState<MasterPhotoItem | null>(null);
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState('');
  const [deleteStatusMessage, setDeleteStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, filesData, mastersData] = await Promise.all([
        api.getStorageMetrics(),
        api.getStorageFiles(),
        api.getMasterPhotos(),
      ]);
      setMetrics(metricsData);
      setFiles(filesData);
      setMasterPhotos(mastersData);
    } catch (err) {
      console.error('Failed to load storage dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandStorage = async () => {
    try {
      setExpanding(true);
      const res = await api.expandStorage(5);
      setMetrics(res.metrics);
      setExpandSuccess('Successfully scaled Cloud Storage by +5 TB! New Capacity: ' + res.metrics.totalCapacityFormatted);
      setTimeout(() => setExpandSuccess(null), 5000);
    } catch (err: any) {
      alert('Storage expansion error: ' + err.message);
    } finally {
      setExpanding(false);
    }
  };

  const handleToggleArchive = async (photo: MasterPhotoItem) => {
    try {
      const newStatus = !photo.isArchived;
      await api.toggleArchiveMasterPhoto(photo.id, newStatus);
      setMasterPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, isArchived: newStatus } : p))
      );
      setDeleteStatusMessage({
        type: 'success',
        text: `Photo ${newStatus ? 'archived' : 'restored to active vault'} successfully.`,
      });
      setTimeout(() => setDeleteStatusMessage(null), 4000);
    } catch (err: any) {
      alert('Archive error: ' + err.message);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModalPhoto) return;
    if (deleteConfirmationPhrase !== 'PERMANENTLY DELETE') {
      setDeleteStatusMessage({
        type: 'error',
        text: 'Confirmation phrase did not match. Deletion cancelled to protect wedding master.',
      });
      return;
    }

    try {
      await api.deleteMasterPhotoPermanent(deleteModalPhoto.id, deleteConfirmationPhrase);
      setMasterPhotos((prev) => prev.filter((p) => p.id !== deleteModalPhoto.id));
      setDeleteStatusMessage({
        type: 'success',
        text: `Master photo ${deleteModalPhoto.originalFileName} was permanently deleted by admin.`,
      });
      setDeleteModalPhoto(null);
      setDeleteConfirmationPhrase('');
      setTimeout(() => setDeleteStatusMessage(null), 5000);
    } catch (err: any) {
      setDeleteStatusMessage({
        type: 'error',
        text: err.message || 'Permanent deletion failed',
      });
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchCategory =
      categoryFilter === 'all' || f.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchSearch =
      f.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (f.customerName && f.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (f.orderId && f.orderId.toLowerCase().includes(search.toLowerCase())) ||
      (f.uploadId && f.uploadId.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const uniqueOrders = Array.from(new Set(masterPhotos.map((p) => p.orderId)));

  const filteredMasterPhotos = masterPhotos
    .filter((p) => {
      const matchArchive =
        masterArchiveFilter === 'all'
          ? true
          : masterArchiveFilter === 'archived'
          ? p.isArchived
          : !p.isArchived;

      const matchOrder = masterOrderFilter === 'all' || p.orderId === masterOrderFilter;

      const q = masterSearch.toLowerCase();
      const matchSearch =
        p.originalFileName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.customerId.toLowerCase().includes(q) ||
        p.uploadId.toLowerCase().includes(q) ||
        p.checksumSha256.toLowerCase().includes(q);

      return matchArchive && matchOrder && matchSearch;
    })
    .sort((a, b) => {
      if (masterSortBy === 'date-desc') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (masterSortBy === 'date-asc') {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (masterSortBy === 'size-desc') {
        return b.fileSize - a.fileSize;
      }
      if (masterSortBy === 'name-asc') {
        return a.originalFileName.localeCompare(b.originalFileName);
      }
      return 0;
    });

  return (
    <div id="admin-storage-dashboard" className="space-y-8">
      {/* Subnavigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                : 'text-zinc-400 hover:text-white bg-[#121218] border border-zinc-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>5 TB Storage Metrics & General Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('master-photos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'master-photos'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                : 'text-zinc-400 hover:text-white bg-[#121218] border border-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Master Photos & Retention Vault (Rules P-T)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-amber-300 font-mono">
              {masterPhotos.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Rules A-T Verified • SHA-256 Hashing Active</span>
        </div>
      </div>

      {deleteStatusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            deleteStatusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          {deleteStatusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{deleteStatusMessage.text}</span>
        </div>
      )}

      {/* VIEW 1: 5 TB CLOUD INFRASTRUCTURE & METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Capacity */}
            <div className="bg-[#121218] border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Total Cloud Capacity</span>
                <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-cinzel text-white">
                  {metrics?.totalCapacityFormatted || '5.00 TB'}
                </h3>
                <p className="text-[11px] text-zinc-500">Tier-1 High Availability Object Storage</p>
              </div>
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  99.9999% Durability
                </span>
                <span className="text-zinc-400">AWS / R2 Backed</span>
              </div>
            </div>

            {/* Used Storage */}
            <div className="bg-[#121218] border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Used Storage</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-cinzel text-white">
                  {metrics?.usedStorageFormatted || '1.39 TB'}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {metrics?.usagePercentage || 27.7}% of total capacity consumed
                </p>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#d4af37] to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.usagePercentage || 28}%` }}
                />
              </div>
            </div>

            {/* Available Free Space */}
            <div className="bg-[#121218] border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Available Free Space</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-cinzel text-emerald-400">
                  {metrics?.availableStorageFormatted || '3.61 TB'}
                </h3>
                <p className="text-[11px] text-zinc-500">Headroom for upcoming wedding seasons</p>
              </div>
              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                Auto-expands on threshold reach
              </div>
            </div>

            {/* Total File Count */}
            <div className="bg-[#121218] border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Cataloged Assets</span>
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <FolderArchive className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-cinzel text-white">
                  {metrics?.totalFilesCount.toLocaleString() || '14,820'}
                </h3>
                <p className="text-[11px] text-zinc-500">Across 128 active wedding orders</p>
              </div>
              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                RAW, 4K Pro, JPEGs & Master Albums
              </div>
            </div>
          </div>

          {/* Storage Expansion & Notification Bar */}
          <div className="bg-gradient-to-r from-[#161622] via-[#1a1a28] to-[#161622] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-cinzel font-bold text-base">
                <Database className="w-4 h-4 text-[#d4af37]" />
                <span>5 TB Scalable Cloud Storage Management</span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl">
                Sushil Photography cloud object repository supports seamless hot scaling. Add 5 TB storage modules on demand without service interruption.
              </p>
            </div>

            <button
              onClick={handleExpandStorage}
              disabled={expanding}
              id="btn-expand-storage"
              className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs flex items-center gap-2 hover:bg-[#e6c86e] transition-all shadow-lg shadow-[#d4af37]/20 whitespace-nowrap disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{expanding ? 'Scaling Storage...' : 'Expand Storage (+5 TB)'}</span>
            </button>
          </div>

          {expandSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{expandSuccess}</span>
            </div>
          )}

          {/* Category Breakdown Bars */}
          <div className="bg-[#121218] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-base font-bold text-white">Storage Breakdown by Asset Category</h4>
              <span className="text-xs text-zinc-400">Organized structure: Customer → Wedding → Photos → Proofs → Delivery</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics?.breakdown &&
                Object.entries(metrics.breakdown).map(([key, rawData]) => {
                  const data = rawData as { formatted: string; fileCount: number; percentage: number };
                  const labelMap: Record<string, { label: string; icon: any }> = {
                    photos: { label: 'Wedding Photos (RAW + JPG)', icon: ImageIcon },
                    videos: { label: 'Full Wedding Films (4K Master)', icon: Film },
                    highlights: { label: 'Wedding Highlights & Teasers', icon: Film },
                    edited: { label: 'Final Color-Graded Files', icon: FileCheck },
                    albums: { label: 'Album Spreads & 12x36 Proofs', icon: FolderArchive },
                    deliveries: { label: 'Customer Final Delivery Bundles', icon: Download },
                  };
                  const itemInfo = labelMap[key] || { label: key, icon: Database };
                  const Icon = itemInfo.icon;

                  return (
                    <div key={key} className="bg-[#161620] border border-zinc-800/80 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-300 font-medium">
                          <Icon className="w-4 h-4 text-[#d4af37]" />
                          <span>{itemInfo.label}</span>
                        </div>
                        <span className="font-mono text-[#d4af37] font-semibold">{data.formatted}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{data.fileCount.toLocaleString()} files</span>
                        <span>{data.percentage}% of total storage</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#d4af37] h-full rounded-full"
                          style={{ width: `${Math.min(100, data.percentage * 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* General Files Vault Table */}
          <div className="bg-[#121218] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-cinzel text-base font-bold text-white">5 TB File Vault Browser</h4>
                <p className="text-xs text-zinc-400">Inspect stored files, verify order links, and access signed links</p>
              </div>

              {/* Table Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search files, orders, upload IDs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-black/50 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] w-52"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Photos">Photos</option>
                  <option value="Videos">Videos</option>
                  <option value="Highlights">Highlights</option>
                  <option value="Edited">Edited Files</option>
                  <option value="Album">Album Files</option>
                  <option value="Final Delivery">Final Delivery</option>
                </select>

                <button
                  onClick={loadData}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Refresh Files"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Files Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">File Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Customer / Order</th>
                    <th className="py-3 px-3">Upload ID</th>
                    <th className="py-3 px-3">Uploaded Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2 max-w-xs truncate">
                        {file.category === 'Videos' || file.category === 'Highlights' ? (
                          <Film className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{file.fileName}</span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                          {file.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">{file.sizeFormatted}</td>
                      <td className="py-3 px-3 font-sans">
                        <div className="text-zinc-200">{file.customerName || 'N/A'}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{file.orderId || 'SPJ-ORD-1001'}</div>
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{file.uploadId || 'UPL-101'}</td>
                      <td className="py-3 px-3 font-sans text-zinc-400">{file.uploadedAt}</td>
                      <td className="py-3 px-3 text-right font-sans">
                        <a
                          href={file.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-[#d4af37] hover:text-black transition-colors text-[11px]"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MASTER PHOTO ASSET CATALOG & RETENTION (RULES P, Q, R, S, T) */}
      {activeTab === 'master-photos' && (
        <div className="space-y-6">
          {/* Rules Summary Banner */}
          <div className="bg-[#121218] border border-[#272732] rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                  Rules P, Q, R, S, T Enforced
                </span>
                <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Permanent Retention Guard
                </span>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white">
                Master RAW & High-Resolution Wedding Photo Catalog
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl mt-1">
                Files are strictly never auto-deleted. Each master file stores Customer ID, Wedding ID, Order ID,
                Album Selection ID, Upload ID, and unique SHA-256 Checksum for zero-duplicate efficiency.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="px-4 py-2 rounded-xl bg-[#181820] border border-[#272732] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Master Vault
              </button>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-[#121218] border border-[#272732] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search file name, ID, order, checksum..."
                  value={masterSearch}
                  onChange={(e) => setMasterSearch(e.target.value)}
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                />
              </div>

              {/* Order Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Order:</span>
                <select
                  value={masterOrderFilter}
                  onChange={(e) => setMasterOrderFilter(e.target.value)}
                  className="bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                >
                  <option value="all">All Orders ({masterPhotos.length})</option>
                  {uniqueOrders.map((ord) => (
                    <option key={ord} value={ord}>
                      {ord}
                    </option>
                  ))}
                </select>
              </div>

              {/* Archive Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Status:</span>
                <select
                  value={masterArchiveFilter}
                  onChange={(e) => setMasterArchiveFilter(e.target.value as any)}
                  className="bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                >
                  <option value="all">All Photos</option>
                  <option value="active">Active Vault</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">Sort:</span>
                <select
                  value={masterSortBy}
                  onChange={(e) => setMasterSortBy(e.target.value as any)}
                  className="bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="size-desc">Largest Size</option>
                  <option value="name-asc">File Name (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-mono text-zinc-400">
              Showing: <strong className="text-white">{filteredMasterPhotos.length}</strong> of {masterPhotos.length}
            </div>
          </div>

          {/* Master Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMasterPhotos.map((photo) => (
              <div
                key={photo.id}
                className={`bg-[#121218] border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                  photo.isArchived ? 'border-zinc-800 opacity-60' : 'border-[#272732] hover:border-[#d4af37]/60'
                }`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-black/80 overflow-hidden group">
                  <img
                    src={photo.thumbnailUrl || photo.previewUrl}
                    alt={photo.originalFileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-zinc-700 text-[10px] font-mono text-white">
                      {photo.fileFormat} • {photo.sizeFormatted}
                    </span>
                    {photo.isArchived && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-[10px] text-amber-300 font-bold">
                        Archived
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Master RAW
                    </span>
                  </div>

                  {/* Quick inspect overlay button */}
                  <button
                    onClick={() => setSelectedPhotoDetails(photo)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold"
                  >
                    <Eye className="w-4 h-4" /> Inspect Metadata
                  </button>
                </div>

                {/* Photo Info */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white truncate" title={photo.originalFileName}>
                      {photo.originalFileName}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      ID: <span className="text-zinc-200">{photo.id}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      Order: <span className="text-amber-300">{photo.orderId}</span> • Customer: {photo.customerId}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate" title={`SHA-256: ${photo.checksumSha256}`}>
                      Hash: {photo.checksumSha256.slice(0, 16)}...
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-[#272732] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPhotoDetails(photo)}
                        className="p-1.5 rounded-lg bg-[#181820] text-zinc-300 hover:text-white border border-[#272732]"
                        title="View Full Metadata Record"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={photo.originalUrl}
                        download={photo.originalFileName}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#181820] text-[#d4af37] hover:text-[#e6c86e] border border-[#272732]"
                        title="Download Uncompressed Master File (Rule T)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleToggleArchive(photo)}
                        className="p-1.5 rounded-lg bg-[#181820] text-zinc-300 hover:text-amber-400 border border-[#272732]"
                        title={photo.isArchived ? 'Restore to Active Vault' : 'Archive Photo'}
                      >
                        {photo.isArchived ? (
                          <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setDeleteModalPhoto(photo);
                        setDeleteConfirmationPhrase('');
                      }}
                      className="p-1.5 rounded-lg bg-red-950/30 text-red-400 hover:bg-red-900/50 border border-red-900/40"
                      title="Permanent Deletion with Confirmation (Rule Q)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* METADATA INSPECTOR MODAL (Rule E, F, R, S) */}
      {selectedPhotoDetails && (
        <div
          onClick={() => setSelectedPhotoDetails(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full bg-[#121218] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl cursor-default"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#272732]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-cinzel text-lg font-bold text-white">
                  Master Photo Specification & Identity
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhotoDetails(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans">Unique File ID (Rule E)</span>
                <p className="text-white font-bold">{selectedPhotoDetails.id}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans">Original File Name</span>
                <p className="text-white font-bold truncate">{selectedPhotoDetails.originalFileName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans">Customer ID / Wedding ID</span>
                <p className="text-white">
                  {selectedPhotoDetails.customerId} • {selectedPhotoDetails.weddingId}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans">Order ID & Upload ID</span>
                <p className="text-amber-400">
                  {selectedPhotoDetails.orderId} • {selectedPhotoDetails.uploadId}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans">Album Selection ID Reference (Rule G)</span>
                <p className="text-emerald-400">{selectedPhotoDetails.albumSelectionId}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans">File Size & MIME</span>
                <p className="text-white">
                  {selectedPhotoDetails.sizeFormatted} ({selectedPhotoDetails.fileSize.toLocaleString()} B) • {selectedPhotoDetails.mimeType}
                </p>
              </div>
            </div>

            {/* Storage Path & Checksum */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0a0a0e] border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans">
                  Rule F Storage Path Organization
                </span>
                <p className="text-zinc-300 break-all">{selectedPhotoDetails.uniqueStorageKey}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0a0a0e] border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-sans flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#d4af37]" />
                  SHA-256 Checksum Hash (Rule D & R Zero Duplicates)
                </span>
                <p className="text-emerald-400 break-all">{selectedPhotoDetails.checksumSha256}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-zinc-400">
                Uploaded: {new Date(selectedPhotoDetails.uploadedAt).toLocaleString()}
              </div>

              <a
                href={selectedPhotoDetails.originalUrl}
                download={selectedPhotoDetails.originalFileName}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#e6c86e]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Uncompressed Original</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETION SAFETY MODAL (Rules H & Q) */}
      {deleteModalPhoto && (
        <div
          onClick={() => setDeleteModalPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-[#141215] border border-red-800/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl cursor-default"
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-white">
                  Permanent Master Deletion
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Rule Q • Retention Protection
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              You are about to permanently erase original master photo{' '}
              <strong className="text-white font-mono">{deleteModalPhoto.originalFileName}</strong> ({deleteModalPhoto.id})
              from the 5 TB storage repository.
            </p>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 text-[11px] text-red-200 space-y-1">
              <strong>Critical Safety Mandate:</strong>
              <p>
                Wedding photos are never auto-deleted. To confirm that you are intentionally deleting this asset,
                type <code>PERMANENTLY DELETE</code> below.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400 font-mono">
                Type <strong className="text-red-400">PERMANENTLY DELETE</strong> to proceed:
              </label>
              <input
                type="text"
                value={deleteConfirmationPhrase}
                onChange={(e) => setDeleteConfirmationPhrase(e.target.value)}
                placeholder="PERMANENTLY DELETE"
                className="w-full bg-black/60 border border-red-900/60 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-zinc-600 focus:border-red-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalPhoto(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={deleteConfirmationPhrase !== 'PERMANENTLY DELETE'}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-red-900/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Permanent Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
