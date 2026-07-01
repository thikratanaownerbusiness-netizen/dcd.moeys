/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Asset, HandoverRecord, MovementRecord, MaintenanceRecord, DamagedLostRecord, WriteOffRecord, StockItem, StockTransaction, AnnualAuditRecord, DocumentFile } from '../types';
import { OFFICES, CATEGORIES } from '../data/mockData';
import { Search, Filter, Plus, Edit, Trash2, Eye, FileSpreadsheet, PlusCircle, MinusCircle, History, Package, FileText, FileDown, UploadCloud, FileImage, FileCode, Archive, File, Paperclip } from 'lucide-react';
import { Language, translations, getOfficeName as translateOffice, getCategoryName as translateCategory } from '../data/translations';

interface RegisterTableProps {
  activeRegister: string; // 'ASSETS' | 'OFFICES' | 'HANDOVERS' | 'MOVEMENTS' | 'MAINTENANCE' | 'DAMAGED_LOST' | 'WRITEOFFS' | 'STOCK_ITEMS' | 'AUDITS' | 'ICT' | 'DOCUMENTS'
  assets: Asset[];
  handovers: HandoverRecord[];
  movements: MovementRecord[];
  maintenance: MaintenanceRecord[];
  damagedLost: DamagedLostRecord[];
  writeoffs: WriteOffRecord[];
  stockItems: StockItem[];
  stockTransactions: StockTransaction[];
  audits: AnnualAuditRecord[];
  documents?: DocumentFile[];
  
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onViewDetail?: (asset: Asset) => void;
  onAddDocument?: (doc: DocumentFile) => void;
  onDeleteDocument?: (id: string) => void;
  
  // Custom transaction logger for Stock Card
  onAddStockTransaction?: (itemId: string, type: 'IN' | 'OUT', quantity: number, person: string, doc: string) => void;
  lang: Language;
}

