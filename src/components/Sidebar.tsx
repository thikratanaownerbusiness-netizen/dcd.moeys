/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  MapPin, 
  UserCheck, 
  Move, 
  Wrench, 
  AlertCircle, 
  FileX, 
  Package, 
  CalendarCheck, 
  Laptop, 
  Printer,
  Building2,
  FileText,
  LogIn,
  UserPlus,
  LogOut,
  Camera,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Language } from '../data/translations';
import { translations } from '../data/translations';
import { UserAccount } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDocuments: () => void;
  lang: Language;
  currentUser: UserAccount | null;
  onSignOut: () => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  systemLogo: string | null;
  onLogoChange: (logo: string | null) => void;
  logoScale: number;
  setLogoScale: (scale: number) => void;
  logoX: number;
  setLogoX: (x: number) => void;
  logoY: number;
  setLogoY: (y: number) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenDocuments, 
  lang,
  currentUser,
  onSignOut,
  onOpenSignIn,
  onOpenSignUp,
  systemLogo,
  onLogoChange,
  logoScale,
  setLogoScale,
  logoX,
  setLogoX,
  logoY,
  setLogoY
}: SidebarProps) {
  
  const t = translations[lang];
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onLogoChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const menuItems = [
    { id: 'ANALYTICS', label: t.menuDashboard, icon: LayoutDashboard },
    { id: 'ASSETS', label: t.menuAssets, icon: ClipboardList },
    { id: 'OFFICES', label: t.menuOffices, icon: MapPin },
    { id: 'HANDOVERS', label: t.menuHandovers, icon: UserCheck },
    { id: 'MOVEMENTS', label: t.menuMovements, icon: Move },
    { id: 'MAINTENANCE', label: t.menuMaintenance, icon: Wrench },
    { id: 'DAMAGED_LOST', label: t.menuDamagedLost, icon: AlertCircle },
    { id: 'WRITEOFFS', label: t.menuWriteoffs, icon: FileX },
    { id: 'STOCK_ITEMS', label: t.menuStock, icon: Package },
    { id: 'AUDITS', label: t.menuAudits, icon: CalendarCheck },
    { id: 'ICT', label: t.menuIct, icon: Laptop },
    { id: 'DOCUMENTS', label: t.menuDocuments, icon: FileText },
    { id: 'SETTINGS', label: lang === 'KM' ? '១២. ការកំណត់ Admin (Settings)' : '12. Admin Settings', icon: Settings },
  ];

  return (
    <div className="w-80 liquid-glass-sidebar border-r border-slate-800/25 flex flex-col justify-between shrink-0 select-none z-10">
      
      {/* Upper Brand Info */}
      <div className="p-6 border-b border-slate-800/40 space-y-4">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 overflow-hidden cursor-pointer group shrink-0"
            title={lang === 'KM' ? 'ចុចដើម្បីប្តូរឡូហ្គោ' : 'Click to change logo'}
          >
            {systemLogo ? (
              <img 
                src={systemLogo} 
                alt="Logo" 
                style={{
                  transform: `scale(${logoScale / 100}) translate(${logoX}px, ${logoY}px)`,
                  transformOrigin: 'center center',
                }}
                className="h-full w-full object-cover" 
              />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload}
              className="hidden" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-sm tracking-wide truncate">{t.appName}</h2>
              {systemLogo && (
                <button 
                  onClick={handleResetLogo}
                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                  title={lang === 'KM' ? 'ប្រើឡូហ្គោដើមឡើងវិញ' : 'Reset to default logo'}
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">{t.deptName}</p>
          </div>
        </div>

        {currentUser ? (
          <div className="bg-slate-950/40 backdrop-blur-md p-3 rounded-xl border border-white/5 space-y-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{lang === 'KM' ? 'គណនីមន្ត្រីគ្រប់គ្រង' : 'Officer Account'}</p>
            <div>
              <p className="text-white font-bold text-xs">{currentUser.fullName}</p>
              <p className="text-slate-400 text-[10px] truncate">{currentUser.email}</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-blue-500/20">
                {currentUser.role}
              </span>
              <button
                onClick={onSignOut}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-all cursor-pointer"
                title="ចាកចេញពីប្រព័ន្ធ"
              >
                <LogOut className="h-3 w-3" />
                <span>{lang === 'KM' ? 'ចាកចេញ' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 backdrop-blur-md p-3 rounded-xl border border-white/5 space-y-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{lang === 'KM' ? 'គណនីមន្ត្រីគ្រប់គ្រង' : 'Officer Account'}</p>
            <p className="text-slate-400 font-bold text-xs italic">{lang === 'KM' ? 'មិនទាន់ចូលគណនី' : 'Not Logged In'}</p>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
              <button
                onClick={onOpenSignIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] py-1.5 px-1.5 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <LogIn className="h-3 w-3" />
                <span>{lang === 'KM' ? 'Sign In' : 'Sign In'}</span>
              </button>
              <button
                onClick={onOpenSignUp}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] py-1.5 px-1.5 rounded flex items-center justify-center gap-1 transition-all border border-slate-700 cursor-pointer"
              >
                <UserPlus className="h-3 w-3" />
                <span>{lang === 'KM' ? 'Sign Up' : 'Sign Up'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 py-6">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 mb-3">{t.ledgerSectionLabel}</p>
        
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all border-l-3 ${
                isActive 
                  ? 'bg-blue-600/20 text-white border-blue-500 shadow-sm backdrop-blur-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-transparent'
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lower Forms/Documents Generator Panel */}
      <div className="p-4 border-t border-slate-800/40">
        <button
          onClick={onOpenDocuments}
          className="w-full bg-slate-900/40 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-500/30 text-white border border-slate-800/80 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
        >
          <Printer className="h-4.5 w-4.5" />
          {t.printFormsBtn}
        </button>
      </div>

    </div>
  );
}
