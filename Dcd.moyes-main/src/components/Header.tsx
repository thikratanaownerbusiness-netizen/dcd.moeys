/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Asset, 
  StockItem,
  HandoverRecord,
  MovementRecord,
  MaintenanceRecord,
  DamagedLostRecord,
  WriteOffRecord,
  AnnualAuditRecord
} from '../types';
import { 
  Bell, 
  Calendar, 
  Activity, 
  Sun, 
  Moon, 
  QrCode, 
  Smartphone, 
  Search, 
  X, 
  Package, 
  Box, 
  ArrowRightLeft, 
  History, 
  Wrench, 
  AlertCircle, 
  Trash2, 
  ClipboardCheck 
} from 'lucide-react';
import { Language, translations, getOfficeName, getCategoryName } from '../data/translations';
import QRCodeComponent from './QRCode';
import Barcode from './Barcode';

interface HeaderProps {
  assets: Asset[];
  stockItems: StockItem[];
  handovers?: HandoverRecord[];
  movements?: MovementRecord[];
  maintenance?: MaintenanceRecord[];
  damagedLost?: DamagedLostRecord[];
  writeoffs?: WriteOffRecord[];
  audits?: AnnualAuditRecord[];
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  systemLogo?: string | null;
  logoScale?: number;
  logoX?: number;
  logoY?: number;
}

