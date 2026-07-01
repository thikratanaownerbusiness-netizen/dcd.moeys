/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Asset, StockItem, HandoverRecord, MovementRecord, MaintenanceRecord, WriteOffRecord, AnnualAuditRecord, Office, StockTransaction } from '../types';
import { OFFICES, CATEGORIES } from '../data/mockData';
import { getOfficeName as translateOffice } from '../data/translations';
import { Printer, X, FileText, FileSpreadsheet } from 'lucide-react';
import Barcode from './Barcode';

interface DocumentTemplatesProps {
  assets: Asset[];
  stockItems: StockItem[];
  handovers: HandoverRecord[];
  movements: MovementRecord[];
  maintenance: MaintenanceRecord[];
  writeoffs: WriteOffRecord[];
  audits: AnnualAuditRecord[];
  stockTransactions: StockTransaction[];
  onClose: () => void;
}

export type DocumentType = 
  | 'INVENTORY_BOOK' // សៀវភៅបញ្ជីសារពើភណ្ឌទ្រព្យសម្បត្តិរដ្ឋ
  | 'ASSET_CARD'      // ប័ណ្ណទ្រព្យសម្បត្តិ
  | 'HANDOVER'        // បញ្ជីប្រគល់-ទទួល
  | 'TRANSFER'        // បញ្ជីផ្ទេរទ្រព្យ
  | 'REPAIR'          // បញ្ជីជួសជុល
  | 'WRITE_OFF'       // បញ្ជីកាត់ចេញ
  | 'ANNUAL_REPORT'   // របាយការណ៍សារពើភណ្ឌប្រចាំឆ្នាំ
  | 'STOCK_CARD'      // បញ្ជី Stock Card សម្ភារៈប្រើប្រាស់អស់
  | 'BARCODE_GENERATOR'; // ម៉ាស៊ីនបង្កើតបាកូដគំរូ (Barcode Generator)

