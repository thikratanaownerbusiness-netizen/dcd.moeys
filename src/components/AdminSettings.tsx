import React, { useState, useRef } from 'react';
import { 
  Shield, 
  Upload, 
  Download, 
  FileJson, 
  Users, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Sliders,
  FileText,
  UserCheck,
  RefreshCw,
  FolderOpen,
  Building2,
  Camera,
  Trash2,
  Smartphone,
  QrCode
} from 'lucide-react';
import { UserAccount, DocumentFile, Asset } from '../types';
import QRCodeComponent from './QRCode';

interface RolePermission {
  role: string;
  create: boolean;
  edit: boolean;
  delete: boolean;
  importExport: boolean;
  adminSettings: boolean;
}

interface AdminSettingsProps {
  lang: 'KM' | 'EN';
  currentUser: UserAccount | null;
  registeredUsers: UserAccount[];
  setRegisteredUsers: (users: UserAccount[]) => void;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  handovers: any[];
  setHandovers: (handovers: any[]) => void;
  movements: any[];
  setMovements: (movements: any[]) => void;
  damagedLost: any[];
  setDamagedLost: (damagedLost: any[]) => void;
  maintenance: any[];
  setMaintenance: (maintenance: any[]) => void;
  writeoffs: any[];
  setWriteoffs: (writeoffs: any[]) => void;
  stockItems: any[];
  setStockItems: (stockItems: any[]) => void;
  stockTransactions: any[];
  setStockTransactions: (transactions: any[]) => void;
  audits: any[];
  setAudits: (audits: any[]) => void;
  documents: DocumentFile[];
  setDocuments: (docs: DocumentFile[]) => void;
  systemLogo: string | null;
  onLogoChange: (logo: string | null) => void;
  logoScale: number;
  setLogoScale: (scale: number) => void;
  logoX: number;
  setLogoX: (x: number) => void;
  logoY: number;
  setLogoY: (y: number) => void;
}