export default function RegisterTable({
  activeRegister,
  assets,
  handovers,
  movements,
  maintenance,
  damagedLost,
  writeoffs,
  stockItems,
  stockTransactions,
  audits,
  documents = [],
  onAdd,
  onEdit,
  onDelete,
  onViewDetail,
  onAddDocument,
  onDeleteDocument,
  onAddStockTransaction,
  lang
}: RegisterTableProps) {
  
  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  
  // Stock ledger interactive states
  const [expandedStockId, setExpandedStockId] = useState<string | null>(null);
  const [stockTxType, setStockTxType] = useState<'IN' | 'OUT'>('IN');
  const [stockTxQty, setStockTxQty] = useState(1);
  const [stockTxPerson, setStockTxPerson] = useState('');
  const [stockTxDoc, setStockTxDoc] = useState('');

  // Documents custom interactive states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docCategory, setDocCategory] = useState('លិខិតផ្លូវការ');
  const [docDesc, setDocDesc] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: string; data: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [docFilterCategory, setDocFilterCategory] = useState('');

  const t = translations[lang];

  const translateText = (text: string): string => {
    if (lang === 'KM') return text;
    
    const kmToEnMap: Record<string, string> = {
      // Buttons & general actions
      'ស្វែងរកក្នុងបញ្ជីនេះ...': 'Search in this ledger...',
      'បន្ថែមព័ត៌មានថ្មី': 'Add New Record',
      'បោះពុម្ពប័ណ្ណទ្រព្យ (Asset Card)': 'Print Asset Card',
      'លុបកំណត់ត្រា': 'Delete Record',
      'កែសម្រួល': 'Edit',
      'លុបចេញ': 'Delete',
      'តើអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?': 'Are you sure you want to permanently delete this record?',
      'រកមិនឃើញទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ': 'No matching records found',
      'លម្អិតឧបករណ៍': 'Device Info',
      'បោះពុម្ពប័ណ្ណទ្រព្យ': 'Print Asset Card',
      'កំណត់ត្រាលំហូរស្តុកពិតប្រាកដ (Stock Card Ledger)': 'Real-time Stock Card Ledger',
      'របស់៖': 'Log for:',
      'កាលបរិច្ឆេទ': 'Date',
      'ប្រភេទលំហូរ': 'Flow Type',
      'បរិមាណ': 'Quantity',
      'សមតុល្យចុងក្រោយ': 'Running Balance',
      'អ្នកទទួល / អ្នកប្រគល់': 'Recipient / Dispenser',
      'លិខិតយោង / វិក្កយបត្រ': 'Reference Doc / Invoice',
      'មិនទាន់មានប្រតិបត្តិការលំហូរស្តុកនៅឡើយទេ': 'No transaction logs found',
      'កម្រិតសុវត្ថិភាព': 'Safety Limit',
      'ឯកតាសម្គាល់': 'Unit',
      'បញ្ចូលទិន្នន័យស្តុកថ្មី (លំហូរ ចូល/ចេញ)': 'Log Supply Stock Flow (In / Out)',
      'ប្រភេទប្រតិបត្តិការ': 'Transaction Type',
      'លំហូរចូល (IN)': 'Inflow (IN)',
      'លំហូរចេញ (OUT)': 'Outflow (OUT)',
      'ចំនួនលំហូរ': 'Log Quantity',
      'ឈ្មោះមន្ត្រីទទួល ឬប្រគល់': 'Officer / Recipient Name',
      'លិខិតយោង / វិក្កយបត្រយោង': 'Reference Doc / Invoice',
      'រក្សាទុកប្រតិបត្តិការ': 'Save Transaction',
      
      // Headers
      'ល.រ': 'No.',
      'កូដទ្រព្យ': 'Asset Code',
      'ឈ្មោះទ្រព្យ': 'Asset Name',
      'ប្រភេទ': 'Category',
      'ចំនួន': 'Qty',
      'តម្លៃដើម': 'Cost',
      'ថ្ងៃទទួល': 'Date Received',
      'ប្រភពថវិកា': 'Budget',
      'ការិយាល័យ': 'Office',
      'អ្នកទទួលខុសត្រូវ': 'Custodian',
      'ស្ថានភាព': 'Status',
      'សកម្មភាព': 'Actions',
      'លេខកូដ': 'Code',
      'ប្រភេទចាត់ថ្នាក់': 'Category',
      'បរិយាយ(ឈ្មោះទ្រព្យ)': 'Description (Asset Name)',
      'កាលបរិច្ឆេទប្រើប្រាស់': 'Usage Date',
      'អត្តសញ្ញាណកម្ម[ឈ្មោះអ្នកផលិត,ឈ្មោះសម្គាល់,លេខតាមធុន]': 'Identification [Brand, Model, S/N]',
      'តម្លៃឯកតា(រៀល)': 'Unit Price (Riel)',
      'តម្លៃ(រៀល)': 'Total Value (Riel)',
      'អាសយដ្ឋាន IP': 'IP Address',
      'សុពលភាពការធានា': 'Warranty',
      'ឈ្មោះបុគ្គលិក': 'Staff Name',
      'កាលបរិច្ឆេទប្រគល់': 'Handover Date',
      'អ្នកប្រគល់ (តំណាង)': 'Giver (Rep)',
      'អ្នកទទួលផ្ទាល់': 'Receiver',
      'ស្ថានភាពពេលប្រគល់': 'Handover Status',
      'ផ្ទេរចេញពី': 'From Office',
      'ផ្ទេរចូលទៅ': 'To Office',
      'ប្រភេទនៃចលនា': 'Movement Type',
      'កាលបរិច្ឆេទចលនា': 'Movement Date',
      'អ្នកទទួលបន្ទុកថ្មី': 'New Custodian',
      'ប្រភេទនៃការជួសជុល': 'Repair Type',
      'កាលបរិច្ឆេទជួសជុល': 'Repair Date',
      'តម្លៃសេវាជួសជុល': 'Repair Cost',
      'អ្នកផ្គត់ផ្គង់សេវាកម្ម': 'Service Provider',
      'ប្រភេទគ្រោះមហន្តរាយ': 'Incident Type',
      'កាលបរិច្ឆេទកើតឡើង': 'Incident Date',
      'មូលហេតុលម្អិត': 'Detailed Cause',
      'សំណើដោះស្រាយ': 'Proposal Action',
      'មូលហេតុកាត់ចេញ': 'Reason for Write-Off',
      'កាលបរិច្ឆេទស្នើ': 'Requested Date',
      'ស្ថានភាពសំណើ': 'Proposal Status',
      'កំណត់សម្គាល់បន្ថែម': 'Additional Notes',
      'ឈ្មោះសម្ភារៈ': 'Item Name',
      'ឯកតា': 'Unit',
      'កម្រិតទាប': 'Safety Min',
      'សមតុល្យជាក់ស្តែង': 'Current Stock',
      'ឆ្នាំរាប់': 'Audit Year',
      'កាលបរិច្ឆេទរាប់': 'Audit Date',
      'គណៈកម្មការ': 'Audit Committee',
      'ចំនួនក្នុងបញ្ជី': 'Book Qty',
      'ចំនួនជាក់ស្តែង': 'Physical Qty',
      'ភាពលើសខ្វះ': 'Discrepancy',
      'អនុសាសន៍': 'Recommendations',
      'លេខស៊េរី': 'Serial Number',
      'ឧបករណ៍ ICT?': 'ICT Device?',
      
      // Statuses & Options
      'ល្អ': 'Good',
      'មធ្យម': 'Medium',
      'ខូចស្រាល': 'Minor Damage',
      'ខូចធ្ងន់': 'Major Damage',
      'បាត់បង់': 'Lost/Missing',
      'កំពុងជួសជុល': 'Under Repair',
      'កំពុងពិនិត្យ': 'Pending Review',
      'បានអនុម័ត': 'Approved',
      'បដិសេធ': 'Rejected',
      'ផ្ទេរជាអចិន្ត្រៃយ៍': 'Permanent Transfer',
      'ខ្ចីបណ្តោះអាសន្ន': 'Temporary Borrowing',
      'ដកហូតប្រគល់ត្រឡប់': 'Reclaimed',
      'ហួសអាយុកាលប្រើប្រាស់': 'End of Lifespan',
      'ខូចមិនអាចជួសជុលបាន': 'Irreparable',
      'បាត់បង់ដោយមានការអនុម័ត': 'Approved Loss',
      'ផ្សេងៗ': 'Others',
      'រូបភាព': 'Image',
      'គ្រប់គ្រងទូទៅ / ទាំងអស់': 'All Offices / General',
      'គ្រប់ប្រភេទទ្រព្យសម្បត្តិ': 'All Categories',
      'ការិយាល័យប្រើប្រាស់': 'Office Location',
      'ប្រភេទទ្រព្យសម្បត្តិ': 'Asset Category',

      // Empty states fallback text
      'មិនទាន់មានកំណត់ត្រាទ្រព្យសារពើភណ្ឌឡើយ': 'No asset inventory records found',
      'មិនទាន់មានកំណត់ត្រាប្រគល់-ទទួលឧបករណ៍ឡើយ': 'No handover ledger records found',
      'មិនទាន់មានកំណត់ត្រាចលនាផ្ទេរទ្រព្យឡើយ': 'No asset movement records found',
      'មិនទាន់មានកំណត់ត្រាការចំណាយថែទាំជួសជុលឡើយ': 'No maintenance or repair records found',
      'មិនទាន់មានកំណត់ត្រាទ្រព្យខូច ឬបាត់បង់ឡើយ': 'No damaged or lost asset records found',
      'មិនទាន់មានកំណត់ត្រាស្នើសុំកាត់ចេញពីបញ្ជីឡើយ': 'No write-off proposal records found',
      'មិនទាន់មានកំណត់ត្រាសារពើភណ្ឌសម្ភារៈការិយាល័យឡើយ': 'No consumable stock records found',
      'មិនទាន់មានកំណត់ត្រារាប់សារពើភណ្ឌប្រចាំឆ្នាំឡើយ': 'No annual physical count audit records found',
    };

    return kmToEnMap[text] !== undefined ? kmToEnMap[text] : text;
  };

  const getOfficeName = (officeId: string) => {
    return translateOffice(officeId, lang);
  };

  const getCategoryName = (catId: string) => {
    return translateCategory(catId, lang);
  };

  const formatKhmerNumber = (num: number | string) => {
    if (lang === 'KM') {
      const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
      return num.toString().split('').map(char => {
        if (char >= '0' && char <= '9') {
          return khmerDigits[parseInt(char, 10)];
        }
        return char;
      }).join('');
    }
    return num.toString();
  };

  const formatCurrencyKhmer = (value: number) => {
    if (lang === 'KM') {
      return formatKhmerNumber(value.toLocaleString('en-US')) + ' រៀល';
    }
    return value.toLocaleString('en-US') + ' KHR';
  };

  // --- Filtering Logic for Each View ---
  const getFilteredData = () => {
    const searchLower = searchTerm.toLowerCase();

    switch (activeRegister) {
      case 'ASSETS':
        return assets.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchLower) || item.code.toLowerCase().includes(searchLower) || item.responsiblePerson.toLowerCase().includes(searchLower);
          const matchesOffice = selectedOfficeFilter ? item.officeId === selectedOfficeFilter : true;
          const matchesCategory = selectedCategoryFilter ? item.category === selectedCategoryFilter : true;
          return matchesSearch && matchesOffice && matchesCategory;
        });

      case 'OFFICES':
        return assets.filter(item => {
          const matchesOffice = selectedOfficeFilter ? item.officeId === selectedOfficeFilter : true;
          const matchesSearch = item.name.toLowerCase().includes(searchLower) || item.code.toLowerCase().includes(searchLower);
          return matchesOffice && matchesSearch;
        });

      case 'ICT':
        return assets.filter(item => item.isICT).filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchLower) || item.code.toLowerCase().includes(searchLower) || (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower));
          const matchesOffice = selectedOfficeFilter ? item.officeId === selectedOfficeFilter : true;
          return matchesSearch && matchesOffice;
        });

      case 'HANDOVERS':
        return handovers.filter(item => {
          return item.assetName.toLowerCase().includes(searchLower) || item.assetCode.toLowerCase().includes(searchLower) || item.staffName.toLowerCase().includes(searchLower);
        });

      case 'MOVEMENTS':
        return movements.filter(item => {
          return item.assetName.toLowerCase().includes(searchLower) || item.assetCode.toLowerCase().includes(searchLower) || item.responsiblePerson.toLowerCase().includes(searchLower);
        });

      case 'MAINTENANCE':
        return maintenance.filter(item => {
          return item.assetName.toLowerCase().includes(searchLower) || item.assetCode.toLowerCase().includes(searchLower) || item.repairType.toLowerCase().includes(searchLower) || item.provider.toLowerCase().includes(searchLower);
        });

      case 'DAMAGED_LOST':
        return damagedLost.filter(item => {
          return item.assetName.toLowerCase().includes(searchLower) || item.assetCode.toLowerCase().includes(searchLower) || item.reason.toLowerCase().includes(searchLower);
        });

      case 'WRITEOFFS':
        return writeoffs.filter(item => {
          return item.assetName.toLowerCase().includes(searchLower) || item.assetCode.toLowerCase().includes(searchLower) || item.reason.toLowerCase().includes(searchLower);
        });

      case 'STOCK_ITEMS':
        return stockItems.filter(item => {
          return item.name.toLowerCase().includes(searchLower);
        });

      case 'AUDITS':
        return audits.filter(item => {
          return item.assetName.toLowerCase().includes(searchLower) || item.assetCode.toLowerCase().includes(searchLower) || item.committee.toLowerCase().includes(searchLower);
        });

      case 'DOCUMENTS':
        return documents.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower);
          const matchesCategory = docFilterCategory ? item.category === docFilterCategory : true;
          return matchesSearch && matchesCategory;
        });

      default:
        return [];
    }
  };

  const filteredData = getFilteredData() as any[];

  // Stock Transaction handle
  const handleStockTxSubmit = (itemId: string) => {
    if (stockTxQty <= 0 || !stockTxPerson || !stockTxDoc) return;
    onAddStockTransaction?.(itemId, stockTxType, stockTxQty, stockTxPerson, stockTxDoc);
    
    // Reset form states
    setStockTxQty(1);
    setStockTxPerson('');
    setStockTxDoc('');
  };

  // File size formatting helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type/extension
  const getFileIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (type.includes('pdf') || ext === 'pdf') {
      return <FileText className="h-8 w-8 text-rose-500 shrink-0" />;
    }
    if (type.includes('sheet') || type.includes('excel') || ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="h-8 w-8 text-emerald-500 shrink-0" />;
    }
    if (type.includes('image') || ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'svg') {
      return <FileImage className="h-8 w-8 text-indigo-500 shrink-0" />;
    }
    if (type.includes('zip') || type.includes('tar') || type.includes('rar') || ext === 'zip' || ext === 'rar') {
      return <Archive className="h-8 w-8 text-amber-500 shrink-0" />;
    }
    if (type.includes('word') || ext === 'docx' || ext === 'doc') {
      return <File className="h-8 w-8 text-blue-500 shrink-0" />;
    }
    return <File className="h-8 w-8 text-slate-400 shrink-0" />;
  };

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // Process file upload
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        data: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  // Drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Drag leave
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Save Document callback
  const handleSaveDocument = () => {
    if (!uploadedFile) return;
    const newDoc: DocumentFile = {
      id: `DOC_${Date.now()}`,
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      uploadDate: new Date().toISOString().split('T')[0],
      category: docCategory,
      description: docDesc || (lang === 'KM' ? 'គ្មានការពិពណ៌នា' : 'No description'),
      fileData: uploadedFile.data
    };
    onAddDocument?.(newDoc);
    
    // Clear interactive upload states
    setUploadedFile(null);
    setDocDesc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download document trigger
  const handleDownloadDocument = (doc: DocumentFile) => {
    if (!doc.fileData) {
      alert(lang === 'KM' ? 'ទិន្នន័យឯកសារមិនត្រូវបានរកឃើញ!' : 'Document data not found!');
      return;
    }
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="liquid-glass rounded-2xl overflow-hidden flex flex-col animate-fade-in">
      
      {/* Search & Filter Top Bar */}
      <div className="p-5 border-b border-slate-100/60 dark:border-slate-800/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/10 dark:bg-slate-850/10">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={translateText("ស្វែងរកក្នុងបញ្ជីនេះ...")}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-xs outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center">
          
          {/* Office Filter (for assets / office views / ICT) */}
          {(activeRegister === 'ASSETS' || activeRegister === 'OFFICES' || activeRegister === 'ICT') && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedOfficeFilter}
                onChange={(e) => setSelectedOfficeFilter(e.target.value)}
                className="text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="">{translateText("-- គ្រប់ការិយាល័យ --")}</option>
                {OFFICES.map(o => (
                  <option key={o.id} value={o.id}>{getOfficeName(o.id)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter (only for general Asset view) */}
          {activeRegister === 'ASSETS' && (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="">{translateText("-- គ្រប់ប្រភេទចាត់ថ្នាក់ --")}</option>
              {CATEGORIES.filter(c => c.id !== 'CONSUMABLE').map(c => (
                <option key={c.id} value={c.id}>{getCategoryName(c.id)}</option>
              ))}
            </select>
          )}

          {/* Document Type Filter */}
          {activeRegister === 'DOCUMENTS' && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={docFilterCategory}
                onChange={(e) => setDocFilterCategory(e.target.value)}
                className="text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="">{lang === 'KM' ? '-- គ្រប់ប្រភេទឯកសារ --' : '-- All Document Types --'}</option>
                <option value="វិក្កយបត្រ">{lang === 'KM' ? 'វិក្កយបត្រ (Invoice)' : 'Invoices'}</option>
                <option value="លិខិតផ្លូវការ">{lang === 'KM' ? 'លិខិតផ្លូវការ (Official Letter)' : 'Official Letters'}</option>
                <option value="ឯកសារចេញ">{lang === 'KM' ? 'ឯកសារចេញ (Outgoing Document)' : 'Outgoing Documents'}</option>
                <option value="របាយការណ៍">{lang === 'KM' ? 'របាយការណ៍ (Report)' : 'Reports'}</option>
                <option value="ផ្សេងៗ">{lang === 'KM' ? 'ផ្សេងៗ (Other)' : 'Others'}</option>
              </select>
            </div>
          )}

          {/* Add Entry Button */}
          {activeRegister !== 'OFFICES' && activeRegister !== 'DOCUMENTS' && (
            <button
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md hover:shadow-blue-100 dark:hover:shadow-transparent"
            >
              <Plus className="h-4 w-4" />
              {translateText("បន្ថែមព័ត៌មានថ្មី")}
            </button>
          )}
        </div>

      </div>

      {/* Dynamic Tables Grid based on Active Register */}
      <div className="overflow-x-auto">
        
        {/* 1. ASSET REGISTER (បញ្ជីសារពើភណ្ឌទ្រព្យសម្បត្តិរដ្ឋ) */}
        {(activeRegister === 'ASSETS' || activeRegister === 'OFFICES') && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('រូបភាព')}</th>
                <th className="py-3.5 px-4">{translateText('លេខកូដ')}</th>
                <th className="py-3.5 px-4">{translateText('ប្រភេទចាត់ថ្នាក់')}</th>
                <th className="py-3.5 px-4">{translateText('បរិយាយ(ឈ្មោះទ្រព្យ)')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('កាលបរិច្ឆេទប្រើប្រាស់')}</th>
                <th className="py-3.5 px-4">{translateText('អត្តសញ្ញាណកម្ម[ឈ្មោះអ្នកផលិត,ឈ្មោះសម្គាល់,លេខតាមធុន]')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('បរិមាណ')}</th>
                <th className="py-3.5 px-4 text-right">{translateText('តម្លៃឯកតា(រៀល)')}</th>
                <th className="py-3.5 px-4 text-right">{translateText('តម្លៃ(រៀល)')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('ស្ថានភាព')}</th>
                <th className="py-3.5 px-4">{translateText('អ្នកទទួលខុសត្រូវ')}</th>
                <th className="py-3.5 px-4">{translateText('ផ្សេងៗ')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: Asset, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex items-center justify-center">
                      {item.imageData ? (
                        <img
                          src={item.imageData}
                          alt={item.name}
                          className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                          onClick={() => onViewDetail?.(item)}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <FileImage className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{item.code}</td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">{getCategoryName(item.category)}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</p>
                      {((item as any).imageData || (item as any).documentData) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {(item as any).imageData && (
                            <a 
                              href={(item as any).imageData} 
                              download={(item as any).imageName || 'image.jpg'}
                              title={`${translateText('ទាញយករូបភាព៖')} ${(item as any).imageName}`}
                              className="inline-flex items-center gap-1 text-[9px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-black px-1.5 py-0.5 rounded transition-all border border-indigo-100/50 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileImage className="h-2.5 w-2.5" />
                              <span>{(item as any).imageName || 'រូបភាព'}</span>
                            </a>
                          )}
                          {(item as any).documentData && (
                            <a 
                              href={(item as any).documentData} 
                              download={(item as any).documentName || 'document.docx'}
                              title={`${translateText('ទាញយកឯកសារ៖')} ${(item as any).documentName}`}
                              className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-black px-1.5 py-0.5 rounded transition-all border border-emerald-100/50 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Paperclip className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[80px]">{(item as any).documentName || 'ឯកសារ'}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-medium text-slate-600 dark:text-slate-400">{item.dateReceived ? formatKhmerNumber(item.dateReceived) : 'N/A'}</td>
                  <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-400 font-medium">{item.serialNumber || 'N/A'}</td>
                  <td className="py-4 px-4 text-center font-black text-slate-800 dark:text-slate-200">{formatKhmerNumber(item.quantity)}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-700 dark:text-slate-300">{formatCurrencyKhmer(item.cost)}</td>
                  <td className="py-4 px-4 text-right font-black text-emerald-800 dark:text-emerald-400">{formatCurrencyKhmer(item.cost * item.quantity)}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.status === 'ល្អ' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                      item.status === 'មធ្យម' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' :
                      item.status === 'ខូចស្រាល' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : 
                      'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                    }`}>
                      {translateText(item.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-300">{item.responsiblePerson}</td>
                  <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">{getOfficeName(item.officeId)} | {item.budgetSource}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onViewDetail?.(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all" title={translateText('មើលលម្អិត')}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all" title={translateText('កែសម្រួល')}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-650 transition-all" title={translateText('លុប')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={14} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនមានទិន្នន័យឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 10. ICT ASSET REGISTER (បញ្ជីទ្រព្យសម្បត្តិបច្ចេកវិទ្យាព័ត៌មាន) */}
        {activeRegister === 'ICT' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4">{translateText('លេខកូដ')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('រូបភាព')}</th>
                <th className="py-3.5 px-4">{translateText('ឈ្មោះឧបករណ៍បច្ចេកវិទ្យា')}</th>
                <th className="py-3.5 px-4">{translateText('Serial Number')}</th>
                <th className="py-3.5 px-4">{translateText('IP Address')}</th>
                <th className="py-3.5 px-4">{translateText('រយៈពេលធានា')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('ចំនួន')}</th>
                <th className="py-3.5 px-4">{translateText('ការិយាល័យ')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: Asset, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{item.code}</td>
                  <td className="py-2 px-4 text-center">
                    <div className="flex items-center justify-center">
                      {item.imageData ? (
                        <img
                          src={item.imageData}
                          alt={item.name}
                          className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                          onClick={() => onViewDetail?.(item)}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <FileImage className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.name}</p>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{item.budgetSource}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500 dark:text-slate-400 font-medium">{item.serialNumber || 'N/A'}</td>
                  <td className="py-4 px-4 font-mono text-indigo-700 dark:text-indigo-400 font-semibold">{item.ipAddress || 'Dynamic/Wifi'}</td>
                  <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">{item.warranty || 'N/A'}</td>
                  <td className="py-4 px-4 text-center font-black text-slate-800 dark:text-slate-200">{formatKhmerNumber(item.quantity)}</td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">{getOfficeName(item.officeId)}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onViewDetail?.(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all" title={translateText('លម្អិតឧបករណ៍')}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all" title={translateText('កែសម្រួល')}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 transition-all" title={translateText('លុប')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនមានទិន្នន័យឧបករណ៍បច្ចេកវិទ្យាឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 3. ASSET HANDOVER (បញ្ជីប្រគល់-ទទួលទ្រព្យសម្បត្តិ) */}
        {activeRegister === 'HANDOVERS' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4">{translateText('កូដទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('ឈ្មោះសម្ភារៈ')}</th>
                <th className="py-3.5 px-4">{translateText('បុគ្គលិកទទួល')}</th>
                <th className="py-3.5 px-4">{translateText('កាលបរិច្ឆេទប្រគល់')}</th>
                <th className="py-3.5 px-4">{translateText('អ្នកប្រគល់')}</th>
                <th className="py-3.5 px-4">{translateText('ស្ថានភាពប្រគល់')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: HandoverRecord, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{item.assetCode}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{item.assetName}</td>
                  <td className="py-4 px-4 font-black text-blue-800 dark:text-blue-400">{item.staffName}</td>
                  <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">{formatKhmerNumber(item.handoverDate)}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{item.giverName}</td>
                  <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">{translateText(item.status)}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនទាន់មានទិន្នន័យប្រគល់ជូនបុគ្គលិកឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 4. ASSET MOVEMENT (បញ្ជីចលនាទ្រព្យសម្បត្តិ) */}
        {activeRegister === 'MOVEMENTS' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4">{translateText('កូដទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('ឈ្មោះសម្ភារៈ')}</th>
                <th className="py-3.5 px-4">{translateText('ផ្ទេរចេញពី')}</th>
                <th className="py-3.5 px-4">{translateText('ផ្ទេរចូលទៅ')}</th>
                <th className="py-3.5 px-4">{translateText('ប្រភេទចលនា')}</th>
                <th className="py-3.5 px-4">{translateText('កាលបរិច្ឆេទផ្ទេរ')}</th>
                <th className="py-3.5 px-4">{translateText('អ្នកគ្រប់គ្រងថ្មី')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: MovementRecord, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{item.assetCode}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{item.assetName}</td>
                  <td className="py-4 px-4 font-semibold text-rose-700 dark:text-rose-400">{getOfficeName(item.fromOfficeId)}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-800 dark:text-emerald-400">{getOfficeName(item.toOfficeId)}</td>
                  <td className="py-4 px-4">
                    <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-[10px]">
                      {translateText(item.type)}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">{formatKhmerNumber(item.date)}</td>
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-bold">{item.responsiblePerson}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនទាន់មានចលនាទ្រព្យសម្បត្តិឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 5. MAINTENANCE & REPAIR (បញ្ជីជួសជុល និងថែទាំ) */}
        {activeRegister === 'MAINTENANCE' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4">{translateText('កូដទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('ឈ្មោះទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('ប្រភេទជួសជុល')}</th>
                <th className="py-3.5 px-4 text-right">{translateText('ថ្លៃសេវាជួសជុល')}</th>
                <th className="py-3.5 px-4">{translateText('កាលបរិច្ឆេទ')}</th>
                <th className="py-3.5 px-4">{translateText('ហាងផ្គត់ផ្គង់សេវា')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: MaintenanceRecord, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{item.assetCode}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{item.assetName}</td>
                  <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-bold">{item.repairType}</td>
                  <td className="py-4 px-4 text-right font-black text-rose-700 dark:text-rose-400">{formatCurrencyKhmer(item.cost)}</td>
                  <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">{formatKhmerNumber(item.repairDate)}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{item.provider}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនទាន់មានកំណត់ត្រាជួសជុលឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 6. DAMAGED OR LOST REGISTER (បញ្ជីទ្រព្យសម្បត្តិខូច ឬបាត់បង់) */}
        {activeRegister === 'DAMAGED_LOST' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4">{translateText('កូដទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('ឈ្មោះទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('ប្រភេទគ្រោះមហន្តរាយ')}</th>
                <th className="py-3.5 px-4">{translateText('កាលបរិច្ឆេទកើតឡើង')}</th>
                <th className="py-3.5 px-4">{translateText('មូលហេតុលម្អិត')}</th>
                <th className="py-3.5 px-4">{translateText('សំណើដោះស្រាយ')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: DamagedLostRecord, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{item.assetCode}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{item.assetName}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${item.type === 'បាត់បង់' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}>
                      {translateText(item.type)}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">{formatKhmerNumber(item.date)}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{item.reason}</td>
                  <td className="py-4 px-4 font-bold text-blue-900 dark:text-blue-400">{translateText(item.proposal)}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនទាន់មានកំណត់ត្រាទ្រព្យខូច ឬបាត់បង់ឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 7. WRITE-OFF REQUEST REGISTER (បញ្ជីស្នើសុំកាត់ចេញពីបញ្ជីសារពើភណ្ឌ) */}
        {activeRegister === 'WRITEOFFS' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4">{translateText('កូដទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('ឈ្មោះទ្រព្យ')}</th>
                <th className="py-3.5 px-4">{translateText('មូលហេតុកាត់ចេញ')}</th>
                <th className="py-3.5 px-4">{translateText('កាលបរិច្ឆេទស្នើ')}</th>
                <th className="py-3.5 px-4">{translateText('ស្ថានភាពសំណើ')}</th>
                <th className="py-3.5 px-4">{translateText('កំណត់សម្គាល់បន្ថែម')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: WriteOffRecord, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{item.assetCode}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{item.assetName}</td>
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-bold">{translateText(item.reason)}</td>
                  <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">{formatKhmerNumber(item.requestDate)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      item.status === 'បានអនុម័ត' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                      item.status === 'កំពុងពិនិត្យ' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-750 dark:text-amber-400 animate-pulse' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                    }`}>
                      {translateText(item.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-550 dark:text-slate-400 italic max-w-[150px] truncate" title={item.notes || ''}>{item.notes || 'N/A'}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-650 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនទាន់មានកំណត់ត្រាស្នើសុំកាត់ចេញពីបញ្ជីឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 8. STOCK CARD REGISTER (បញ្ជីសន្និធិសម្ភារៈការិយាល័យ) */}
        {activeRegister === 'STOCK_ITEMS' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 text-center">{translateText('ល.រ')}</th>
                <th className="py-3.5 px-4">{translateText('ឈ្មោះសម្ភារៈ')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('ឯកតាសម្ភារៈ')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('កម្រិតសុវត្ថិភាព')}</th>
                <th className="py-3.5 px-4 text-center">{translateText('សមតុល្យជាក់ស្តែង')}</th>
                <th className="py-3.5 px-6 text-center">{translateText('សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80 text-xs">
              {filteredData.map((item: StockItem, index) => {
                const isLow = item.currentBalance <= item.minStock;
                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                      <td className="py-4 px-6 text-center font-bold text-slate-400 dark:text-slate-500">{formatKhmerNumber(index + 1)}</td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                      <td className="py-4 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">{item.unit}</td>
                      <td className="py-4 px-4 text-center font-mono text-slate-550 dark:text-slate-400">{formatKhmerNumber(item.minStock)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                          isLow ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {formatKhmerNumber(item.currentBalance)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setExpandedStockId(expandedStockId === item.id ? null : item.id)}
                            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                              expandedStockId === item.id 
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600'
                            }`}
                            title={translateText('ប្រវត្តិលំហូរស្តុកពិតប្រាកដ (Stock Card Ledger)')}
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-650 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Sub-view: Active Stock Card Transactions */}
                    {expandedStockId === item.id && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50/50 dark:bg-slate-900/40 p-6 border-y border-slate-100 dark:border-slate-800/80">
                          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                  <Package className="h-4 w-4 text-blue-500" />
                                  {translateText('ប្រវត្តិលំហូរស្តុកពិតប្រាកដ (Stock Card Ledger)')}
                                </h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{translateText('របស់៖')} {item.name}</p>
                              </div>

                              {/* Toggle Action form inside expanded layout */}
                              <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                                <button
                                  onClick={() => setStockTxType('IN')}
                                  className={`px-3 py-1 rounded font-bold transition-all ${stockTxType === 'IN' ? 'bg-emerald-600 text-white font-black' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                >
                                  {translateText('លំហូរចូល (IN)')}
                                </button>
                                <button
                                  onClick={() => setStockTxType('OUT')}
                                  className={`px-3 py-1 rounded font-bold transition-all ${stockTxType === 'OUT' ? 'bg-rose-600 text-white font-black' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                >
                                  {translateText('លំហូរចេញ (OUT)')}
                                </button>
                              </div>
                            </div>

                            {/* Form to log new flow */}
                            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <label className="block text-slate-400 dark:text-slate-500 mb-1">{translateText('ចំនួន')}</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={stockTxQty}
                                  onChange={(e) => setStockTxQty(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-full border border-slate-200 dark:border-slate-750 rounded-lg p-2 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-400 dark:text-slate-500 mb-1">{translateText('អ្នកទទួល / អ្នកប្រគល់')} *</label>
                                <input
                                  type="text"
                                  value={stockTxPerson}
                                  onChange={(e) => setStockTxPerson(e.target.value)}
                                  className="w-full border border-slate-200 dark:border-slate-750 rounded-lg p-2 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                  placeholder={translateText('ឈ្មោះមន្ត្រីទទួល ឬប្រគល់')}
                                />
                              </div>
                              <div className="col-span-1 md:col-span-2">
                                <label className="block text-slate-400 dark:text-slate-500 mb-1">{translateText('លិខិតយោង / វិក្កយបត្រ')} *</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={stockTxDoc}
                                    onChange={(e) => setStockTxDoc(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-slate-750 rounded-lg p-2 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                    placeholder={translateText('លិខិតយោង / វិក្កយបត្រយោង')}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleStockTxSubmit(item.id)}
                                    className={`px-4 rounded-xl font-bold text-white transition-all text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer ${
                                      stockTxType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                    }`}
                                  >
                                    {stockTxType === 'IN' ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
                                    {translateText('ចុះបញ្ជី')}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Previous Stock Transactions Table */}
                            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800/80">
                                    <th className="py-2.5 px-4">{translateText('កាលបរិច្ឆេទ')}</th>
                                    <th className="py-2.5 px-4 text-center">{translateText('ប្រភេទលំហូរ')}</th>
                                    <th className="py-2.5 px-4 text-center">{translateText('ចំនួន')}</th>
                                    <th className="py-2.5 px-4 text-center">{translateText('សមតុល្យចុងក្រោយ')}</th>
                                    <th className="py-2.5 px-4">{translateText('អ្នកទទួល / អ្នកប្រគល់')}</th>
                                    <th className="py-2.5 px-4">{translateText('លិខិតយោង / វិក្កយបត្រ')}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                  {stockTransactions
                                    .filter(tx => tx.itemId === item.id)
                                    .map(tx => (
                                      <tr key={tx.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                                        <td className="py-2.5 px-4 font-mono font-medium text-slate-500 dark:text-slate-450">{formatKhmerNumber(tx.date)}</td>
                                        <td className="py-2.5 px-4 text-center">
                                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                            tx.type === 'IN' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450'
                                          }`}>
                                            {tx.type === 'IN' ? translateText('លំហូរចូល (IN)') : translateText('លំហូរចេញ (OUT)')}
                                          </span>
                                        </td>
                                        <td className={`py-2.5 px-4 text-center font-black ${tx.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                          {tx.type === 'IN' ? '+' : '-'}{formatKhmerNumber(tx.quantity)}
                                        </td>
                                        <td className="py-2.5 px-4 text-center font-bold text-slate-700 dark:text-slate-350">{formatKhmerNumber(tx.balanceAfter)}</td>
                                        <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{tx.receiverOrGiver}</td>
                                        <td className="py-2.5 px-4 font-mono text-slate-550 dark:text-slate-450">{tx.referenceDoc}</td>
                                      </tr>
                                    ))}
                                  {stockTransactions.filter(tx => tx.itemId === item.id).length === 0 && (
                                    <tr>
                                      <td colSpan={6} className="text-center py-6 text-slate-450 italic">
                                        {translateText('មិនទាន់មានប្រតិបត្តិការលំហូរស្តុកនៅឡើយទេ')}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                    {translateText('មិនទាន់មានកំណត់ត្រាសារពើភណ្ឌសម្ភារៈការិយាល័យឡើយ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 9. ANNUAL AUDIT (បញ្ជីរាប់សារពើភណ្ឌប្រចាំឆ្នាំ) */}
        {activeRegister === 'AUDITS' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100">
                <th className="py-3.5 px-6 text-center">ល.រ</th>
                <th className="py-3.5 px-4">ឆ្នាំរាប់</th>
                <th className="py-3.5 px-4">គណៈកម្មការរាប់</th>
                <th className="py-3.5 px-4">កូដទ្រព្យ</th>
                <th className="py-3.5 px-4">ឈ្មោះសម្ភារៈ</th>
                <th className="py-3.5 px-4 text-center">ចំនួនក្នុងបញ្ជី</th>
                <th className="py-3.5 px-4 text-center">ចំនួនជាក់ស្តែង</th>
                <th className="py-3.5 px-4 text-center">លើស/ខ្វះ</th>
                <th className="py-3.5 px-4">អនុសាសន៍គណៈកម្មការ</th>
                <th className="py-3.5 px-6 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filteredData.map((item: AnnualAuditRecord, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 text-center font-bold text-slate-400">{formatKhmerNumber(index + 1)}</td>
                  <td className="py-4 px-4 font-bold text-slate-800">{formatKhmerNumber(item.year)}</td>
                  <td className="py-4 px-4 text-slate-600 max-w-[150px] truncate" title={item.committee}>{item.committee}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-500">{item.assetCode}</td>
                  <td className="py-4 px-4 font-bold text-slate-900">{item.assetName}</td>
                  <td className="py-4 px-4 text-center font-bold text-slate-500">{formatKhmerNumber(item.registeredQty)}</td>
                  <td className="py-4 px-4 text-center font-black text-blue-700">{formatKhmerNumber(item.actualQty)}</td>
                  <td className="py-4 px-4 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded ${
                      item.diff === 0 ? 'bg-slate-100 text-slate-600' :
                      item.diff < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.diff === 0 ? 'ស្មើ' : formatKhmerNumber(item.diff)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 italic max-w-[200px] truncate" title={item.recommendations}>{item.recommendations}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 italic">មិនទាន់មានលទ្ធផលរាប់សារពើភណ្ឌប្រចាំឆ្នាំឡើយ</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 11. DOCUMENT MANAGEMENT (បញ្ជីគ្រប់គ្រងឯកសារ) */}
        {activeRegister === 'DOCUMENTS' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Upload Form */}
              <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <UploadCloud className="h-4 w-4 text-blue-500" />
                  {lang === 'KM' ? 'បញ្ចូលឯកសារថ្មី' : 'Upload New Document'}
                </h3>
                
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20' 
                      : uploadedFile 
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="mx-auto flex justify-center">
                        {getFileIcon(uploadedFile.type, uploadedFile.name)}
                      </div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 max-w-[200px] truncate mx-auto" title={uploadedFile.name}>
                        {uploadedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-[10px] text-red-500 hover:text-red-400 underline font-bold"
                      >
                        {lang === 'KM' ? 'លុបចេញ' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto" />
                      <p className="font-bold text-xs text-slate-750 dark:text-slate-300">
                        {lang === 'KM' ? 'អូសទម្លាក់ ឬ ចុចដើម្បីជ្រើសរើសឯកសារ' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550">
                        {lang === 'KM' ? 'គាំទ្រគ្រប់ប្រភេទឯកសារទាំងអស់' : 'All file types supported'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Metadata Form */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                      {lang === 'KM' ? 'ប្រភេទឯកសារ' : 'Document Category'} *
                    </label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                    >
                      <option value="វិក្កយបត្រ">{lang === 'KM' ? 'វិក្កយបត្រ (Invoice)' : 'Invoice'}</option>
                      <option value="លិខិតផ្លូវការ">{lang === 'KM' ? 'លិខិតផ្លូវការ (Official Letter)' : 'Official Letter'}</option>
                      <option value="ឯកសារចេញ">{lang === 'KM' ? 'ឯកសារចេញ (Outgoing Document)' : 'Outgoing Document'}</option>
                      <option value="របាយការណ៍">{lang === 'KM' ? 'របាយការណ៍ (Report)' : 'Report'}</option>
                      <option value="ផ្សេងៗ">{lang === 'KM' ? 'ផ្សេងៗ (Other)' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                      {lang === 'KM' ? 'ការពិពណ៌នា' : 'Description'}
                    </label>
                    <textarea
                      value={docDesc}
                      onChange={(e) => setDocDesc(e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                      placeholder={lang === 'KM' ? 'បញ្ជាក់ព័ត៌មានលម្អិតអំពីឯកសារនេះ...' : 'Enter details about this document...'}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!uploadedFile}
                    onClick={handleSaveDocument}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-white ${
                      uploadedFile 
                        ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-100 dark:shadow-transparent' 
                        : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    {lang === 'KM' ? 'រក្សាទុកឯកសារ' : 'Save Document'}
                  </button>
                </div>
              </div>

              {/* Right Column: Files List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {lang === 'KM' ? 'បញ្ជីឯកសារដែលបានរក្សាទុក' : 'Saved Documents List'} ({formatKhmerNumber(filteredData.length)})
                  </h3>
                </div>

                <div className="overflow-x-auto border border-slate-150/40 dark:border-slate-800/40 rounded-2xl bg-slate-50/10 dark:bg-slate-900/10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                        <th className="py-3 px-4">{lang === 'KM' ? 'ឈ្មោះឯកសារ' : 'File Name'}</th>
                        <th className="py-3 px-4 text-center">{lang === 'KM' ? 'ប្រភេទ' : 'Category'}</th>
                        <th className="py-3 px-4 text-center">{lang === 'KM' ? 'ទំហំ' : 'Size'}</th>
                        <th className="py-3 px-4 text-center">{lang === 'KM' ? 'ថ្ងៃបញ្ចូល' : 'Date'}</th>
                        <th className="py-3 px-4">{lang === 'KM' ? 'ការពិពណ៌នា' : 'Description'}</th>
                        <th className="py-3 px-4 text-center">{lang === 'KM' ? 'សកម្មភាព' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs">
                      {filteredData.map((doc: DocumentFile) => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 max-w-[180px] truncate" title={doc.name}>
                            <div className="flex items-center gap-2">
                              {getFileIcon(doc.type, doc.name)}
                              <span className="truncate">{doc.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.category === 'វិក្កយបត្រ' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700' :
                              doc.category === 'លិខិតផ្លូវការ' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700' :
                              doc.category === 'ឯកសារចេញ' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700' :
                              doc.category === 'របាយការណ៍' ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400'
                            }`}>
                              {doc.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-550 dark:text-slate-400">
                            {formatFileSize(doc.size)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-550 dark:text-slate-400">
                            {formatKhmerNumber(doc.uploadDate)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 italic max-w-[150px] truncate" title={doc.description}>
                            {doc.description}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDownloadDocument(doc)}
                                className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all cursor-pointer"
                                title={lang === 'KM' ? 'ទាញយកឯកសារ' : 'Download Document'}
                              >
                                <FileDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onDeleteDocument?.(doc.id)}
                                className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all cursor-pointer"
                                title={lang === 'KM' ? 'លុបឯកសារ' : 'Delete Document'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400 dark:text-slate-500 italic">
                            {lang === 'KM' ? 'មិនទាន់មានឯកសារឡើយ' : 'No documents uploaded yet'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