export default function DocumentTemplates({
  assets,
  stockItems,
  handovers,
  movements,
  maintenance,
  writeoffs,
  audits,
  stockTransactions,
  onClose
}: DocumentTemplatesProps) {
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentType>('INVENTORY_BOOK');
  const [selectedAssetId, setSelectedAssetId] = React.useState<string>(assets[0]?.id || '');
  const [selectedHandoverId, setSelectedHandoverId] = React.useState<string>(handovers[0]?.id || '');
  const [selectedMovementId, setSelectedMovementId] = React.useState<string>(movements[0]?.id || '');
  const [selectedRepairId, setSelectedRepairId] = React.useState<string>(maintenance[0]?.id || '');
  const [selectedWriteOffId, setSelectedWriteOffId] = React.useState<string>(writeoffs[0]?.id || '');
  const [selectedStockId, setSelectedStockId] = React.useState<string>(stockItems[0]?.id || '');

  // Barcode Generator States
  const [barcodeInputValue, setBarcodeInputValue] = React.useState<string>(assets[0]?.code || 'DCD-TECH-001');
  const [barcodeHeight, setBarcodeHeight] = React.useState<number>(60);
  const [barcodeShowText, setBarcodeShowText] = React.useState<boolean>(true);
  const [barcodeViewMode, setBarcodeViewMode] = React.useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [barcodeBatchOffice, setBarcodeBatchOffice] = React.useState<string>('ALL');
  const [barcodeBatchCategory, setBarcodeBatchCategory] = React.useState<string>('ALL');
  const [docNumber, setDocNumber] = React.useState<string>('១២៤/២៦ អយក.នអស');
  const [signDate, setSignDate] = React.useState<string>(() => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
      return '2026-06-24';
    }
  });

  const [preparedByName, setPreparedByName] = React.useState<string>('');
  const [checkedByName, setCheckedByName] = React.useState<string>('');
  const [approvedByName, setApprovedByName] = React.useState<string>('');

  const printAreaRef = useRef<HTMLDivElement>(null);

  const getOfficeName = (officeId: string) => {
    const name = translateOffice(officeId, 'KM');
    if (name && name !== officeId) return name;
    return OFFICES.find(o => o.id === officeId)?.name || officeId;
  };

  const formatKhmerNumber = (num: number | string) => {
    if (num === null || num === undefined) return '';
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().split('').map(char => {
      if (char >= '0' && char <= '9') {
        return khmerDigits[parseInt(char, 10)];
      }
      if (char === ',') return ' , ';
      if (char === '.') return ' . ';
      return char;
    }).join('');
  };

  const formatCurrencyKhmer = (value: number) => {
    return formatKhmerNumber(value.toLocaleString('en-US')) + ' រៀល';
  };

  const formatKhmerDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Normalize Khmer digits to standard ASCII digits so Date constructor can parse it
    let cleanedStr = dateStr;
    const khmerToEng: {[key: string]: string} = {
      '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
      '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
    };
    cleanedStr = cleanedStr.split('').map(c => khmerToEng[c] || c).join('');

    let date = new Date(cleanedStr);
    if (isNaN(date.getTime())) {
      date = new Date(); // Fallback to current system date (today)
    }
    const day = formatKhmerNumber(date.getDate());
    const khmerMonths = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    const month = khmerMonths[date.getMonth()];
    const year = formatKhmerNumber(date.getFullYear());
    return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
  };

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (!printContent) return;

    // We implement a three-tier robust print strategy to ensure compatibitly on ALL devices,
    // browsers, platforms, and inside sandboxed iframes.
    
    // Tier 1: In-Page Hidden Iframe printing (highly reliable, no popup block risk, works perfectly inside iframe environments)
    try {
      let printFrame = document.getElementById('app-print-iframe') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'app-print-iframe';
        // Hide visually, but keep in DOM to render correctly
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);
      }

      const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>បោះពុម្ពឯកសារផ្លូវការ</title>
              <link href="https://fonts.googleapis.com/css2?family=Khmer:wght@400;700&family=Moul&family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body {
                  font-family: 'Kantumruy Pro', 'Khmer', sans-serif;
                  background-color: white;
                  padding: 20px;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .moul-font {
                  font-family: 'Moul', 'Khmer', serif;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="max-w-4xl mx-auto">
                ${printContent}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    try {
                      window.focus();
                      window.print();
                    } catch (err) {
                      console.error("Iframe print triggered error:", err);
                    }
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        doc.close();
        return; // Success with Tier 1
      }
    } catch (iframeError) {
      console.warn("Tier 1: Hidden iframe printing failed or was blocked. Trying Tier 2...", iframeError);
    }

    // Tier 2: window.open (traditional method, can be blocked by popup blockers but excellent as a fallback)
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>បោះពុម្ពឯកសារផ្លូវការ</title>
              <link href="https://fonts.googleapis.com/css2?family=Khmer:wght@400;700&family=Moul&family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body {
                  font-family: 'Kantumruy Pro', 'Khmer', sans-serif;
                  background-color: white;
                  padding: 20px;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .moul-font {
                  font-family: 'Moul', 'Khmer', serif;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body onload="setTimeout(function() { window.print(); window.close(); }, 500);">
              <div class="max-w-4xl mx-auto">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        return; // Success with Tier 2
      }
    } catch (windowOpenError) {
      console.warn("Tier 2: window.open failed or blocked. Trying Tier 3 (Direct DOM print)...", windowOpenError);
    }

    // Tier 3: Direct Body Swap Fallback (Absolute fail-safe if all window creation is blocked)
    try {
      const originalBodyContent = document.body.innerHTML;
      
      // Setup print container
      const printContainer = document.createElement('div');
      printContainer.id = 'direct-print-container';
      printContainer.className = 'fixed inset-0 bg-white z-[999999] overflow-auto p-8';
      printContainer.innerHTML = `
        <div class="max-w-4xl mx-auto">
          ${printContent}
        </div>
      `;
      
      // Inject Google Fonts and Tailwind link dynamically into main head if not present
      if (!document.getElementById('print-tailwind-cdn')) {
        const twScript = document.createElement('script');
        twScript.id = 'print-tailwind-cdn';
        twScript.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(twScript);
      }
      
      // Hide the React Root app wrapper
      const rootDiv = document.getElementById('root');
      if (rootDiv) {
        rootDiv.style.display = 'none';
      }
      
      document.body.appendChild(printContainer);
      
      // Wait for tailwind and fonts to adapt
      setTimeout(() => {
        window.print();
        
        // Restore DOM
        if (rootDiv) {
          rootDiv.style.display = '';
        }
        printContainer.remove();
      }, 500);
    } catch (fallbackError) {
      console.error("Tier 3: All printing fallback methods failed.", fallbackError);
      alert("សូមអភ័យទោស! កម្មវិធីរុករក (Browser) របស់អ្នកបានបដិសេធសិទ្ធិដំណើរការការបោះពុម្ព។ សូមសាកល្បងបើកក្នុង Tab ថ្មី។");
    }
  };

  const downloadWord = () => {
    if (!printAreaRef.current) return;
    const innerHtml = printAreaRef.current.innerHTML;
    
    // CSS to embed so it renders nicely in Word
    const css = `
      @page {
        size: A4;
        margin: 1in;
      }
      body {
        font-family: 'Kantumruy Pro', 'Khmer', 'Segoe UI', Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #333333;
      }
      h2, h3, h4 {
        color: #000000;
        margin-bottom: 0.5em;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 15px;
        margin-bottom: 15px;
      }
      th {
        background-color: #f1f5f9;
        border: 1px solid #475569;
        padding: 8px;
        font-weight: bold;
        font-size: 10pt;
      }
      td {
        border: 1px solid #475569;
        padding: 8px;
        font-size: 10pt;
      }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: bold; }
    `;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${selectedDoc}_Official_Document</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          ${css}
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto;">
          ${innerHtml}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ឯកសារ_${selectedDoc}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    if (!printAreaRef.current) return;
    const innerHtml = printAreaRef.current.innerHTML;

    const css = `
      table {
        border-collapse: collapse;
      }
      th {
        background-color: #e2e8f0;
        border: 0.5pt solid #94a3b8;
        font-weight: bold;
        text-align: center;
      }
      td {
        border: 0.5pt solid #cbd5e1;
      }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
    `;

    const excelContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Official Register</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${innerHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `តារាង_${selectedDoc}_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (format: 'PDF' | 'EXCEL' | 'WORD') => {
    if (format === 'PDF') {
      handlePrint();
    } else if (format === 'EXCEL') {
      downloadExcel();
    } else if (format === 'WORD') {
      downloadWord();
    }
  };

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  const selectedHandover = handovers.find(h => h.id === selectedHandoverId) || handovers[0];
  const selectedMovement = movements.find(m => m.id === selectedMovementId) || movements[0];
  const selectedRepair = maintenance.find(r => r.id === selectedRepairId) || maintenance[0];
  const selectedWriteOff = writeoffs.find(w => w.id === selectedWriteOffId) || writeoffs[0];
  const selectedStock = stockItems.find(s => s.id === selectedStockId) || stockItems[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start p-4 md:p-8">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col md:flex-row overflow-hidden my-4 max-h-[90vh]">
        
        {/* Left Control Panel: Select Template */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                គំរូឯកសារផ្លូវការ
              </h3>
              <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ជ្រើសរើសប្រភេទប័ណ្ណ/បញ្ជី</p>
              
              <button
                onClick={() => setSelectedDoc('INVENTORY_BOOK')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'INVENTORY_BOOK' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ១. សៀវភៅបញ្ជីសារពើភណ្ឌរដ្ឋ
              </button>

              <button
                onClick={() => setSelectedDoc('ASSET_CARD')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'ASSET_CARD' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ២. ប័ណ្ណទ្រព្យសម្បត្តិ (Asset Card)
              </button>

              <button
                onClick={() => setSelectedDoc('HANDOVER')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'HANDOVER' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ៣. បញ្ជីប្រគល់-ទទួលទ្រព្យ
              </button>

              <button
                onClick={() => setSelectedDoc('TRANSFER')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'TRANSFER' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ៤. បញ្ជីផ្ទេរទ្រព្យសម្បត្តិ
              </button>

              <button
                onClick={() => setSelectedDoc('REPAIR')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'REPAIR' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ៥. បញ្ជីជួសជុល និងថែទាំ
              </button>

              <button
                onClick={() => setSelectedDoc('WRITE_OFF')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'WRITE_OFF' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ៦. បញ្ជីស្នើសុំកាត់ចេញពីបញ្ជី
              </button>

              <button
                onClick={() => setSelectedDoc('ANNUAL_REPORT')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'ANNUAL_REPORT' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ៧. របាយការណ៍សារពើភណ្ឌប្រចាំឆ្នាំ
              </button>

              <button
                onClick={() => setSelectedDoc('STOCK_CARD')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedDoc === 'STOCK_CARD' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ៨. បញ្ជី Stock Card គ្រឿងប្រើប្រាស់
              </button>

              <button
                onClick={() => setSelectedDoc('BARCODE_GENERATOR')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${selectedDoc === 'BARCODE_GENERATOR' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ៩. បង្កើតបាកូដសម្ភារៈ (Barcode Generator)
              </button>
            </div>

            {/* Dynamic Dropdown Selectors based on Document Type */}
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">កំណត់ទិន្នន័យឯកសារ</p>
              
              <div>
                <label className="block text-xs text-slate-500 mb-1">លេខលិខិត/យោង</label>
                <input 
                  type="text" 
                  value={docNumber} 
                  onChange={(e) => setDocNumber(e.target.value)} 
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">កាលបរិច្ឆេទចុះហត្ថលេខា</label>
                <input 
                  type="date" 
                  value={signDate} 
                  onChange={(e) => setSignDate(e.target.value)} 
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">រៀបចំដោយ (ឈ្មោះ)</label>
                <input 
                  type="text" 
                  value={preparedByName} 
                  onChange={(e) => setPreparedByName(e.target.value)} 
                  placeholder="ឧ. កែវ សុភ័ក្ត្រ"
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">បានពិនិត្យដោយ (ឈ្មោះ)</label>
                <input 
                  type="text" 
                  value={checkedByName} 
                  onChange={(e) => setCheckedByName(e.target.value)} 
                  placeholder="ឧ. អ៊ុំ សារ៉ាត់"
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">ការអនុម័តដោយ (ឈ្មោះ)</label>
                <input 
                  type="text" 
                  value={approvedByName} 
                  onChange={(e) => setApprovedByName(e.target.value)} 
                  placeholder="ឧ. ភី ណារិន"
                  className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {selectedDoc === 'ASSET_CARD' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">ជ្រើសរើសទ្រព្យសម្បត្តិ</label>
                  <select 
                    value={selectedAssetId} 
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2"
                  >
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDoc === 'HANDOVER' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">ជ្រើសរើសកំណត់ត្រាប្រគល់-ទទួល</label>
                  <select 
                    value={selectedHandoverId} 
                    onChange={(e) => setSelectedHandoverId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2"
                  >
                    {handovers.map(h => (
                      <option key={h.id} value={h.id}>{h.assetCode} - {h.staffName}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDoc === 'TRANSFER' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">ជ្រើសរើសកំណត់ត្រាផ្ទេរ</label>
                  <select 
                    value={selectedMovementId} 
                    onChange={(e) => setSelectedMovementId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2"
                  >
                    {movements.map(m => (
                      <option key={m.id} value={m.id}>{m.assetCode} ({m.type})</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDoc === 'REPAIR' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">ជ្រើសរើសកំណត់ត្រាជួសជុល</label>
                  <select 
                    value={selectedRepairId} 
                    onChange={(e) => setSelectedRepairId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2"
                  >
                    {maintenance.map(r => (
                      <option key={r.id} value={r.id}>{r.assetCode} - {r.repairType}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDoc === 'WRITE_OFF' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">ជ្រើសរើសកំណត់ត្រាកាត់ចេញ</label>
                  <select 
                    value={selectedWriteOffId} 
                    onChange={(e) => setSelectedWriteOffId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2"
                  >
                    {writeoffs.map(w => (
                      <option key={w.id} value={w.id}>{w.assetCode} - {w.reason}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDoc === 'STOCK_CARD' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-medium">ជ្រើសរើសមុខទំនិញ</label>
                  <select 
                    value={selectedStockId} 
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded p-2"
                  >
                    {stockItems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDoc === 'BARCODE_GENERATOR' && (
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">របៀបបង្ហាញ (View Mode)</label>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-150 dark:bg-slate-950 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setBarcodeViewMode('SINGLE')}
                        className={`py-1 text-[10px] font-black rounded-md cursor-pointer transition-all ${barcodeViewMode === 'SINGLE' ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-3xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        គំរូទោល (Single)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBarcodeViewMode('BATCH')}
                        className={`py-1 text-[10px] font-black rounded-md cursor-pointer transition-all ${barcodeViewMode === 'BATCH' ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-3xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        បោះពុម្ពជាក្រុម (Batch)
                      </button>
                    </div>
                  </div>

                  {barcodeViewMode === 'SINGLE' ? (
                    <>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">ជ្រើសរើសពីទ្រព្យ (Fill from Asset)</label>
                        <select
                          value=""
                          onChange={(e) => {
                            const found = assets.find(a => a.id === e.target.value);
                            if (found) {
                              setBarcodeInputValue(found.code);
                            }
                          }}
                          className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-950"
                        >
                          <option value="">-- ចុចដើម្បីជ្រើសរើស --</option>
                          {assets.map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">តម្លៃបាកូដ (Input Barcode Value)</label>
                        <input
                          type="text"
                          value={barcodeInputValue}
                          onChange={(e) => setBarcodeInputValue(e.target.value.replace(/[^a-zA-Z0-9\- \.\$\/\+\%]/g, ''))}
                          placeholder="ឧ. LIKHIT-001"
                          className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 font-mono font-bold uppercase bg-white dark:bg-slate-950"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">ចម្រោះតាមការិយាល័យ (Filter Office)</label>
                        <select
                          value={barcodeBatchOffice}
                          onChange={(e) => setBarcodeBatchOffice(e.target.value)}
                          className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-950"
                        >
                          <option value="ALL">គ្រប់ការិយាល័យទាំងអស់ (All)</option>
                          {OFFICES.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">ចម្រោះតាមប្រភេទ (Filter Category)</label>
                        <select
                          value={barcodeBatchCategory}
                          onChange={(e) => setBarcodeBatchCategory(e.target.value)}
                          className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-950"
                        >
                          <option value="ALL">គ្រប់ប្រភេទទាំងអស់ (All)</option>
                          {CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">កម្ពស់បាកូដ (Barcode Height): {barcodeHeight}px</label>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      step="5"
                      value={barcodeHeight}
                      onChange={(e) => setBarcodeHeight(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/55 dark:border-slate-800">
                    <input
                      type="checkbox"
                      id="barcodeShowText"
                      checked={barcodeShowText}
                      onChange={(e) => setBarcodeShowText(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <label htmlFor="barcodeShowText" className="text-xs text-slate-600 dark:text-slate-350 font-bold select-none cursor-pointer">
                      បង្ហាញលេខកូដខាងក្រោម (Show Text)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 space-y-3 border-t border-slate-200">
            <div className="border border-indigo-100 bg-indigo-50/20 p-3 rounded-xl space-y-2">
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">ទាញយកឯកសារផ្លូវការ (Download)</p>
              
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleDownload('PDF')}
                  className="flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border border-red-200 hover:border-red-400 bg-red-50/30 hover:bg-red-50 text-red-700 transition-all cursor-pointer font-bold text-[10px]"
                  title="ទាញយកជា PDF"
                >
                  <FileText className="h-4 w-4 mb-1 text-red-500" />
                  <span>PDF File</span>
                </button>
                <button
                  onClick={() => handleDownload('EXCEL')}
                  className="flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border border-emerald-200 hover:border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50 text-emerald-700 transition-all cursor-pointer font-bold text-[10px]"
                  title="ទាញយកជា Excel"
                >
                  <FileSpreadsheet className="h-4 w-4 mb-1 text-emerald-500" />
                  <span>Excel File</span>
                </button>
                <button
                  onClick={() => handleDownload('WORD')}
                  className="flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50 text-blue-700 transition-all cursor-pointer font-bold text-[10px]"
                  title="ទាញយកជា Word"
                >
                  <FileText className="h-4 w-4 mb-1 text-blue-500" />
                  <span>Word File</span>
                </button>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              បោះពុម្ពជា PDF / ក្រដាស
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              បិទផ្ទាំងនេះ
            </button>
          </div>
        </div>

        {/* Right View Panel: Real-time Styled Print Preview of Selected Document */}
        <div className="flex-1 bg-slate-100 p-8 overflow-y-auto relative">
          <button 
            onClick={onClose} 
            className="hidden md:flex absolute top-4 right-4 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 shadow p-2 rounded-full transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* This is the printable sheet container simulating A4 size */}
          <div 
            ref={printAreaRef}
            className="bg-white mx-auto p-12 shadow-lg rounded-md border border-slate-200 text-slate-800 text-sm leading-relaxed max-w-[800px] min-h-[1050px]"
            style={{ fontFamily: "'Kantumruy Pro', 'Khmer', sans-serif" }}
          >
            {/* Header Structure (Official Kingdom of Cambodia Header) */}
            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-full flex justify-between text-xs font-bold leading-relaxed mb-4">
                <div className="text-center">
                  <h4 className="font-semibold text-slate-800 text-sm">ក្រសួងអប់រំ យុវជន និងកីឡា</h4>
                  <h5 className="font-medium text-xs text-slate-600">នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា</h5>
                  <p className="text-xs text-slate-500 font-normal">លេខ៖ {docNumber}</p>
                </div>
                <div className="text-center">
                  <h4 className="text-sm tracking-widest font-semibold text-slate-900" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>ព្រះរាជាណាចក្រកម្ពុជា</h4>
                  <h5 className="text-xs tracking-wider text-slate-800 font-semibold" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>ជាតិ សាសនា ព្រះមហាក្សត្រ</h5>
                  <div className="w-16 h-[1.5px] bg-slate-800 mx-auto mt-1 flex justify-center items-center">
                    <span className="w-2 h-2 rounded-full border border-slate-800 bg-white"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Render Selected Document Template */}
            
            {/* 1. សៀវភៅបញ្ជីសារពើភណ្ឌទ្រព្យសម្បត្តិរដ្ឋ */}
            {selectedDoc === 'INVENTORY_BOOK' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    សៀវភៅបញ្ជីសារពើភណ្ឌទ្រព្យសម្បត្តិរដ្ឋផ្លូវការ
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px]">
                        <th className="border border-slate-400 p-1.5 text-center font-bold">ល.រ</th>
                        <th className="border border-slate-400 p-1.5 text-center font-bold">រូបភាព</th>
                        <th className="border border-slate-400 p-1.5 text-left font-bold">លេខកូដ</th>
                        <th className="border border-slate-400 p-1.5 text-left font-bold">ប្រភេទចាត់ថ្នាក់</th>
                        <th className="border border-slate-400 p-1.5 text-left font-bold">បរិយាយ(ឈ្មោះទ្រព្យ)</th>
                        <th className="border border-slate-400 p-1.5 text-center font-bold">កាលបរិច្ឆេទប្រើប្រាស់</th>
                        <th className="border border-slate-400 p-1.5 text-left font-bold">អត្តសញ្ញាណកម្ម[ឈ្មោះអ្នកផលិត,ឈ្មោះសម្គាល់,លេខតាមធុន]</th>
                        <th className="border border-slate-400 p-1.5 text-center font-bold">បរិមាណ</th>
                        <th className="border border-slate-400 p-1.5 text-right font-bold">តម្លៃឯកតា(រៀល)</th>
                        <th className="border border-slate-400 p-1.5 text-right font-bold">តម្លៃ(រៀល)</th>
                        <th className="border border-slate-400 p-1.5 text-center font-bold">ស្ថានភាព</th>
                        <th className="border border-slate-400 p-1.5 text-left font-bold">អ្នកទទួលខុសត្រូវ</th>
                        <th className="border border-slate-400 p-1.5 text-left font-bold">ផ្សេងៗ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((a, i) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="border border-slate-400 p-1.5 text-center font-bold text-slate-500">{formatKhmerNumber(i + 1)}</td>
                          <td className="border border-slate-400 p-1 text-center">
                            {a.imageData ? (
                              <img
                                src={a.imageData}
                                alt={a.name}
                                className="h-8 w-8 object-cover rounded mx-auto border border-slate-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="border border-slate-400 p-1.5 font-mono text-slate-700 font-bold">{a.code}</td>
                          <td className="border border-slate-400 p-1.5 font-medium text-slate-600">{CATEGORIES.find(c => c.id === a.category)?.name || a.category}</td>
                          <td className="border border-slate-400 p-1.5 font-bold text-slate-800">{a.name}</td>
                          <td className="border border-slate-400 p-1.5 text-center text-slate-600">{a.dateReceived ? formatKhmerNumber(a.dateReceived) : 'N/A'}</td>
                          <td className="border border-slate-400 p-1.5 font-mono text-slate-600">{a.serialNumber || 'N/A'}</td>
                          <td className="border border-slate-400 p-1.5 text-center font-bold text-slate-800">{formatKhmerNumber(a.quantity)}</td>
                          <td className="border border-slate-400 p-1.5 text-right font-semibold text-slate-700">{formatCurrencyKhmer(a.cost)}</td>
                          <td className="border border-slate-400 p-1.5 text-right font-bold text-emerald-800">{formatCurrencyKhmer(a.cost * a.quantity)}</td>
                          <td className="border border-slate-400 p-1.5 text-center">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {a.status}
                            </span>
                          </td>
                          <td className="border border-slate-400 p-1.5 font-semibold text-slate-800">{a.responsiblePerson}</td>
                          <td className="border border-slate-400 p-1.5 text-slate-500 text-[10px]">{getOfficeName(a.officeId)} | {a.budgetSource}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 text-right text-xs text-slate-500">
                  <p>សរុបទ្រព្យសរុបទាំងអស់ចំនួន៖ {formatKhmerNumber(assets.length)} មុខ</p>
                  <p className="font-bold text-slate-800">សរុបតម្លៃប៉ាន់ស្មានរួម៖ {formatCurrencyKhmer(assets.reduce((sum, current) => sum + (current.cost * current.quantity), 0))}</p>
                </div>
              </div>
            )}

            {/* 2. ប័ណ្ណទ្រព្យសម្បត្តិ (Asset Card) */}
            {selectedDoc === 'ASSET_CARD' && selectedAsset && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    ប័ណ្ណសម្គាល់ទ្រព្យសម្បត្តិរដ្ឋ (ASSET CARD)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">ព័ត៌មានលម្អិតអំពីសម្ភារៈសារពើភណ្ឌឯកត្តជន</p>
                </div>

                <div className="border-2 border-dashed border-slate-400 p-6 rounded-xl space-y-4 max-w-xl mx-auto bg-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-indigo-600 text-lg">កូដ៖ {selectedAsset.code}</span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        {CATEGORIES.find(c => c.id === selectedAsset.category)?.name}
                      </span>
                    </div>
                    <div className="w-full sm:w-auto sm:min-w-[140px] max-w-[180px]">
                      <Barcode value={selectedAsset.code} height={40} showText={false} showDownloadButton={true} className="border-none shadow-none p-0 bg-transparent" />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mt-4">
                    {selectedAsset.imageData && (
                      <div className="flex-shrink-0 flex flex-col items-center justify-center p-2 border border-slate-200 rounded-xl bg-slate-50 w-32 h-32 mx-auto">
                        <img
                          src={selectedAsset.imageData}
                          alt={selectedAsset.name}
                          className="h-28 w-28 object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex-1 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 font-semibold uppercase">ឈ្មោះឧបករណ៍/ទ្រព្យ</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedAsset.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">បរិមាណដែលមាន</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{formatKhmerNumber(selectedAsset.quantity)} ឯកតា</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">តម្លៃដើមក្នុងមួយឯកតា</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{formatCurrencyKhmer(selectedAsset.cost)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">ថ្ងៃខែឆ្នាំទទួល</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{formatKhmerNumber(selectedAsset.dateReceived)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">ប្រភពថវិការៀបចំ</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedAsset.budgetSource}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">ការិយាល័យកាន់កាប់</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{getOfficeName(selectedAsset.officeId)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 font-semibold uppercase">អ្នកទទួលខុសត្រូវបច្ចុប្បន្ន</p>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedAsset.responsiblePerson}</p>
                    </div>

                    {selectedAsset.isICT && (
                      <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 mt-2">
                        <p className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">លក្ខណៈបច្ចេកវិទ្យាព័ត៌មាន (ICT Spec)</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <p><span className="text-slate-400">Serial Number:</span> <span className="font-mono text-slate-800 font-semibold">{selectedAsset.serialNumber || 'N/A'}</span></p>
                          <p><span className="text-slate-400">IP Address:</span> <span className="font-mono text-slate-800 font-semibold">{selectedAsset.ipAddress || 'N/A'}</span></p>
                          <p className="col-span-2"><span className="text-slate-400">ស្ថានភាពការធានា:</span> <span className="font-semibold text-emerald-700">{selectedAsset.warranty || 'N/A'}</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <div className="text-center w-28">
                      <p className="text-[10px] text-slate-400 font-semibold">ស្នាមមេដៃ/ហត្ថលេខា</p>
                      <div className="h-12 border-b border-slate-200"></div>
                      <p className="text-[10px] text-slate-600 mt-1 font-semibold">អ្នកកាន់កាប់ផ្ទាល់</p>
                    </div>
                    <div className="text-center w-28">
                      <p className="text-[10px] text-slate-400 font-semibold font-bold">ត្រាអនុម័ត</p>
                      <div className="h-12 border-b border-slate-200"></div>
                      <p className="text-[10px] text-slate-600 mt-1 font-semibold">ប្រធានការិយាល័យ</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. បញ្ជីប្រគល់-ទទួល (Handover Form) */}
            {selectedDoc === 'HANDOVER' && selectedHandover && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    លិខិតប្រគល់-ទទួលទ្រព្យសម្បត្តិរដ្ឋផ្លូវការ
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">សម្រាប់ចាត់ចែងបុគ្គលិកប្រើប្រាស់ក្នុងការិយាល័យ</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <p className="indent-8 font-normal leading-relaxed text-slate-800">
                    យោងតាមតម្រូវការការងារជាក់ស្តែងក្នុងការិយាល័យ និងផែនការគ្រប់គ្រងសម្ភារៈប្រើប្រាស់របស់នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា ថ្ងៃនេះមានការរៀបចំប្រគល់ និងទទួលទ្រព្យសម្បត្តិដូចខាងក្រោម៖
                  </p>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-3 bg-slate-50/50">
                    <h4 className="font-bold text-slate-950 text-sm border-b border-slate-200 pb-1.5">១. ព័ត៌មានទ្រព្យសម្បត្តិដែលប្រគល់ជូន៖</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p><span className="text-slate-400 font-semibold">ឈ្មោះទ្រព្យសម្បត្តិ៖</span> <span className="font-bold text-slate-900">{selectedHandover.assetName}</span></p>
                      <p><span className="text-slate-400 font-semibold">លេខកូដទ្រព្យសម្បត្តិ៖</span> <span className="font-mono text-indigo-700 font-bold">{selectedHandover.assetCode}</span></p>
                      <p><span className="text-slate-400 font-semibold">ស្ថានភាពពេលប្រគល់៖</span> <span className="font-medium text-emerald-800">{selectedHandover.status}</span></p>
                      <p><span className="text-slate-400 font-semibold">កាលបរិច្ឆេទប្រគល់៖</span> <span className="font-medium text-slate-800">{formatKhmerNumber(selectedHandover.handoverDate)}</span></p>
                    </div>
                  </div>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-3 bg-slate-50/50">
                    <h4 className="font-bold text-slate-950 text-sm border-b border-slate-200 pb-1.5">២. ព័ត៌មានភាគីពាក់ព័ន្ធ៖</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p><span className="text-slate-400 font-semibold">ភាគីអ្នកប្រគល់ (តំណាងនាយកដ្ឋាន)៖</span> <span className="font-bold text-slate-800">{selectedHandover.giverName}</span></p>
                      <p><span className="text-slate-400 font-semibold">ភាគីអ្នកទទួល (មន្ត្រីប្រើប្រាស់)៖</span> <span className="font-bold text-slate-800">{selectedHandover.receiverName}</span></p>
                    </div>
                  </div>

                  <p className="indent-8 font-normal leading-relaxed text-slate-800">
                    ភាគីទាំងពីរបានព្រមព្រៀង និងពិនិត្យឃើញថាឧបករណ៍ខាងលើពិតជាមានលក្ខណៈបច្ចេកទេសត្រឹមត្រូវ ដំណើរការល្អ និងមានបរិមាណគ្រប់គ្រាន់ដូចបានកត់ត្រាពិតប្រាកដមែន។ អ្នកទទួលការខុសត្រូវសន្យាថានឹងថែរក្សា ការពារ និងប្រើប្រាស់ឧបករណ៍នេះឱ្យចំគោលដៅការងារនាយកដ្ឋាន។
                  </p>
                </div>
              </div>
            )}

            {/* 4. បញ្ជីផ្ទេរទ្រព្យសម្បត្តិ (Transfer Form) */}
            {selectedDoc === 'TRANSFER' && selectedMovement && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    លិខិតផ្ទេរទីតាំង ឬចលនាទ្រព្យសម្បត្តិរដ្ឋ
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">សម្រាប់កត់ត្រាចរាចរណ៍ទ្រព្យសម្បត្តិរវាងការិយាល័យចំណុះ</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <p className="indent-8 font-normal leading-relaxed">
                    ផ្អែកលើការស្នើសុំផ្ទេរប្តូរទីតាំងប្រើប្រាស់ និងចលនាទ្រព្យសម្បត្តិរដ្ឋដើម្បីធានាតុល្យភាពការងារការិយាល័យ និងប្រើប្រាស់ឱ្យអស់លទ្ធភាព នាយកដ្ឋានសម្រេចអនុញ្ញាតឱ្យផ្ទេរដូចខាងក្រោម៖
                  </p>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-3 bg-slate-50/50">
                    <h4 className="font-bold text-slate-950 text-sm border-b border-slate-200 pb-1.5">១. ព័ត៌មានទ្រព្យសម្បត្តិផ្ទេរ៖</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p><span className="text-slate-400 font-semibold">ឈ្មោះទ្រព្យសម្បត្តិ៖</span> <span className="font-bold text-slate-950">{selectedMovement.assetName}</span></p>
                      <p><span className="text-slate-400 font-semibold">លេខកូដទ្រព្យសម្បត្តិ៖</span> <span className="font-mono text-indigo-700 font-bold">{selectedMovement.assetCode}</span></p>
                      <p><span className="text-slate-400 font-semibold">ប្រភេទចលនា៖</span> <span className="font-bold text-amber-700">{selectedMovement.type}</span></p>
                      <p><span className="text-slate-400 font-semibold">កាលបរិច្ឆេទផ្ទេរចលនា៖</span> <span className="font-medium text-slate-800">{formatKhmerNumber(selectedMovement.date)}</span></p>
                    </div>
                  </div>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-3 bg-slate-50/50">
                    <h4 className="font-bold text-slate-950 text-sm border-b border-slate-200 pb-1.5">២. ព័ត៌មានការិយាល័យផ្ទេរ-ទទួល៖</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p><span className="text-slate-400 font-semibold">ផ្ទេរចេញពី៖</span> <span className="font-bold text-slate-800">{getOfficeName(selectedMovement.fromOfficeId)}</span></p>
                      <p><span className="text-slate-400 font-semibold">ផ្ទេរចូលទៅកាន់៖</span> <span className="font-bold text-slate-800">{getOfficeName(selectedMovement.toOfficeId)}</span></p>
                      <p className="col-span-2"><span className="text-slate-400 font-semibold">អ្នកគ្រប់គ្រងទទួលខុសត្រូវថ្មី៖</span> <span className="font-bold text-indigo-800">{selectedMovement.responsiblePerson}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. បញ្ជីជួសជុល (Repair Form) */}
            {selectedDoc === 'REPAIR' && selectedRepair && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    លិខិតស្នើសុំ និងបញ្ជាក់ការជួសជុលទ្រព្យសម្បត្តិ
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">សម្រាប់កត់ត្រាហិរញ្ញវត្ថុជួសជុលថែទាំទ្រព្យសម្បត្តិរដ្ឋ</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <p className="indent-8 font-normal leading-relaxed">
                    តាមការពិនិត្យស្ថានភាពជាក់ស្តែងនៃឧបករណ៍ប្រើប្រាស់បច្ចេកវិទ្យា និងគ្រឿងសង្ហារិមរបស់នាយកដ្ឋានដែលមានភាពរអាក់រអួល និងការខូចខាតស្រាល ថ្ងៃនេះមានការជួសជុលឧបករណ៍ដូចខាងក្រោម៖
                  </p>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-3 bg-slate-50/50">
                    <h4 className="font-bold text-slate-950 text-sm border-b border-slate-200 pb-1.5">១. ព័ត៌មានឧបករណ៍ជួសជុល៖</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p><span className="text-slate-400 font-semibold">ឈ្មោះទ្រព្យសម្បត្តិ៖</span> <span className="font-bold text-slate-950">{selectedRepair.assetName}</span></p>
                      <p><span className="text-slate-400 font-semibold">លេខកូដសម្គាល់៖</span> <span className="font-mono text-indigo-700 font-bold">{selectedRepair.assetCode}</span></p>
                    </div>
                  </div>

                  <div className="border border-slate-300 p-4 rounded-xl space-y-3 bg-slate-50/50">
                    <h4 className="font-bold text-slate-950 text-sm border-b border-slate-200 pb-1.5">២. ព័ត៌មានលម្អិតអំពីការជួសជុល៖</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p><span className="text-slate-400 font-semibold">កាលបរិច្ឆេទជួសជុល៖</span> <span className="font-medium text-slate-800">{formatKhmerNumber(selectedRepair.repairDate)}</span></p>
                      <p><span className="text-slate-400 font-semibold">ប្រភេទសេវាកម្ម/ជួសជុល៖</span> <span className="font-bold text-indigo-900">{selectedRepair.repairType}</span></p>
                      <p><span className="text-slate-400 font-semibold">ថ្លៃសេវាជួសជុលសរុប៖</span> <span className="font-bold text-amber-700 text-sm">{formatCurrencyKhmer(selectedRepair.cost)}</span></p>
                      <p><span className="text-slate-400 font-semibold">ដៃគូ/អ្នកផ្គត់ផ្គង់សេវាកម្ម៖</span> <span className="font-bold text-slate-800">{selectedRepair.provider}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. បញ្ជីកាត់ចេញ (Write-off Form) */}
            {selectedDoc === 'WRITE_OFF' && selectedWriteOff && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    លិខិតស្នើសុំកាត់ចេញពីបញ្ជីសារពើភណ្ឌរដ្ឋ (WRITE-OFF)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">ចំពោះឧបករណ៍ដែលហួសអាយុកាល ខូចមិនអាចជួសជុល ឬបាត់បង់</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <p className="indent-8 font-normal leading-relaxed">
                    យោងតាមលក្ខន្តិកៈគ្រប់គ្រងទ្រព្យសម្បត្តិសាធារណៈរបស់ក្រសួង និងរបាយការណ៍បច្ចេកទេសពិនិត្យស្ថានភាពឧបករណ៍របស់នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា ថ្ងៃនេះយើងខ្ញុំសូមគោរពស្នើសុំកាត់ចេញពីបញ្ជីសារពើភណ្ឌនូវឧបករណ៍៖
                  </p>

                  <div className="border-2 border-red-200 bg-red-50/10 p-5 rounded-xl space-y-3">
                    <h4 className="font-bold text-red-900 text-sm border-b border-red-200 pb-1.5">ព័ត៌មានទ្រព្យសម្បត្តិដែលត្រូវកាត់រំលាយចេញ៖</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <p><span className="text-slate-400 font-semibold">ឈ្មោះទ្រព្យសម្បត្តិ៖</span> <span className="font-bold text-slate-950">{selectedWriteOff.assetName}</span></p>
                      <p><span className="text-slate-400 font-semibold">លេខកូដសម្គាល់៖</span> <span className="font-mono text-red-700 font-bold">{selectedWriteOff.assetCode}</span></p>
                      <p><span className="text-slate-400 font-semibold">មូលហេតុកាត់ចេញ៖</span> <span className="font-bold text-red-700">{selectedWriteOff.reason}</span></p>
                      <p><span className="text-slate-400 font-semibold">កាលបរិច្ឆេទស្នើសុំ៖</span> <span className="font-medium text-slate-800">{formatKhmerNumber(selectedWriteOff.requestDate)}</span></p>
                      <p><span className="text-slate-400 font-semibold">ស្ថានភាពសំណើបច្ចុប្បន្ន៖</span> <span className="font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{selectedWriteOff.status}</span></p>
                    </div>
                    {selectedWriteOff.notes && (
                      <div className="mt-2 text-slate-600 bg-white p-2 rounded border border-red-100 text-[11px]">
                        <span className="font-semibold text-slate-700">កំណត់សម្គាល់ឯកសារភ្ជាប់៖</span> {selectedWriteOff.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 7. របាយការណ៍សារពើភណ្ឌប្រចាំឆ្នាំ (Annual Report) */}
            {selectedDoc === 'ANNUAL_REPORT' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    របាយការណ៍បូកសរុបលទ្ធផលរាប់សារពើភណ្ឌប្រចាំឆ្នាំ
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">គណៈកម្មការត្រួតពិនិត្យទ្រព្យសម្បត្តិរដ្ឋ ថ្នាក់នាយកដ្ឋាន</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <p className="indent-8 font-normal leading-relaxed text-slate-800">
                    ដើម្បីធានាបាននូវការគ្រប់គ្រងទ្រព្យសម្បត្តិរដ្ឋប្រកបដោយតម្លាភាព គណនេយ្យភាព និងប្រសិទ្ធភាពខ្ពស់ គណៈកម្មការរៀបចំការត្រួតពិនិត្យ និងរាប់ជាក់ស្តែងនូវរាល់គ្រឿងសង្ហារិម ឧបករណ៍បច្ចេកវិទ្យា និងឯកសារផ្សេងៗទាំងអស់។ លទ្ធផលផ្ទៀងផ្ទាត់ទទួលបានដូចខាងក្រោម៖
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-400 text-[11px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-400 p-2 text-center font-bold">ល.រ</th>
                          <th className="border border-slate-400 p-2 text-left font-bold">លេខកូដ</th>
                          <th className="border border-slate-400 p-2 text-left font-bold">ឈ្មោះទ្រព្យ</th>
                          <th className="border border-slate-400 p-2 text-center font-bold">ចំនួនក្នុងបញ្ជី</th>
                          <th className="border border-slate-400 p-2 text-center font-bold">ចំនួនជាក់ស្តែង</th>
                          <th className="border border-slate-400 p-2 text-center font-bold">លើស/ខ្វះ</th>
                          <th className="border border-slate-400 p-2 text-left font-bold">អនុសាសន៍គណៈកម្មការ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audits.map((ad, index) => (
                          <tr key={ad.id} className="hover:bg-slate-50">
                            <td className="border border-slate-400 p-2 text-center">{formatKhmerNumber(index + 1)}</td>
                            <td className="border border-slate-400 p-2 font-mono text-slate-700 font-semibold">{ad.assetCode}</td>
                            <td className="border border-slate-400 p-2 font-semibold text-slate-900">{ad.assetName}</td>
                            <td className="border border-slate-400 p-2 text-center font-medium">{formatKhmerNumber(ad.registeredQty)}</td>
                            <td className="border border-slate-400 p-2 text-center font-medium">{formatKhmerNumber(ad.actualQty)}</td>
                            <td className={`border border-slate-400 p-2 text-center font-bold ${ad.diff < 0 ? 'text-red-600' : ad.diff > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {ad.diff === 0 ? 'ស្មើ' : formatKhmerNumber(ad.diff)}
                            </td>
                            <td className="border border-slate-400 p-2 text-slate-600 italic">{ad.recommendations}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                    <p className="font-bold text-slate-800 text-xs">សេចក្តីសន្និដ្ឋានទូទៅ៖</p>
                    <p className="text-slate-600 leading-normal">
                      ជាលទ្ធផលរួម៖ សម្ភារៈទ្រព្យសម្បត្តិភាគច្រើនគឺត្រូវបានប្រើប្រាស់ត្រូវតាមការិយាល័យ និងមានអ្នកទទួលខុសត្រូវខ្ពស់។ គណៈកម្មការសូមណែនាំឱ្យរាល់ការិយាល័យរៀបចំលិខិតចលនា ឬលិខិតផ្ទេរទ្រព្យឱ្យបានច្បាស់លាស់ និងទាន់ពេលវេលា រាល់ពេលផ្ទេរប្តូរទីតាំងចៀសវាងភាពមិនស៊ីគ្នាក្នុងបញ្ជីសារពើភណ្ឌរួម។
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. បញ្ជី Stock Card (Consumables Stock Card) */}
            {selectedDoc === 'STOCK_CARD' && selectedStock && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    កាតគ្រឿនសន្និធិប្រើប្រាស់អស់ (STOCK CARD)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">បញ្ជីគ្រប់គ្រងលំហូរចូល-ចេញសម្ភារៈការិយាល័យ</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3 font-semibold text-slate-800">
                    <p>ឈ្មោះសម្ភារៈ៖ <span className="font-bold text-indigo-700 text-sm">{selectedStock.name}</span></p>
                    <p>ឯកតាសម្គាល់៖ <span className="font-bold text-slate-950">{selectedStock.unit}</span></p>
                    <p>កម្រិតសុវត្ថិភាពអប្បបរមា៖ <span className="font-bold text-red-700">{formatKhmerNumber(selectedStock.minStock)}</span></p>
                    <p>សមតុល្យសម្ភារៈបច្ចុប្បន្ន៖ <span className="font-bold text-emerald-700 text-sm">{formatKhmerNumber(selectedStock.currentBalance)}</span></p>
                  </div>

                  <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider">ប្រវត្តិប្រតិបត្តិការស្តុក៖</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-400 text-xs">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="border border-slate-400 p-2 text-center font-bold">កាលបរិច្ឆេទ</th>
                          <th className="border border-slate-400 p-2 text-center font-bold">ប្រភេទប្រតិបត្តិការ</th>
                          <th className="border border-slate-400 p-2 text-center font-bold">បរិមាណ</th>
                          <th className="border border-slate-400 p-2 text-center font-bold">សមតុល្យដែលសល់</th>
                          <th className="border border-slate-400 p-2 text-left font-bold">អ្នកទទួល/អ្នកប្រគល់</th>
                          <th className="border border-slate-400 p-2 text-left font-bold">ឯកសារយោង</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockTransactions.filter(tx => tx.itemId === selectedStock.id).map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="border border-slate-400 p-2 text-center">{formatKhmerNumber(tx.date)}</td>
                            <td className="border border-slate-400 p-2 text-center">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {tx.type === 'IN' ? 'ចូល (IN)' : 'ចេញ (OUT)'}
                              </span>
                            </td>
                            <td className="border border-slate-400 p-2 text-center font-bold">{formatKhmerNumber(tx.quantity)}</td>
                            <td className="border border-slate-400 p-2 text-center font-medium text-indigo-700">{formatKhmerNumber(tx.balanceAfter)}</td>
                            <td className="border border-slate-400 p-2 font-medium">{tx.receiverOrGiver}</td>
                            <td className="border border-slate-400 p-2 text-slate-500 font-mono text-[11px]">{tx.referenceDoc}</td>
                          </tr>
                        ))}
                        {stockTransactions.filter(tx => tx.itemId === selectedStock.id).length === 0 && (
                          <tr>
                            <td colSpan={6} className="border border-slate-400 p-4 text-center text-slate-400 italic">មិនទាន់មានចលនាប្រតិបត្តិការស្តុកនៅឡើយទេ</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9. ម៉ាស៊ីនបង្កើតបាកូដគំរូ (Barcode Generator) */}
            {selectedDoc === 'BARCODE_GENERATOR' && (
              <div>
                <div className="text-center mb-6 no-print">
                  <h2 className="text-xl font-bold tracking-wide text-slate-900 leading-normal" style={{ fontFamily: "'Moul', 'Khmer', serif" }}>
                    ម៉ាស៊ីនបង្កើត និងបោះពុម្ពបាកូដសម្ភារៈ (BARCODE GENERATOR)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">គ្រប់គ្រង និងបោះពុម្ពស្លាកបាកូដសម្រាប់បិទលើទ្រព្យសម្បត្តិ</p>
                </div>

                {barcodeViewMode === 'SINGLE' ? (
                  <div className="max-w-md mx-auto border-2 border-dashed border-slate-300 p-8 rounded-2xl bg-white text-center space-y-6 shadow-xs">
                    <div className="border-b border-slate-100 pb-4">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ព្រះរាជាណាចក្រកម្ពុជា</p>
                      <p className="text-[10px] text-slate-400 font-semibold">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    </div>

                    <div className="py-4 flex justify-center">
                      <Barcode
                        value={barcodeInputValue || 'DCD-TECH-001'}
                        height={barcodeHeight}
                        showText={barcodeShowText}
                        showDownloadButton={true}
                        className="border-none shadow-none p-0 bg-transparent"
                      />
                    </div>

                    <div className="text-left bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">ព័ត៌មានលម្អិតស្លាក (Label Details)</p>
                      {assets.find(a => a.code === barcodeInputValue) ? (
                        (() => {
                          const matchedAsset = assets.find(a => a.code === barcodeInputValue)!;
                          return (
                            <>
                              <p className="font-bold text-slate-800 text-sm">{matchedAsset.name}</p>
                              <div className="grid grid-cols-2 gap-2 text-slate-600">
                                <p><span className="text-slate-400">ការិយាល័យ៖</span> <span className="font-semibold">{getOfficeName(matchedAsset.officeId)}</span></p>
                                <p><span className="text-slate-400">អ្នកទទួលខុសត្រូវ៖</span> <span className="font-semibold">{matchedAsset.responsiblePerson}</span></p>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <p className="text-slate-500 italic">ស្លាកកូដគំរូសេរី (គ្មានព័ត៌មានទ្រព្យសម្បត្តិក្នុងប្រព័ន្ធ)</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Grid layout for Batch Barcodes */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {assets
                        .filter(a => {
                          const matchOffice = barcodeBatchOffice === 'ALL' || a.officeId === barcodeBatchOffice;
                          const matchCategory = barcodeBatchCategory === 'ALL' || a.category === barcodeBatchCategory;
                          return matchOffice && matchCategory;
                        })
                        .map(a => (
                          <div key={a.id} className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col items-center justify-between text-center space-y-2 hover:shadow-xs transition-shadow">
                            <div className="w-full text-left pb-1 border-b border-slate-100">
                              <p className="font-bold text-slate-800 text-[11px] truncate" title={a.name}>{a.name}</p>
                              <p className="text-[9px] text-slate-400 font-semibold truncate">{getOfficeName(a.officeId)}</p>
                            </div>
                            <div className="py-2 w-full flex justify-center">
                              <Barcode
                                value={a.code}
                                height={barcodeHeight}
                                showText={barcodeShowText}
                                showDownloadButton={true}
                                className="border-none shadow-none p-0 bg-transparent"
                              />
                            </div>
                          </div>
                        ))}
                      {assets.filter(a => {
                        const matchOffice = barcodeBatchOffice === 'ALL' || a.officeId === barcodeBatchOffice;
                        const matchCategory = barcodeBatchCategory === 'ALL' || a.category === barcodeBatchCategory;
                        return matchOffice && matchCategory;
                      }).length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-400 italic">
                          មិនមានសម្ភារៈណាត្រូវនឹងលក្ខខណ្ឌចម្រោះឡើយ
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Signature Block (Ministerial/Office Signatures Footer) */}
            {selectedDoc !== 'BARCODE_GENERATOR' && selectedDoc !== 'ASSET_CARD' && (
              <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">រៀបចំដោយ</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">មន្ត្រីគ្រប់គ្រងសារពើភណ្ឌ</p>
                  <div className="h-16 font-medium text-slate-300 flex items-end justify-center pb-2">ហត្ថលេខា</div>
                  <p className="font-medium text-slate-700 min-h-[1.25rem]">
                    {preparedByName || '............................'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">បានពិនិត្យ និងត្រឹមត្រូវ</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">ប្រធានការិយាល័យគ្រប់គ្រងទូទៅ</p>
                  <div className="h-16 font-medium text-slate-300 flex items-end justify-center pb-2">ហត្ថលេខា</div>
                  <p className="font-medium text-slate-700 min-h-[1.25rem]">
                    {checkedByName || '............................'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">ការអនុម័តចុងក្រោយ</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">ប្រធាននាយកដ្ឋាន</p>
                  <div className="h-16 font-medium text-slate-300 flex items-end justify-center pb-2">ហត្ថលេខា និងត្រា</div>
                  <p className="font-bold text-slate-950 min-h-[1.25rem]">
                    {approvedByName || '............................'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">កាលបរិច្ឆេទ៖ {formatKhmerDate(signDate)}</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