export default function AdminSettings({
  lang,
  currentUser,
  registeredUsers,
  setRegisteredUsers,
  assets,
  setAssets,
  handovers,
  setHandovers,
  movements,
  setMovements,
  damagedLost,
  setDamagedLost,
  maintenance,
  setMaintenance,
  writeoffs,
  setWriteoffs,
  stockItems,
  setStockItems,
  stockTransactions,
  setStockTransactions,
  audits,
  setAudits,
  documents,
  setDocuments,
  systemLogo,
  onLogoChange,
  logoScale,
  setLogoScale,
  logoX,
  setLogoX,
  logoY,
  setLogoY
}: AdminSettingsProps) {
  const isKhmer = lang === 'KM';

  // State for sub-tabs
  const [subTab, setSubTab] = useState<'ROLES' | 'UPLOAD' | 'IMPORT_EXPORT' | 'LOGO' | 'MOBILE'>('ROLES');

  // Export format selection
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'backup' | 'bin'>('backup');

  // Role permissions state
  const [permissions, setPermissions] = useState<RolePermission[]>(() => {
    const saved = localStorage.getItem('DCD_ROLE_PERMISSIONS');
    if (saved) return JSON.parse(saved);
    return [
      {
        role: 'មន្ត្រីជាន់ខ្ពស់',
        create: true,
        edit: true,
        delete: true,
        importExport: true,
        adminSettings: true
      },
      {
        role: 'មន្ត្រីគ្រប់គ្រង',
        create: true,
        edit: true,
        delete: false,
        importExport: true,
        adminSettings: false
      },
      {
        role: 'មន្ត្រីព័ត៌មានវិទ្យា',
        create: true,
        edit: true,
        delete: false,
        importExport: true,
        adminSettings: false
      }
    ];
  });

  // Save permissions
  const savePermissions = (newPermissions: RolePermission[]) => {
    setPermissions(newPermissions);
    localStorage.setItem('DCD_ROLE_PERMISSIONS', JSON.stringify(newPermissions));
    setSuccessMsg(isKhmer ? 'បានរក្សាទុកសិទ្ធិប្រើប្រាស់ដោយជោគជ័យ!' : 'Permissions updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // State for alert/notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // File upload state (Local file manager)
  const [dragActive, setDragActive] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('វិក្កយបត្រ');
  const [uploadDesc, setUploadDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File import state
  const importInputRef = useRef<HTMLInputElement>(null);

  // Logo settings upload state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoDragOver, setLogoDragOver] = useState(false);

  const handleLogoUploadInSettings = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onLogoChange(reader.result);
        setSuccessMsg(isKhmer ? 'បានផ្លាស់ប្ដូរឡូហ្គោជោគជ័យ!' : 'Logo updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  };

  // Process uploaded document file
  const handleUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = typeof reader.result === 'string' ? reader.result : undefined;
      const newDoc: DocumentFile = {
        id: `DOC_${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toISOString().split('T')[0],
        category: uploadCategory,
        description: uploadDesc || (isKhmer ? 'រក្សាទុកតាមរយៈការកំណត់ Admin' : 'Uploaded via Admin Settings'),
        fileData: base64Data
      };

      setDocuments([newDoc, ...documents]);
      setUploadDesc('');
      setSuccessMsg(isKhmer ? `បានបង្ហោះឯកសារ "${file.name}" ដោយជោគជ័យ!` : `File "${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);

      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Export database to JSON file
  const handleExportData = () => {
    try {
      const backupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        assets,
        handovers,
        movements,
        damagedLost,
        maintenance,
        writeoffs,
        stockItems,
        stockTransactions,
        audits,
        documents,
        registeredUsers,
        permissions, // Preserve all user permission configurations
        systemLogo,  // Preserve system emblem
        logoScale,
        logoX,
        logoY
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("download", `dcd_inventory_backup_${dateStr}.${exportFormat}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSuccessMsg(isKhmer 
        ? `បានទាញចេញឯកសារទិន្នន័យ (Backup .${exportFormat.toUpperCase()}) ដោយជោគជ័យ!` 
        : `Database backup .${exportFormat.toUpperCase()} exported successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(isKhmer ? 'មានបញ្ហាក្នុងការទាញចេញទិន្នន័យ!' : 'Failed to export backup data!');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Import database from All Types of Files
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const json = JSON.parse(fileContent);
        
        // Simple validation checks to verify it is our backup
        if (!json.assets || !json.stockItems || !json.registeredUsers) {
          throw new Error('Invalid DCD Inventory backup file format.');
        }

        // Apply imported states
        if (json.assets) {
          setAssets(json.assets);
          localStorage.setItem('DCD_ASSETS', JSON.stringify(json.assets));
        }
        if (json.handovers) {
          setHandovers(json.handovers);
          localStorage.setItem('DCD_HANDOVERS', JSON.stringify(json.handovers));
        }
        if (json.movements) {
          setMovements(json.movements);
          localStorage.setItem('DCD_MOVEMENTS', JSON.stringify(json.movements));
        }
        if (json.damagedLost) {
          setDamagedLost(json.damagedLost);
          localStorage.setItem('DCD_DAMAGED_LOST', JSON.stringify(json.damagedLost));
        }
        if (json.maintenance) {
          setMaintenance(json.maintenance);
          localStorage.setItem('DCD_MAINTENANCE', JSON.stringify(json.maintenance));
        }
        if (json.writeoffs) {
          setWriteoffs(json.writeoffs);
          localStorage.setItem('DCD_WRITEOFFS', JSON.stringify(json.writeoffs));
        }
        if (json.stockItems) {
          setStockItems(json.stockItems);
          localStorage.setItem('DCD_STOCK_ITEMS', JSON.stringify(json.stockItems));
        }
        if (json.stockTransactions) {
          setStockTransactions(json.stockTransactions);
          localStorage.setItem('DCD_STOCK_TRANSACTIONS', JSON.stringify(json.stockTransactions));
        }
        if (json.audits) {
          setAudits(json.audits);
          localStorage.setItem('DCD_AUDITS', JSON.stringify(json.audits));
        }
        if (json.documents) {
          setDocuments(json.documents);
          localStorage.setItem('DCD_DOCUMENTS', JSON.stringify(json.documents));
        }
        if (json.registeredUsers) {
          setRegisteredUsers(json.registeredUsers);
          localStorage.setItem('DCD_REGISTERED_USERS', JSON.stringify(json.registeredUsers));
        }
        
        // Restore custom system permissions if present to support all users perfectly
        if (json.permissions) {
          setPermissions(json.permissions);
          localStorage.setItem('DCD_ROLE_PERMISSIONS', JSON.stringify(json.permissions));
        }
        
        // Restore logo configs if present
        if (json.systemLogo) {
          onLogoChange(json.systemLogo);
          localStorage.setItem('DCD_SYSTEM_LOGO', json.systemLogo);
        }
        if (typeof json.logoScale === 'number') {
          setLogoScale(json.logoScale);
        }
        if (typeof json.logoX === 'number') {
          setLogoX(json.logoX);
        }
        if (typeof json.logoY === 'number') {
          setLogoY(json.logoY);
        }

        setSuccessMsg(isKhmer ? 'បានទាញចូល និងបញ្ចូលរាល់ទិន្នន័យ-ការកំណត់ទាំងអស់ដោយជោគជ័យ!' : 'All database tables & user configurations restored successfully!');
        setErrorMsg('');
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err) {
        setErrorMsg(isKhmer 
          ? 'ទម្រង់ឯកសារមិនត្រឹមត្រូវ! សូមប្រើប្រាស់តែឯកសារ backup (.json, .txt, .backup, .bin) ដែលទាញចេញពីប្រព័ន្ធនេះប៉ុណ្ណោះ។' 
          : 'Invalid backup format! Please use a valid backup file (.json, .txt, .backup, .bin) exported from this system.');
        setTimeout(() => setErrorMsg(''), 6000);
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  // Toggle single permission switch
  const handleTogglePermission = (roleName: string, field: keyof Omit<RolePermission, 'role'>) => {
    const updated = permissions.map(p => {
      if (p.role === roleName) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    });
    savePermissions(updated);
  };

  // Update user role
  const handleUserRoleChange = (userId: string, newRole: string) => {
    const updated = registeredUsers.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    });
    setRegisteredUsers(updated);
    localStorage.setItem('DCD_REGISTERED_USERS', JSON.stringify(updated));
    setSuccessMsg(isKhmer ? 'បានធ្វើបច្ចុប្បន្នភាពតួនាទីអ្នកប្រើប្រាស់ជោគជ័យ!' : 'User role updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Delete user account
  const handleDeleteUser = (userId: string) => {
    if (currentUser && userId === currentUser.id) {
      setErrorMsg(isKhmer ? 'អ្នកមិនអាចលុបគណនីផ្ទាល់ខ្លួនរបស់អ្នកបានទេ!' : 'You cannot delete your own account!');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (userId === 'USER_DEFAULT') {
      setErrorMsg(isKhmer ? 'មិនអាចលុបគណនីរដ្ឋបាលលំនាំដើមបានឡើយ!' : 'Cannot delete the default administrator account!');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (window.confirm(isKhmer ? 'តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ?' : 'Are you sure you want to delete this account?')) {
      const updated = registeredUsers.filter(user => user.id !== userId);
      setRegisteredUsers(updated);
      localStorage.setItem('DCD_REGISTERED_USERS', JSON.stringify(updated));
      setSuccessMsg(isKhmer ? 'បានលុបគណនីអ្នកប្រើប្រាស់ជោគជ័យ!' : 'User account deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រង និងកំណត់រចនាសម្ព័ន្ធ Admin' : 'Admin Control & Configuration Settings'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isKhmer 
              ? 'គ្រប់គ្រងសិទ្ធិប្រើប្រាស់ បង្ហោះរាល់ប្រភេទឯកសារ និងនាំចេញ/នាំចូលទិន្នន័យប្រព័ន្ធទូទៅ' 
              : 'Configure roles, upload official assets documents, and perform full system database backup imports/exports.'}
          </p>
        </div>

        {/* Info label */}
        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30 text-xs">
          <Info className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            {isKhmer 
              ? `គណនីបច្ចុប្បន្ន៖ ${currentUser?.fullName || 'ភ្ញៀវ'} (${currentUser?.role || 'គ្មានតួនាទី'})` 
              : `Current User: ${currentUser?.fullName || 'Guest'} (${currentUser?.role || 'No Role'})`}
          </span>
        </div>
      </div>

      {/* Alert Banner Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-xs font-semibold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Sub Tabs Toggle */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubTab('ROLES')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'ROLES'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          {isKhmer ? '១. សិទ្ធិ និងគណនីអ្នកប្រើប្រាស់' : '1. Users & Role Permissions'}
        </button>
        <button
          onClick={() => setSubTab('UPLOAD')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'UPLOAD'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Upload className="h-4 w-4" />
          {isKhmer ? '២. បង្ហោះ និងគ្រប់គ្រងឯកសារ' : '2. File Upload & Docs'}
        </button>
        <button
          onClick={() => setSubTab('IMPORT_EXPORT')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'IMPORT_EXPORT'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileJson className="h-4 w-4" />
          {isKhmer ? '៣. នាំចូល/នាំចេញទិន្នន័យ (Import/Export)' : '3. Backup Import & Export'}
        </button>
        <button
          onClick={() => setSubTab('LOGO')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'LOGO'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          {isKhmer ? '៤. ការកំណត់ឡូហ្គោប្រព័ន្ធ (Logo Settings)' : '4. System Logo Settings'}
        </button>
        <button
          onClick={() => setSubTab('MOBILE')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            subTab === 'MOBILE'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          {isKhmer ? '៥. បើកលើទូរស័ព្ទដៃ (Mobile QR)' : '5. Open on Mobile (QR)'}
        </button>
      </div>

      {/* SUB-TAB 1: ROLE PERMISSIONS & REGISTERED USERS */}
      {subTab === 'ROLES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Permission Matrix card */}
          <div className="lg:col-span-7 liquid-glass rounded-2xl p-6 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-blue-600" />
                {isKhmer ? 'កំណត់សិទ្ធិប្រើប្រាស់ទៅតាមតួនាទី (Role Permissions)' : 'Configure Role Feature Permissions'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isKhmer 
                  ? 'អ្នកអាចកំណត់ថាតើតួនាទីនីមួយៗអាចធ្វើអ្វីបានខ្លះនៅក្នុងប្រព័ន្ធគ្រប់គ្រងនេះ។' 
                  : 'Toggle functional access permissions allowed for each specific system role.'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <th className="p-3">{isKhmer ? 'តួនាទី (Role)' : 'Role'}</th>
                    <th className="p-3 text-center">{isKhmer ? 'បង្កើត' : 'Create'}</th>
                    <th className="p-3 text-center">{isKhmer ? 'កែសម្រួល' : 'Edit'}</th>
                    <th className="p-3 text-center">{isKhmer ? 'លុប' : 'Delete'}</th>
                    <th className="p-3 text-center">{isKhmer ? 'នាំចូល/នាំចេញ' : 'Imp/Exp'}</th>
                    <th className="p-3 text-center">{isKhmer ? 'ការកំណត់ Admin' : 'Admin'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
                  {permissions.map((p) => (
                    <tr key={p.role} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-bold">{p.role}</td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={p.create} 
                          onChange={() => handleTogglePermission(p.role, 'create')}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={p.edit} 
                          onChange={() => handleTogglePermission(p.role, 'edit')}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={p.delete} 
                          disabled={p.role === 'មន្ត្រីជាន់ខ្ពស់'} // Admin always has delete
                          onChange={() => handleTogglePermission(p.role, 'delete')}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={p.importExport} 
                          onChange={() => handleTogglePermission(p.role, 'importExport')}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={p.adminSettings} 
                          disabled={p.role === 'មន្ត្រីជាន់ខ្ពស់'} // Admin always has admin settings
                          onChange={() => handleTogglePermission(p.role, 'adminSettings')}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-500 leading-normal border border-slate-100 dark:border-slate-800">
              <Key className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>{isKhmer ? 'ចំណាំ៖' : 'Note:'}</strong> {isKhmer 
                  ? 'តួនាទី "មន្ត្រីជាន់ខ្ពស់" ជាអ្នកគ្រប់គ្រងកំពូល (Super Admin) ដែលមានសិទ្ធិលុបព័ត៌មាន និងចូលប្រើប្រាស់ផ្នែកកែសម្រួល Admin ជានិច្ច មិនអាចបិទបានឡើយ។' 
                  : 'The "Senior Officer" role acts as the Super Admin and always has full system deleting & configuration permissions enabled.'}
              </span>
            </div>
          </div>

          {/* User list management card */}
          <div className="lg:col-span-5 liquid-glass rounded-2xl p-6 space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-blue-600" />
                {isKhmer ? 'បញ្ជីគណនីមន្ត្រី និងការកែប្រែតួនាទី' : 'Officer Accounts & Role Assignment'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isKhmer 
                  ? 'ផ្លាស់ប្តូរតួនាទីប្រើប្រាស់របស់មន្ត្រីម្នាក់ៗបានដោយសេរី។' 
                  : 'Manage active officer profiles and dynamically assign user authorization levels.'}
              </p>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {registeredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl space-y-2.5 transition-all hover:border-slate-200 dark:hover:border-slate-700/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded">
                        {user.officeId === 'OFF_ADMIN' ? 'រដ្ឋបាល' : user.officeId}
                      </span>
                      {user.id !== 'USER_DEFAULT' && (!currentUser || user.id !== currentUser.id) && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title={isKhmer ? 'លុបគណនី' : 'Delete Account'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/45">
                    <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                      {isKhmer ? 'តួនាទី៖' : 'Assign Role:'}
                    </span>
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold rounded px-1.5 py-1 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="មន្ត្រីជាន់ខ្ពស់">{isKhmer ? 'មន្ត្រីជាន់ខ្ពស់' : 'Senior Officer'}</option>
                      <option value="មន្ត្រីគ្រប់គ្រង">{isKhmer ? 'មន្ត្រីគ្រប់គ្រង' : 'Manager / Handler'}</option>
                      <option value="មន្ត្រីព័ត៌មានវិទ្យា">{isKhmer ? 'មន្ត្រីព័ត៌មានវិទ្យា' : 'IT Officer'}</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: FILE UPLOAD MANAGER */}
      {subTab === 'UPLOAD' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* File Upload Zone */}
          <div className="lg:col-span-5 liquid-glass rounded-2xl p-6 space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Upload className="h-4.5 w-4.5 text-blue-600" />
                {isKhmer ? 'បង្ហោះរាល់ប្រភេទឯកសារថ្មី' : 'Upload Any File to System'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isKhmer 
                  ? 'អ្នកអាចបញ្ចូលឯកសារយោង វិក្កយបត្រ ឬឯកសារចាត់ចែងផ្សេងៗចូលក្នុងប្រព័ន្ធ។' 
                  : 'Upload reference invoices, spreadsheets, or office templates to our central ledger.'}
              </p>
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase">{isKhmer ? 'ប្រភេទចាត់ថ្នាក់ឯកសារ៖' : 'Document Category:'}</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded p-2 text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="វិក្កយបត្រ">{isKhmer ? 'វិក្កយបត្រ / Invoice' : 'Invoices & Receipts'}</option>
                <option value="លិខិតផ្លូវការ">{isKhmer ? 'លិខិតផ្លូវការ / Official Letter' : 'Official Letters'}</option>
                <option value="ឯកសារចេញ">{isKhmer ? 'ឯកសារចេញ / Outgoing Document' : 'Outgoing Documents'}</option>
                <option value="របាយការណ៍">{isKhmer ? 'របាយការណ៍ / Report' : 'Activity Reports'}</option>
                <option value="ផ្សេងៗ">{isKhmer ? 'ផ្សេងៗ / Others' : 'Other Assets Files'}</option>
              </select>
            </div>

            {/* Description Input */}
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase">{isKhmer ? 'បរិយាយសង្ខេប៖' : 'Short Description:'}</label>
              <input 
                type="text" 
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder={isKhmer ? 'ឧ. វិក្កយបត្រទិញម៉ាស៊ីនកុំព្យូទ័រយួរដៃ Acer...' : 'e.g. Purchase invoice for laptops...'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded p-2 text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Drag & Drop zone */}
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-850/30'
              }`}
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {isKhmer ? 'អូសទាញឯកសារមកទីនេះ ឬ ចុចដើម្បីជ្រើសរើស' : 'Drag & drop your file here, or click to browse'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isKhmer ? 'គាំទ្រ PDF, Excel, Word, និងប្រភេទរូបភាពផ្សេងៗ' : 'Supports PDF, Word, Excel, images, or raw binary.'}
                </p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileSelect}
                className="hidden" 
              />
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="lg:col-span-7 liquid-glass rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FolderOpen className="h-4.5 w-4.5 text-blue-600" />
                  {isKhmer ? 'បញ្ជីឯកសារទើបបង្ហោះក្នុងប្រព័ន្ធ' : 'Recently Uploaded Ledger Files'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isKhmer ? 'បញ្ជីរាយនាមឯកសារយោងទាំងអស់នៅក្នុងប្រព័ន្ធ។' : 'Review and access active document attachments registered in the ledger.'}
                </p>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold text-slate-600 dark:text-slate-400">
                {documents.length} {isKhmer ? 'ឯកសារ' : 'Files'}
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <FileText className="h-10 w-10 mx-auto opacity-30 text-slate-500" />
                <p className="text-xs">{isKhmer ? 'មិនមានឯកសារបង្ហោះឡើងទេ!' : 'No custom documents found.'}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={doc.name}>
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded text-[9px] font-bold">
                            {doc.category}
                          </span>
                          <span>•</span>
                          <span>{(doc.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>{doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    {doc.fileData && (
                      <a 
                        href={doc.fileData} 
                        download={doc.name}
                        className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/30 font-bold px-2.5 py-1.5 rounded transition-all shrink-0 shadow-sm"
                      >
                        {isKhmer ? 'ទាញយក' : 'Download'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: DATABASE BACKUP IMPORT & EXPORT */}
      {subTab === 'IMPORT_EXPORT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Export card */}
          <div className="liquid-glass rounded-2xl p-6 flex flex-col justify-between space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {isKhmer ? 'ទាញចេញទិន្នន័យប្រព័ន្ធទាំងអស់ (Export Database Backup)' : 'Export Full Database Backup'}
                  </h3>
                  <p className="text-[11px] text-blue-500 font-bold">
                    {isKhmer ? '✓ គាំទ្រគណនីបុគ្គលិក និងសិទ្ធិទាំងអស់' : '✓ Supports all users, roles & settings'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-1 leading-normal">
                {isKhmer 
                  ? 'ទាញចេញទិន្នន័យទាំងអស់ពីប្រព័ន្ធ (បញ្ជីទ្រព្យសម្បត្តិ ស្តុកទំនិញ ឯកសារ បុគ្គលិក គណនីមន្ត្រី សិទ្ធិប្រើប្រាស់ និងឡូហ្គោប្រព័ន្ធ) ទៅជាឯកសារ backup គ្រប់ប្រភេទ ដើម្បីរក្សាទុក ឬផ្ទេរទិន្នន័យ។' 
                  : 'Download a complete system database backup containing all tables, registered user profiles, custom permissions, and system logo offsets.'}
              </p>

              {/* Format Selection Dropdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100/10 dark:border-white/5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isKhmer ? 'ជ្រើសរើសប្រភេទឯកសារទាញចេញ (Select File Type):' : 'Select Export File Type:'}
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full bg-slate-100/40 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="backup" className="bg-white dark:bg-slate-900">{isKhmer ? 'ឯកសារប្រព័ន្ធគ្រប់ប្រភេទ (.backup)' : 'System Backup File (.backup)'}</option>
                  <option value="txt" className="bg-white dark:bg-slate-900">{isKhmer ? 'ឯកសារអត្ថបទ (.txt)' : 'Plain Text Document (.txt)'}</option>
                  <option value="json" className="bg-white dark:bg-slate-900">{isKhmer ? 'ឯកសារទិន្នន័យ JSON (.json)' : 'JSON Metadata Document (.json)'}</option>
                  <option value="bin" className="bg-white dark:bg-slate-900">{isKhmer ? 'ឯកសារទិន្នន័យគោល (.bin)' : 'Binary Raw Data (.bin)'}</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleExportData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="h-4.5 w-4.5" />
                {isKhmer 
                  ? `ទាញចេញជាឯកសារប្រភេទ .${exportFormat.toUpperCase()}` 
                  : `Export as .${exportFormat.toUpperCase()} (All Types File)`}
              </button>
            </div>
          </div>

          {/* Import card */}
          <div className="liquid-glass rounded-2xl p-6 flex flex-col justify-between space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {isKhmer ? 'បញ្ចូល/ទាញចូលឯកសារទិន្នន័យចាស់ (Import Database Backup)' : 'Import Full Database Backup'}
                  </h3>
                  <p className="text-[11px] text-amber-500 font-bold">
                    {isKhmer ? '✓ គាំទ្រគ្រប់ប្រភេទឯកសារ (All Types File)' : '✓ Supports all backup file extensions'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-1 leading-normal">
                {isKhmer 
                  ? 'ជ្រើសរើសឯកសារទិន្នន័យ backup គ្រប់ប្រភេទ (.backup, .txt, .json, .bin) ដែលអ្នកបានទាញចេញពីមុន ដើម្បីបញ្ចូលមកក្នុងប្រព័ន្ធវិញ។ ប្រព័ន្ធនឹងធ្វើបច្ចុប្បន្នភាពគណនី សិទ្ធិ និងទិន្នន័យទាំងអស់ភ្លាមៗ។' 
                  : 'Select any exported system backup file format to instantly restore all database tables, system logo preferences, and registered user accounts.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <input 
                ref={importInputRef}
                type="file" 
                accept="*/*"
                onChange={handleImportData}
                className="hidden" 
              />
              <button
                onClick={() => importInputRef.current?.click()}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="h-4.5 w-4.5 text-slate-300" />
                {isKhmer ? 'ជ្រើសរើសឯកសារទាញចូលគ្រប់ប្រភេទ (All Files)' : 'Browse & Import All Types File'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: SYSTEM LOGO CUSTOMIZATION */}
      {subTab === 'LOGO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Logo Customizer Controls */}
          <div className="lg:col-span-7 liquid-glass rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-blue-600" />
                {isKhmer ? 'ផ្ទាំង ពង្រីក/បង្រួម & ប្ដូរទីតាំងឡូហ្គោ' : 'Logo Scale & Position Controls'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isKhmer 
                  ? 'អ្នកអាចកំណត់ទំហំ ក៏ដូចជាកែសម្រួលគម្លាតរបស់ឡូហ្គោប្រព័ន្ធ ដើម្បីឲ្យត្រូវគ្នានិងរចនាបថទូទៅ' 
                  : 'Adjust the sizing, scale, and placement offsets of the system emblem to achieve the perfect design alignment.'}
              </p>
            </div>

            {/* Upload & Logo Preview Controls */}
            <div className="space-y-5">
              
              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
                onDragLeave={() => setLogoDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setLogoDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLogoUploadInSettings(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => logoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  logoDragOver 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-500/5'
                }`}
              >
                <input 
                  ref={logoInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoUploadInSettings(e.target.files[0]);
                    }
                  }}
                  className="hidden" 
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isKhmer ? 'អូស និងទម្លាក់រូបភាពឡូហ្គោ ឬចុចដើម្បីជ្រើសរើស' : 'Drag & drop logo image, or click to browse'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isKhmer ? 'គាំទ្រឯកសាររូបភាព PNG, JPG, GIF, SVG' : 'Supports PNG, JPG, GIF, SVG formats'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Slider Settings */}
              <div className="space-y-4 pt-2">
                
                {/* Scale/Zoom */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">{isKhmer ? 'ពង្រីក/បង្រួម (Scale):' : 'Zoom Scale:'}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">{logoScale}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="300" 
                    step="5"
                    value={logoScale} 
                    onChange={(e) => setLogoScale(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* X Offset */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">{isKhmer ? 'ឆ្វេង-ស្ដាំ (X Offset):' : 'X-Offset:'}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">{logoX}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-50" 
                      max="50" 
                      step="1"
                      value={logoX} 
                      onChange={(e) => setLogoX(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Y Offset */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">{isKhmer ? 'លើ-ក្រោម (Y Offset):' : 'Y-Offset:'}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">{logoY}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-50" 
                      max="50" 
                      step="1"
                      value={logoY} 
                      onChange={(e) => setLogoY(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                </div>

                {/* Reset & Quick Presets */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <button 
                    onClick={() => {
                      setLogoScale(100);
                      setLogoX(0);
                      setLogoY(0);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-bold flex items-center gap-1 bg-transparent border-0 cursor-pointer animate-fade-in"
                  >
                    <RefreshCw className="h-4 w-4 animate-spin-hover" />
                    <span>{isKhmer ? 'កំណត់ឡើងវិញលំនាំដើម' : 'Reset to Default Alignment'}</span>
                  </button>

                  {systemLogo && (
                    <button 
                      onClick={() => {
                        onLogoChange(null);
                        setLogoScale(100);
                        setLogoX(0);
                        setLogoY(0);
                        setSuccessMsg(isKhmer ? 'បានលុបឡូហ្គោ និងកំណត់ឡូហ្គោដើមវិញជោគជ័យ!' : 'Emblem reset to default successfully!');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-500 dark:text-rose-450 dark:hover:text-rose-400 font-bold flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                    >
                      {isKhmer ? 'លុបឡូហ្គោបច្ចុប្បន្ន' : 'Delete Custom Logo'}
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Logo Live Preview Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Live Preview Card */}
            <div className="liquid-glass rounded-2xl p-6 flex flex-col h-full justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Building2 className="h-4.5 w-4.5 text-blue-600" />
                  {isKhmer ? 'ការបង្ហាញរូបរាងផ្ទាល់ (Live Preview)' : 'Live UI Alignment Preview'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isKhmer 
                    ? 'រូបរាងរបស់ឡូហ្គោនៅក្នុងរបារ Sidebar និង Header របស់កម្មវិធី៖' 
                    : 'See how the customized system logo scales and aligns in real-time in the sidebar area:'}
                </p>
              </div>

              {/* Mock Sidebar Header Box */}
              <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 space-y-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 overflow-hidden">
                    {systemLogo ? (
                      <img 
                        src={systemLogo} 
                        alt="Logo" 
                        style={{
                          transform: `scale(${logoScale / 100}) translate(${logoX}px, ${logoY}px)`,
                          transformOrigin: 'center center',
                        }}
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Building2 className="h-5.5 w-5.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-bold text-xs tracking-wide truncate">
                      {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងសម្បត្តិរដ្ឋ' : 'DCD-Asset Management'}
                    </h2>
                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">
                      {isKhmer ? 'នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា' : 'Dept of Curriculum Development'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Tips */}
              <div className="bg-slate-500/5 border border-slate-200/10 dark:border-white/5 rounded-xl p-4 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
                <p className="font-bold text-slate-600 dark:text-slate-300">💡 {isKhmer ? 'គន្លឹះរចនា៖' : 'Design Tips:'}</p>
                <p>{isKhmer ? '• បើឡូហ្គោមានផ្ទៃក្រោយមិនថ្លា (Transparent) គួរប្រើ sliders ដើម្បីតម្រឹមឲ្យស្អាត' : '• If the logo is not perfectly cropped, use the scale & offset values to align it within the circular view.'}</p>
                <p>{isKhmer ? '• រាល់ការផ្លាស់ប្តូរ និងរក្សាទុកដោយស្វ័យប្រវត្តទៅកាន់ Local Storage' : '• All configuration metrics are stored and persisted securely in your local environment state.'}</p>
              </div>

            </div>

          </div>

        </div>
      )}

      {subTab === 'MOBILE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Instructions and Steps */}
          <div className="liquid-glass rounded-2xl p-6 space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Smartphone className="h-4.5 w-4.5 text-blue-600" />
                {isKhmer ? 'ការណែនាំអំពីការប្រើប្រាស់លើទូរស័ព្ទដៃ' : 'Mobile Access & Usage Instructions'}
              </h3>
              <p className="text-xs text-slate-400">
                {isKhmer 
                  ? 'អ្នកអាចប្រើទូរស័ព្ទដៃរបស់អ្នកដើម្បីស្កែនបាកូដសម្ភារៈក្នុងប្រព័ន្ធយ៉ាងលឿន និងងាយស្រួល។' 
                  : 'Open the tracking app on your phone to scan physical barcodes using your built-in camera.'}
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/40">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {isKhmer ? 'ស្កែនកូដ QR ដើម្បីបើកគេហទំព័រ' : 'Scan the QR Code to Open'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isKhmer 
                      ? 'ប្រើប្រាស់កម្មវិធីកាមេរ៉ារបស់ទូរស័ព្ទ (ឬកម្មវិធី QR Scanner) ដើម្បីស្កែនរូបភាពកូដ QR នៅខាងស្តាំដៃនេះ។' 
                      : 'Use your smartphone camera or any QR scanner app to scan the generated QR code on the right.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {isKhmer ? 'ចូលគណនីរបស់អ្នក' : 'Log In With Your Account'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isKhmer 
                      ? 'វាយបញ្ចូលអ៊ីមែល និងលេខសម្ងាត់របស់មន្ត្រីគ្រប់គ្រងដើម្បីចូលទៅកាន់ប្រព័ន្ធ។' 
                      : 'Sign in using your register credentials to access all asset tracking and barcode operations.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {isKhmer ? 'ស្កែនបាកូដសម្ភារៈ' : 'Scan Physical Barcodes'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isKhmer 
                      ? 'ជ្រើសរើស "ស្កែនបាកូដ" លើម៉ឺនុយចំហៀងទូរស័ព្ទដើម្បីប្រើប្រាស់កាមេរ៉ាក្នុងការស្កែនស្វែងរកព័ត៌មានទ្រព្យសម្បត្តិដោយស្វ័យប្រវត្ត!' 
                      : 'Tap the scanning action inside the responsive mobile layout to scan physical asset labels on the go.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3.5 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed space-y-1.5">
              <p className="font-bold">⚠️ {isKhmer ? 'តម្រូវការបណ្តាញ៖' : 'Network Requirements:'}</p>
              <p>
                {isKhmer 
                  ? 'សូមប្រាកដថាទូរស័ព្ទ និងកុំព្យូទ័ររបស់អ្នកមានការភ្ជាប់អ៊ីនធឺណិត ដើម្បីអាចទាក់ទង និងផ្លាស់ប្តូរទិន្នន័យបានត្រឹមត្រូវ។' 
                  : 'Ensure both your browser and your mobile phone have active internet access to view synchronizations in real time.'}
              </p>
            </div>
          </div>

          {/* QR Code and Sharing Widget */}
          <div className="liquid-glass rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {isKhmer ? 'កូដ QR សម្រាប់ចែករំលែក' : 'Shareable App QR Code'}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {isKhmer ? 'ស្កែនដើម្បីបើកប្រព័ន្ធលើទូរស័ព្ទ' : 'Scan to launch this website'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center py-2">
                <QRCodeComponent 
                  value={window.location.origin + window.location.pathname} 
                  size={180} 
                  showDownloadButton={true} 
                  className="shadow-md bg-white border border-slate-100"
                />
              </div>

              {/* Display Current URL */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">
                  {isKhmer ? 'អាសយដ្ឋានគេហទំព័រ (URL)៖' : 'System Web URL Link:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin + window.location.pathname}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-400 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + window.location.pathname);
                      alert(isKhmer ? 'បានចម្លងអាសយដ្ឋានគេហទំព័រទៅកាន់ clipboard!' : 'Copied URL to clipboard!');
                    }}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isKhmer ? 'ចម្លង' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