export default function Header({ 
  assets = [], 
  stockItems = [], 
  handovers = [],
  movements = [],
  maintenance = [],
  damagedLost = [],
  writeoffs = [],
  audits = [],
  lang, 
  setLang, 
  theme, 
  setTheme, 
  systemLogo,
  logoScale = 100,
  logoX = 0,
  logoY = 0
}: HeaderProps) {
  
  const t = translations[lang];
  const lowStockCount = stockItems.filter(item => item.currentBalance <= item.minStock).length;
  const [showQrPopover, setShowQrPopover] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedResult, setSelectedResult] = React.useState<{
    type: 'asset' | 'stock' | 'handover' | 'movement' | 'maintenance' | 'damagedLost' | 'writeoff' | 'audit';
    data: any;
  } | null>(null);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Focus shortcut: Ctrl+K or Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFormattedDate = () => {
    const today = new Date();
    if (lang === 'KM') {
      const days = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
      const khmerMonths = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];
      
      const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
      const toKhmerNumber = (num: number) => {
        return num.toString().split('').map(char => khmerDigits[parseInt(char, 10)] || char).join('');
      };

      const dayName = days[today.getDay()];
      const dateNum = toKhmerNumber(today.getDate());
      const monthName = khmerMonths[today.getMonth()];
      const yearNum = toKhmerNumber(today.getFullYear());

      return `ថ្ងៃ${dayName}, ទី${dateNum} ខែ${monthName} ឆ្នាំ${yearNum}`;
    } else {
      return today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  // Search filter logic
  const query = searchQuery.trim().toLowerCase();

  const filteredAssets = query
    ? assets.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query) ||
          a.code.toLowerCase().includes(query) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(query))
      )
    : [];

  const filteredStockItems = query
    ? stockItems.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query)
      )
    : [];

  const filteredHandovers = query
    ? handovers.filter(
        (h) =>
          h.id.toLowerCase().includes(query) ||
          h.assetCode.toLowerCase().includes(query) ||
          h.assetName.toLowerCase().includes(query) ||
          h.staffName.toLowerCase().includes(query) ||
          h.giverName.toLowerCase().includes(query) ||
          h.receiverName.toLowerCase().includes(query)
      )
    : [];

  const filteredMovements = query
    ? movements.filter(
        (m) =>
          m.id.toLowerCase().includes(query) ||
          m.assetCode.toLowerCase().includes(query) ||
          m.assetName.toLowerCase().includes(query) ||
          m.responsiblePerson.toLowerCase().includes(query)
      )
    : [];

  const filteredMaintenance = query
    ? maintenance.filter(
        (mt) =>
          mt.id.toLowerCase().includes(query) ||
          mt.assetCode.toLowerCase().includes(query) ||
          mt.assetName.toLowerCase().includes(query) ||
          mt.repairType.toLowerCase().includes(query) ||
          mt.provider.toLowerCase().includes(query)
      )
    : [];

  const filteredDamagedLost = query
    ? damagedLost.filter(
        (dl) =>
          dl.id.toLowerCase().includes(query) ||
          dl.assetCode.toLowerCase().includes(query) ||
          dl.assetName.toLowerCase().includes(query) ||
          dl.reason.toLowerCase().includes(query) ||
          dl.proposal.toLowerCase().includes(query)
      )
    : [];

  const filteredWriteoffs = query
    ? writeoffs.filter(
        (w) =>
          w.id.toLowerCase().includes(query) ||
          w.assetCode.toLowerCase().includes(query) ||
          w.assetName.toLowerCase().includes(query) ||
          w.reason.toLowerCase().includes(query)
      )
    : [];

  const filteredAudits = query
    ? audits.filter(
        (au) =>
          au.id.toLowerCase().includes(query) ||
          au.assetCode.toLowerCase().includes(query) ||
          au.assetName.toLowerCase().includes(query) ||
          au.committee.toLowerCase().includes(query)
      )
    : [];

  const totalResultsCount =
    filteredAssets.length +
    filteredStockItems.length +
    filteredHandovers.length +
    filteredMovements.length +
    filteredMaintenance.length +
    filteredDamagedLost.length +
    filteredWriteoffs.length +
    filteredAudits.length;

  return (
    <div className="liquid-glass-header px-8 py-4 flex flex-col xl:flex-row items-center justify-between gap-4 select-none shrink-0 transition-colors">
      
      {/* Brand Identity / Department title */}
      <div className="flex items-center gap-3 text-center md:text-left shrink-0">
        {systemLogo && (
          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700/50 shrink-0 bg-blue-600 flex items-center justify-center">
            <img 
              src={systemLogo} 
              alt="System Logo" 
              style={{
                transform: `scale(${logoScale / 100}) translate(${logoX}px, ${logoY}px)`,
                transformOrigin: 'center center',
              }}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight font-moul">
            {t.deptName}
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400">{t.officialLedger}</p>
        </div>
      </div>

      {/* Central Global Search Bar */}
      <div ref={containerRef} className="flex-1 max-w-md w-full relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={lang === 'KM' ? 'ស្វែងរកទ្រព្យសម្បត្តិ សន្និធិ ឬកំណត់ត្រា (Ctrl+K)...' : 'Search assets, stock or records (Ctrl+K)...'}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-3xs"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 dark:hover:text-slate-250 transition-colors p-0.5 rounded-lg cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Popover Dropdown */}
        {isFocused && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 p-2 space-y-3">
            {totalResultsCount === 0 ? (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs italic">
                {lang === 'KM' ? 'មិនរកឃើញលទ្ធផលស្វែងរកឡើយ' : 'No results found'}
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Assets Section */}
                {filteredAssets.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'KM' ? 'ទ្រព្យសម្បត្តិ' : 'Assets'}</span>
                      <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{filteredAssets.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      {filteredAssets.slice(0, 5).map((asset) => (
                        <button
                          key={asset.id}
                          onClick={() => {
                            setSelectedResult({ type: 'asset', data: asset });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 shrink-0">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {asset.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {asset.code} • {getOfficeName(asset.officeId, lang)} • {asset.status}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Stock Items Section */}
                {filteredStockItems.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'KM' ? 'សន្និធិសម្ភារៈ' : 'Stock Items'}</span>
                      <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{filteredStockItems.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      {filteredStockItems.slice(0, 5).map((stock) => (
                        <button
                          key={stock.id}
                          onClick={() => {
                            setSelectedResult({ type: 'stock', data: stock });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 shrink-0">
                            <Box className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {stock.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              ID: {stock.id} • {lang === 'KM' ? 'ចំនួនក្នុងស្តុក' : 'Stock Balance'}: {stock.currentBalance} {stock.unit}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Record Types Section */}
                {(filteredHandovers.length > 0 ||
                  filteredMovements.length > 0 ||
                  filteredMaintenance.length > 0 ||
                  filteredDamagedLost.length > 0 ||
                  filteredWriteoffs.length > 0 ||
                  filteredAudits.length > 0) && (
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'KM' ? 'កំណត់ត្រា និងលិខិតផ្លូវការ' : 'Records & Documents'}</span>
                      <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        {filteredHandovers.length +
                          filteredMovements.length +
                          filteredMaintenance.length +
                          filteredDamagedLost.length +
                          filteredWriteoffs.length +
                          filteredAudits.length}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {/* Handover List */}
                      {filteredHandovers.slice(0, 3).map((h) => (
                        <button
                          key={h.id}
                          onClick={() => {
                            setSelectedResult({ type: 'handover', data: h });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 shrink-0">
                            <ArrowRightLeft className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {lang === 'KM' ? 'ប្រគល់-ទទួល៖' : 'Handover:'} {h.assetName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {h.assetCode} • {lang === 'KM' ? 'អ្នកទទួល' : 'Receiver'}: {h.staffName} • {h.handoverDate}
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Movement List */}
                      {filteredMovements.slice(0, 3).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedResult({ type: 'movement', data: m });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 shrink-0">
                            <History className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {lang === 'KM' ? 'ផ្ទេរ/ចលនា៖' : 'Movement:'} {m.assetName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {m.assetCode} • {m.type} • {m.date}
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Maintenance List */}
                      {filteredMaintenance.slice(0, 3).map((mt) => (
                        <button
                          key={mt.id}
                          onClick={() => {
                            setSelectedResult({ type: 'maintenance', data: mt });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400 shrink-0">
                            <Wrench className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {lang === 'KM' ? 'ជួសជុល៖' : 'Repair:'} {mt.assetName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {mt.assetCode} • {mt.repairType} • {mt.cost.toLocaleString()}៛
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Damaged or Lost List */}
                      {filteredDamagedLost.slice(0, 3).map((dl) => (
                        <button
                          key={dl.id}
                          onClick={() => {
                            setSelectedResult({ type: 'damagedLost', data: dl });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 shrink-0">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {lang === 'KM' ? 'ខូច/បាត់៖' : 'Damaged/Lost:'} {dl.assetName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {dl.assetCode} • {dl.type} • {dl.date}
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Write-off List */}
                      {filteredWriteoffs.slice(0, 3).map((w) => (
                        <button
                          key={w.id}
                          onClick={() => {
                            setSelectedResult({ type: 'writeoff', data: w });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-slate-600 dark:group-hover:text-slate-450 transition-colors">
                              {lang === 'KM' ? 'កាត់ចេញ៖' : 'Write-Off:'} {w.assetName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {w.assetCode} • {w.reason} • {w.status}
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Audits List */}
                      {filteredAudits.slice(0, 3).map((au) => (
                        <button
                          key={au.id}
                          onClick={() => {
                            setSelectedResult({ type: 'audit', data: au });
                            setIsFocused(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-500 dark:text-teal-400 shrink-0">
                            <ClipboardCheck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {lang === 'KM' ? 'រាប់បញ្ជី៖' : 'Audit:'} {au.assetName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {au.assetCode} • {lang === 'KM' ? 'ឆ្នាំ' : 'Year'}: {au.year} • Diff: {au.diff > 0 ? `+${au.diff}` : au.diff}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats, Toggles & Metadata Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold shrink-0">
        
        {/* Date Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 shadow-3xs">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{getFormattedDate()}</span>
        </div>

        {/* Live Active Status Indicator */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-400 shadow-3xs">
          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span>{t.activeSystem}</span>
        </div>

        {/* Alert Notifications if low stocks exist */}
        {lowStockCount > 0 && (
          <div className="relative cursor-pointer bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-1.5 transition-colors">
            <Bell className="h-4 w-4 text-red-600 dark:text-red-400 animate-bounce" />
            <span>{t.lowStockAlert.replace('{count}', String(lowStockCount))}</span>
          </div>
        )}

        {/* Theme and Language Selection Control Group */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
          
          {/* Mobile Sharing QR Code Popover Button */}
          <div className="relative">
            <button
              id="qr-code-share-btn"
              onClick={() => setShowQrPopover(!showQrPopover)}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title={lang === 'KM' ? 'ស្កែនបើកលើទូរស័ព្ទ / Open on Mobile' : 'Scan to open on Mobile'}
            >
              <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                {lang === 'KM' ? 'ទូរស័ព្ទ' : 'Mobile'}
              </span>
            </button>

            {showQrPopover && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl p-4 z-50 animate-fade-in space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40">
                  <h4 className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-indigo-500" />
                    {lang === 'KM' ? 'ស្កែនបើកលើទូរស័ព្ទ' : 'Scan for Mobile'}
                  </h4>
                  <button 
                    onClick={() => setShowQrPopover(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-[10px] font-bold cursor-pointer"
                  >
                    {lang === 'KM' ? 'បិទ' : 'Close'}
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  {lang === 'KM' 
                    ? 'ស្កែនកូដនេះជាមួយកាមេរ៉ាទូរស័ព្ទរបស់អ្នក ដើម្បីបើកប្រព័ន្ធគ្រប់គ្រងនេះដោយផ្ទាល់សម្រាប់ការស្កែនបាកូដងាយស្រួល!' 
                    : 'Scan this QR code with your phone camera to open this system directly for easy mobile barcode scanning!'}
                </p>

                <div className="flex justify-center py-1">
                  <QRCodeComponent 
                    value={window.location.origin + window.location.pathname} 
                    size={140} 
                    showDownloadButton={true} 
                    className="border-none shadow-none p-0 bg-transparent dark:bg-transparent"
                  />
                </div>

                <div className="text-center text-[9px] font-mono text-slate-400 dark:text-slate-500 break-all select-all pt-1 border-t border-slate-100 dark:border-slate-800/40">
                  {window.location.origin + window.location.pathname}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl flex items-center border border-slate-200 dark:border-slate-700/50">
            <button
              id="lang-btn-km"
              onClick={() => setLang('KM')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                lang === 'KM'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              ខ្មែរ
            </button>
            <button
              id="lang-btn-en"
              onClick={() => setLang('EN')}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                lang === 'EN'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            id="theme-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 transition-colors cursor-pointer flex items-center justify-center"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4 text-slate-600" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>
        </div>

      </div>

      {/* Selected Result Details Overlay Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/40 flex justify-between items-start">
              <div className="flex gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                  {selectedResult.type === 'asset' && <Package className="h-5 w-5" />}
                  {selectedResult.type === 'stock' && <Box className="h-5 w-5" />}
                  {selectedResult.type === 'handover' && <ArrowRightLeft className="h-5 w-5" />}
                  {selectedResult.type === 'movement' && <History className="h-5 w-5" />}
                  {selectedResult.type === 'maintenance' && <Wrench className="h-5 w-5" />}
                  {selectedResult.type === 'damagedLost' && <AlertCircle className="h-5 w-5" />}
                  {selectedResult.type === 'writeoff' && <Trash2 className="h-5 w-5" />}
                  {selectedResult.type === 'audit' && <ClipboardCheck className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 font-moul leading-normal">
                    {selectedResult.type === 'asset' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតទ្រព្យសម្បត្តិ' : 'Asset Details')}
                    {selectedResult.type === 'stock' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតសន្និធិ' : 'Stock Item Details')}
                    {selectedResult.type === 'handover' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតប្រគល់-ទទួល' : 'Handover Record Details')}
                    {selectedResult.type === 'movement' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតចលនាទ្រព្យ' : 'Asset Movement Details')}
                    {selectedResult.type === 'maintenance' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតការជួសជុល' : 'Maintenance Record Details')}
                    {selectedResult.type === 'damagedLost' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតខូចខាត/បាត់បង់' : 'Damaged/Lost Record Details')}
                    {selectedResult.type === 'writeoff' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតស្នើសុំកាត់ចេញ' : 'Write-Off Request Details')}
                    {selectedResult.type === 'audit' && (lang === 'KM' ? 'ព័ត៌មានលម្អិតរាប់សារពើភណ្ឌ' : 'Inventory Audit Details')}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 font-mono">
                    ID / CODE: {selectedResult.data.id || selectedResult.data.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs max-h-[60vh]">
              {selectedResult.type === 'asset' && (() => {
                const asset = selectedResult.data as Asset;
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-normal">{asset.name}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'លេខកូដសម្គាល់' : 'Asset Code'}</span>
                        <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm font-mono">{asset.code}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ប្រភេទ' : 'Category'}</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{getCategoryName(asset.category, lang)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'បរិមាណ' : 'Quantity'}</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{asset.quantity}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'តម្លៃដើម' : 'Cost'}</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{asset.cost.toLocaleString()}៛</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ការិយាល័យ' : 'Location / Office'}</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{getOfficeName(asset.officeId, lang)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'អ្នកទទួលខុសត្រូវ' : 'Responsible Person'}</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{asset.responsiblePerson}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ស្ថានភាព' : 'Status'}</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{asset.status}</p>
                      </div>
                      {asset.isICT && (
                        <>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serial Number</span>
                            <p className="font-mono text-slate-700 dark:text-slate-300">{asset.serialNumber || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IP Address</span>
                            <p className="font-mono text-slate-700 dark:text-slate-300">{asset.ipAddress || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Render Barcode for scanned item! */}
                    <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-start">{lang === 'KM' ? 'ស្លាកបាកូដសម្ភារៈ' : 'Printable Barcode Label'}</span>
                      <Barcode value={asset.code} height={40} showText={true} showDownloadButton={true} className="w-full mt-1 bg-slate-50 border border-slate-100 dark:bg-slate-900/40" />
                    </div>
                  </div>
                );
              })()}

              {selectedResult.type === 'stock' && (() => {
                const stock = selectedResult.data as StockItem;
                const isLow = stock.currentBalance <= stock.minStock;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះសម្ភារៈ' : 'Item Name'}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{stock.name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឯកតា' : 'Unit'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{stock.unit}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កម្រិតសុវត្ថិភាព' : 'Min Stock Alert'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{stock.minStock} {stock.unit}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'សមតុល្យក្នុងស្តុក' : 'Current Balance'}</span>
                      <p className={`font-black text-sm ${isLow ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {stock.currentBalance} {stock.unit}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {selectedResult.type === 'handover' && (() => {
                const handover = selectedResult.data as HandoverRecord;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{handover.assetName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'លេខកូដសម្គាល់' : 'Asset Code'}</span>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{handover.assetCode}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'បុគ្គលិកទទួល' : 'Receiving Staff'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{handover.staffName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កាលបរិច្ឆេទប្រគល់' : 'Handover Date'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{handover.handoverDate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'អ្នកប្រគល់' : 'Giver Name'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{handover.giverName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'អ្នកទទួល' : 'Receiver Name'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{handover.receiverName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ស្ថានភាពទ្រព្យ' : 'Asset Condition'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{handover.status}</p>
                    </div>
                  </div>
                );
              })()}

              {selectedResult.type === 'movement' && (() => {
                const movement = selectedResult.data as MovementRecord;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{movement.assetName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'លេខកូដសម្គាល់' : 'Asset Code'}</span>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{movement.assetCode}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ប្រភេទចលនា' : 'Movement Type'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{movement.type}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ពីការិយាល័យ' : 'From Office'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{getOfficeName(movement.fromOfficeId, lang)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ទៅការិយាល័យ' : 'To Office'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{getOfficeName(movement.toOfficeId, lang)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កាលបរិច្ឆេទផ្ទេរ' : 'Date of Transfer'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{movement.date}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'អ្នកទទួលខុសត្រូវថ្មី' : 'New Responsible Person'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{movement.responsiblePerson}</p>
                    </div>
                  </div>
                );
              })()}

              {selectedResult.type === 'maintenance' && (() => {
                const maint = selectedResult.data as MaintenanceRecord;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{maint.assetName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'លេខកូដសម្គាល់' : 'Asset Code'}</span>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{maint.assetCode}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កាលបរិច្ឆេទជួសជុល' : 'Repair Date'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{maint.repairDate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ប្រភេទជួសជុល' : 'Repair Details'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{maint.repairType}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ថ្លៃជួសជុល' : 'Repair Cost'}</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{maint.cost.toLocaleString()}៛</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'អ្នកផ្តល់សេវា/ហាង' : 'Service Provider'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{maint.provider}</p>
                    </div>
                  </div>
                );
              })()}

              {selectedResult.type === 'damagedLost' && (() => {
                const dl = selectedResult.data as DamagedLostRecord;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{dl.assetName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'លេខកូដសម្គាល់' : 'Asset Code'}</span>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{dl.assetCode}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ប្រភេទកំណត់ត្រា' : 'Record Type'}</span>
                      <p className={`font-bold ${dl.type === 'បាត់បង់' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {dl.type}
                      </p>
                    </div>
                    <div className="space-y-1 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កាលបរិច្ឆេទ' : 'Incident Date'}</span>
                      <p className="font-bold">{dl.date}</p>
                    </div>
                    <div className="space-y-1 col-span-2 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'មូលហេតុ' : 'Reason / Description'}</span>
                      <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">{dl.reason}</p>
                    </div>
                    <div className="space-y-1 col-span-2 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'របាយការណ៍លម្អិត' : 'Investigation Report'}</span>
                      <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">{dl.investigationReport || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 col-span-2 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'សំណើដោះស្រាយ' : 'Proposed Resolution'}</span>
                      <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed font-bold text-indigo-600 dark:text-indigo-400">{dl.proposal}</p>
                    </div>
                  </div>
                );
              })()}

              {selectedResult.type === 'writeoff' && (() => {
                const w = selectedResult.data as WriteOffRecord;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{w.assetName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'លេខកូដសម្គាល់' : 'Asset Code'}</span>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{w.assetCode}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'មូលហេតុការស្នើសុំ' : 'Reason'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{w.reason}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កាលបរិច្ឆេទស្នើសុំ' : 'Request Date'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{w.requestDate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កាលបរិច្ឆេទអនុម័ត' : 'Approved Date'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{w.approvedDate || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ស្ថានភាព' : 'Status'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{w.status}</p>
                    </div>
                    <div className="space-y-1 col-span-2 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កំណត់សម្គាល់បន្ថែម' : 'Notes'}</span>
                      <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">{w.notes || 'N/A'}</p>
                    </div>
                  </div>
                );
              })()}

              {selectedResult.type === 'audit' && (() => {
                const au = selectedResult.data as AnnualAuditRecord;
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{au.assetName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'លេខកូដសម្គាល់' : 'Asset Code'}</span>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{au.assetCode}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ឆ្នាំរាប់បញ្ជី' : 'Audit Year'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{au.year}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'គណៈកម្មការរៀបចំ' : 'Audit Committee'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{au.committee}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'កាលបរិច្ឆេទរាប់' : 'Audit Date'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{au.auditDate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ចំនួនក្នុងបញ្ជី' : 'Registered Qty'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{au.registeredQty}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ចំនួនជាក់ស្តែង' : 'Actual Counted Qty'}</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{au.actualQty}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'ភាពខុសគ្នា (លើស/ខ្វះ)' : 'Discrepancy (Diff)'}</span>
                      <p className={`font-black ${au.diff === 0 ? 'text-slate-700' : au.diff < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {au.diff > 0 ? `+${au.diff}` : au.diff}
                      </p>
                    </div>
                    <div className="space-y-1 col-span-2 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'KM' ? 'អនុសាសន៍គណៈកម្មការ' : 'Audit Recommendations'}</span>
                      <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed italic">{au.recommendations}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/40 flex justify-end">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {lang === 'KM' ? 'បិទចោល' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
