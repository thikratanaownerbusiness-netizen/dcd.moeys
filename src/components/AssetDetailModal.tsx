/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Asset, HandoverRecord, MovementRecord, MaintenanceRecord, AnnualAuditRecord } from '../types';
import { OFFICES, CATEGORIES } from '../data/mockData';
import { X, Calendar, Clipboard, User, ShieldAlert, Hammer, MapPin, Printer, Paperclip, FileSpreadsheet, FileText } from 'lucide-react';
import { Language, translations, getOfficeName as translateOffice, getCategoryName as translateCategory } from '../data/translations';
import Barcode from './Barcode';

interface AssetDetailModalProps {
  asset: Asset;
  handovers: HandoverRecord[];
  movements: MovementRecord[];
  maintenance: MaintenanceRecord[];
  audits: AnnualAuditRecord[];
  onClose: () => void;
  onPrintCard: (assetId: string) => void;
  lang: Language;
}

export default function AssetDetailModal({
  asset,
  handovers,
  movements,
  maintenance,
  audits,
  onClose,
  onPrintCard,
  lang
}: AssetDetailModalProps) {
  
  // Find relative logs for this specific asset
  const assetHandovers = handovers.filter(h => h.assetId === asset.id || h.assetCode === asset.code);
  const assetMovements = movements.filter(m => m.assetId === asset.id || m.assetCode === asset.code);
  const assetRepairs = maintenance.filter(r => r.assetId === asset.id || r.assetCode === asset.code);
  const assetAudits = audits.filter(a => a.assetId === asset.id || a.assetCode === asset.code);

  const getOfficeName = (officeId: string) => {
    return translateOffice(officeId, lang);
  };

  const getCategoryName = (catId: string) => {
    return translateCategory(catId, lang);
  };

  const translateText = (text: string): string => {
    if (lang === 'KM') return text;
    
    const kmToEnMap: Record<string, string> = {
      'លម្អិតសម្ភារៈសារពើភណ្ឌ': 'Asset Inventory Details',
      'បោះពុម្ពប័ណ្ណទ្រព្យ (Asset Card)': 'Print Asset Card',
      'លេខកូដសម្គាល់ទ្រព្យ (Asset Code)': 'Asset Code',
      'ចាត់ថ្នាក់ប្រភេទទ្រព្យ': 'Asset Category',
      'បរិមាណក្នុងប្រព័ន្ធ': 'Quantity in System',
      'គ្រឿង / ឯកតា': 'units / pieces',
      'តម្លៃប៉ាន់ស្មានដើម': 'Estimated Value (Unit Cost)',
      'តម្លៃដើមប៉ាន់ស្មាន': 'Estimated Value',
      'កាលបរិច្ឆេទទទួល': 'Received Date',
      'ប្រភពថវិការៀបចំ': 'Budget Source',
      'ទីតាំងប្រើប្រាស់បច្ចុប្បន្ន': 'Current Office',
      'អ្នកគ្រប់គ្រងទទួលខុសត្រូវ': 'Custodian',
      'ស្ថានភាពគុណភាពបច្ចុប្បន្ន': 'Current Condition',
      'ប្រវត្តិប្រគល់ឧបករណ៍ (Handover Logs)': 'Handover & Custody Logs',
      'ប្រវត្តិផ្ទេរទីតាំង (Movement Logs)': 'Asset Transfer Logs',
      'ប្រវត្តិថែទាំជួសជុល (Maintenance Logs)': 'Maintenance & Repair Logs',
      'កំណត់ត្រាការពិនិត្យសារពើភណ្ឌ (Physical Audit Logs)': 'Physical Audit Count Logs',
      'ល.រ': 'No.',
      'ឈ្មោះមន្ត្រី': 'Officer Name',
      'កាលបរិច្ឆេទ': 'Date',
      'ស្ថានភាព': 'Condition',
      'អ្នកបញ្ជាក់': 'Verifier',
      'ផ្ទេរពី': 'From',
      'ផ្ទេរទៅ': 'To',
      'ប្រភេទចលនា': 'Transfer Type',
      'អ្នកសម្របសម្រួល': 'Coordinator',
      'ប្រភេទសេវា': 'Service Type',
      'តម្លៃសេវា': 'Service Cost',
      'អ្នកផ្គត់ផ្គង់': 'Provider',
      'ឆ្នាំសវនកម្ម': 'Audit Year',
      'ថ្ងៃរាប់ជាក់ស្តែង': 'Date Audited',
      'គណៈកម្មការ': 'Committee',
      'កម្រិតភាពខុសគ្នា': 'Variance',
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
      'មិនមានប្រវត្តិកំណត់ត្រាសម្រាប់ឧបករណ៍នេះឡើយ': 'No log history exists for this asset.',
      'លេខស៊េរី (Serial Number)': 'Serial Number',
      'អាសយដ្ឋាន IP (IP Address)': 'IP Address',
      'ការធានា (Warranty Status)': 'Warranty Status',
      'ឧបករណ៍ ICT? (ICT Device?)': 'ICT Device?',
      'លក្ខណៈបច្ចេកវិទ្យាព័ត៌មានបន្ថែម (ICT Specifications)': 'ICT Specifications',
      'ប្រវត្តិនៃការប្រគល់-ទទួលបុគ្គលិក': 'Handover & Personnel History',
      'ប្រវត្តិនៃការជួសជុល និងថែទាំ': 'Maintenance & Repair History',
      'ប្រវត្តិនៃចលនា និងការផ្ទេរទីតាំង': 'Asset Location Movement History',
      'ប្រគល់ដោយ៖': 'Giver rep:',
      'កាលបរិច្ឆេទ៖': 'Date:',
      'សេវា៖': 'Service:',
      'អ្នកកាន់កាប់ថ្មី៖': 'New Custodian:',
      'មិនទាន់មានការចាត់តាំងជាឯកត្តជននៅឡើយទេ': 'No assignment records yet',
      'មិនទាន់មានកំណត់ត្រាជួសជុលថែទាំនៅឡើយទេ': 'No repair logs recorded yet',
      'មិនទាន់មានចលនាផ្ទេរប្តូរទីតាំងប្រើប្រាស់នៅឡើយទេ': 'No location movement logs recorded yet',
      'បិទផ្ទាំងនេះ': 'Close Panel'
    };

    return kmToEnMap[text] !== undefined ? kmToEnMap[text] : text;
  };

  // Format helper
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800/80">
          <div className="space-y-0.5">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
              {translateText('លម្អិតសម្ភារៈសារពើភណ្ឌ')}
            </span>
            <h3 className="text-lg font-bold truncate max-w-[500px] text-slate-100">{asset.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintCard(asset.id)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Printer className="h-3.5 w-3.5" />
              {translateText('បោះពុម្ពប័ណ្ណទ្រព្យ (Asset Card)')}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/20 dark:bg-slate-900/40">
          
          {/* Main Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('លេខកូដសម្គាល់ទ្រព្យ (Asset Code)')}
                </p>
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{asset.code}</p>
                <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50 inline-block">
                  <Barcode value={asset.code} height={32} showText={false} showDownloadButton={true} className="border-none shadow-none p-0 bg-transparent" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('ចាត់ថ្នាក់ប្រភេទទ្រព្យ')}
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{getCategoryName(asset.category)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('បរិមាណក្នុងប្រព័ន្ធ')}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatKhmerNumber(asset.quantity)} {translateText('គ្រឿង / ឯកតា')}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-x border-slate-200 dark:border-slate-800 md:px-6">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('តម្លៃដើមប៉ាន់ស្មាន')}
                </p>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{formatCurrencyKhmer(asset.cost)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('កាលបរិច្ឆេទទទួល')}
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{formatKhmerNumber(asset.dateReceived)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('ប្រភពថវិការៀបចំ')}
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">{asset.budgetSource}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('ទីតាំងប្រើប្រាស់បច្ចុប្បន្ន')}
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  {getOfficeName(asset.officeId)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('អ្នកគ្រប់គ្រងទទួលខុសត្រូវ')}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                  <User className="h-4 w-4 text-indigo-500" />
                  {asset.responsiblePerson}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {translateText('ស្ថានភាពគុណភាពបច្ចុប្បន្ន')}
                </p>
                <span className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-full mt-1.5 ${
                  asset.status === 'ល្អ' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' :
                  asset.status === 'មធ្យម' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400' :
                  asset.status === 'ខូចស្រាល' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 animate-pulse' :
                  'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400'
                }`}>
                  {translateText(asset.status)}
                </span>
              </div>
            </div>

            {/* ICT Specifics if applicable */}
            {asset.isICT && (
              <div className="col-span-1 md:col-span-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl space-y-2 mt-2">
                <p className="font-bold text-xs text-indigo-950 dark:text-indigo-300 uppercase tracking-wider border-b border-indigo-100 dark:border-indigo-900/30 pb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {translateText('លក្ខណៈបច្ចេកវិទ្យាព័ត៌មានបន្ថែម (ICT Specifications)')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-1">
                  <p>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">{translateText('លេខស៊េរី (Serial Number)')}:</span>{' '}
                    <span className="font-mono font-bold text-indigo-900 dark:text-indigo-300">{asset.serialNumber || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">{translateText('អាសយដ្ឋាន IP (IP Address)')}:</span>{' '}
                    <span className="font-mono font-bold text-indigo-900 dark:text-indigo-300">{asset.ipAddress || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">{translateText('ការធានា (Warranty Status)')}:</span>{' '}
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{asset.warranty || 'N/A'}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Attachments Section if present */}
            {(asset.imageData || asset.documentData) && (
              <div className="col-span-1 md:col-span-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 mt-4">
                <p className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4 text-indigo-500" />
                  {translateText('ឯកសារភ្ជាប់ និងរូបភាព (Attachments & Reference Docs)')}
                </p>
                <div className="flex flex-wrap gap-4 text-xs mt-2">
                  {asset.imageData && (
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 rounded-lg max-w-sm">
                      <img 
                        src={asset.imageData} 
                        alt="Asset Attachment" 
                        className="h-10 w-10 object-cover rounded-md border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{asset.imageName || 'device_image.jpg'}</span>
                        <a 
                          href={asset.imageData} 
                          download={asset.imageName || 'device_image.jpg'}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                        >
                          {lang === 'KM' ? 'ទាញយករូបភាព' : 'Download Image'}
                        </a>
                      </div>
                    </div>
                  )}

                  {asset.documentData && (
                    <div className="flex items-center gap-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 rounded-lg max-w-sm">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                        {asset.documentName?.endsWith('.xlsx') || asset.documentName?.endsWith('.xls') ? (
                          <FileSpreadsheet className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{asset.documentName || 'reference_doc.docx'}</span>
                        <a 
                          href={asset.documentData} 
                          download={asset.documentName || 'reference_doc.docx'}
                          className="text-[10px] text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                        >
                          {lang === 'KM' ? 'ទាញយកឯកសារ' : 'Download Document'}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Connected History Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Handovers History */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Clipboard className="h-4 w-4 text-indigo-500" />
                {translateText('ប្រវត្តិនៃការប្រគល់-ទទួលបុគ្គលិក')} ({formatKhmerNumber(assetHandovers.length)})
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {assetHandovers.map(h => (
                  <div key={h.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs flex justify-between items-center border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{h.staffName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{translateText('ប្រគល់ដោយ៖')} {h.giverName}</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                      {formatKhmerNumber(h.handoverDate)}
                    </span>
                  </div>
                ))}
                {assetHandovers.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">{translateText('មិនទាន់មានការចាត់តាំងជាឯកត្តជននៅឡើយទេ')}</p>
                )}
              </div>
            </div>

            {/* Repairs History */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Hammer className="h-4 w-4 text-rose-500" />
                {translateText('ប្រវត្តិនៃការជួសជុល និងថែទាំ')} ({formatKhmerNumber(assetRepairs.length)})
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {assetRepairs.map(r => (
                  <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{r.repairType}</p>
                      <span className="font-mono text-[10px] bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded font-bold">
                        {formatCurrencyKhmer(r.cost)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-550 dark:text-slate-400">
                      {translateText('កាលបរិច្ឆេទ៖')} {formatKhmerNumber(r.repairDate)} | {translateText('សេវា៖')} {r.provider}
                    </p>
                  </div>
                ))}
                {assetRepairs.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">{translateText('មិនទាន់មានកំណត់ត្រាជួសជុលថែទាំនៅឡើយទេ')}</p>
                )}
              </div>
            </div>

            {/* Location Movements History */}
            <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 col-span-1 md:col-span-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                {translateText('ប្រវត្តិនៃចលនា និងការផ្ទេរទីតាំង')} ({formatKhmerNumber(assetMovements.length)})
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {assetMovements.map(m => (
                  <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs grid grid-cols-1 md:grid-cols-4 gap-2 items-center border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full">{translateText(m.type)}</span>
                    </div>
                    <div className="text-slate-650 dark:text-slate-300 font-semibold">
                      {getOfficeName(m.fromOfficeId)} ➔ {getOfficeName(m.toOfficeId)}
                    </div>
                    <div className="text-slate-550 dark:text-slate-400 font-medium">
                      {translateText('អ្នកកាន់កាប់ថ្មី៖')} <span className="font-bold text-slate-800 dark:text-slate-200">{m.responsiblePerson}</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {formatKhmerNumber(m.date)}
                    </div>
                  </div>
                ))}
                {assetMovements.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">{translateText('មិនទាន់មានចលនាផ្ទេរប្តូរទីតាំងប្រើប្រាស់នៅឡើយទេ')}</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-850">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
          >
            {translateText('បិទផ្ទាំងនេះ')}
          </button>
        </div>

      </div>
    </div>
  );
}
