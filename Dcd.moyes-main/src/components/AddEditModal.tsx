/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Asset, HandoverRecord, MovementRecord, MaintenanceRecord, DamagedLostRecord, WriteOffRecord, StockItem, AnnualAuditRecord, Office, AssetCategory } from '../types';
import { OFFICES, CATEGORIES } from '../data/mockData';
import { X, Save, Image, FileText, FileSpreadsheet, Paperclip, Trash2, ShieldAlert, Database, Search, LogOut, Lock, Loader2 } from 'lucide-react';
import { Language, translations, getOfficeName as translateOffice, getCategoryName as translateCategory } from '../data/translations';
import { initAuth, googleSignIn, logout } from '../lib/googleAuth';

interface AddEditModalProps {
  registerType: string;
  editItem?: any; // If editing
  assets: Asset[];
  onSave: (data: any) => void;
  onBulkSave?: (data: any[]) => void;
  onClose: () => void;
  lang: Language;
}

export default function AddEditModal({
  registerType,
  editItem,
  assets,
  onSave,
  onBulkSave,
  onClose,
  lang
}: AddEditModalProps) {
  
  // Common states or dynamic initializations based on register type
  const [formData, setFormData] = useState<any>({});
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Document AI parsing states
  const [isParsingDocument, setIsParsingDocument] = useState(false);
  const [parsedAssets, setParsedAssets] = useState<any[] | null>(null);
  const [rawSheets, setRawSheets] = useState<any[] | null>(null);
  const [activeSheetTab, setActiveSheetTab] = useState<number>(0);
  const [previewTab, setPreviewTab] = useState<'CONVERTED' | 'ORIGINAL'>('CONVERTED');
  const [parseError, setParseError] = useState<string | null>(null);

  // Google Workspace API Integration States
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [googleSheetsUrlInput, setGoogleSheetsUrlInput] = useState('');

  // Automatically fetch spreadsheets when logged in
  const fetchRecentSpreadsheets = async (token: string) => {
    setIsLoadingDriveFiles(true);
    setDriveError(null);
    try {
      const q = "mimeType='application/vnd.google-apps.spreadsheet'";
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&orderBy=modifiedTime desc&pageSize=8&fields=files(id,name,modifiedTime)`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Google Drive API error: ${res.statusText}`);
      }
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setDriveError(lang === 'KM' ? 'មិនអាចទាញយកបញ្ជីឯកសារពី Google Drive ឡើយ។' : 'Failed to retrieve spreadsheets from Google Drive.');
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        fetchRecentSpreadsheets(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        fetchRecentSpreadsheets(result.accessToken);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setDriveFiles([]);
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  const parseGoogleSheetData = async (spreadsheetIdOrUrl: string) => {
    if (!googleToken) {
      setParseError(lang === 'KM' ? 'សូមចូលគណនី Google របស់អ្នកជាមុនសិន' : 'Please sign in to Google first.');
      return;
    }

    setIsParsingDocument(true);
    setParseError(null);
    setParsedAssets(null);
    setRawSheets(null);
    setActiveSheetTab(0);
    setPreviewTab('CONVERTED');

    try {
      const response = await fetch("/api/parse-gsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: googleToken,
          googleSheetsUrl: spreadsheetIdOrUrl.includes('/') ? spreadsheetIdOrUrl : undefined,
          spreadsheetId: !spreadsheetIdOrUrl.includes('/') ? spreadsheetIdOrUrl : undefined
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(lang === 'KM' 
          ? `ម៉ាស៊ីនមេបានឆ្លើយតបមកវិញនូវទិន្នន័យមិនត្រឹមត្រូវ (កូដកំហុស៖ ${response.status})។` 
          : `Server returned an invalid non-JSON response (Status: ${response.status}).`
        );
      }

      if (!response.ok || !data.success) {
        if (data.error === "API_KEY_MISSING") {
          setParseError(
            lang === 'KM' 
              ? 'សូមកំណត់រចនាសម្ព័ន្ធ (Configure) GEMINI_API_KEY នៅក្នុងប្រព័ន្ធជាមុនសិន (Settings > Secrets)។' 
              : 'Please configure GEMINI_API_KEY in Settings > Secrets first.'
          );
        } else {
          setParseError(data.message || (lang === 'KM' ? 'មានកំហុសក្នុងការវិភាគសន្លឹកកិច្ចការ Google Sheets' : 'Error parsing Google Sheets'));
        }
      } else {
        const assetsExtracted = data.assets || [];
        setParsedAssets(assetsExtracted);
        setRawSheets(data.rawSheets || null);
        
        // Save the document info to the state
        handleChange('documentName', lang === 'KM' ? 'សន្លឹកកិច្ចការ Google Sheets' : 'Google Sheets Document');
        handleChange('documentData', spreadsheetIdOrUrl); // store sheet ID/URL as documentData to indicate it's linked
        
        if (assetsExtracted.length > 0) {
          autoFillWithAsset(assetsExtracted[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || (
        lang === 'KM' 
          ? 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេដើម្បីវិភាគសន្លឹកកិច្ចការ Google Sheets បានឡើយ។' 
          : 'Unable to connect to server to parse the Google Sheet.'
      ));
    } finally {
      setIsParsingDocument(false);
    }
  };

  const translateText = (text: string): string => {
    if (lang === 'KM') return text;
    
    const kmToEnMap: Record<string, string> = {
      // Modal Headings
      'កែសម្រួលព័ត៌មានលម្អិត': 'Edit Detailed Information',
      'បន្ថែមព័ត៌មានថ្មី': 'Add New Record',
      ' ក្នុងបញ្ជីសារពើភណ្ឌទ្រព្យរដ្ឋ': ' to Asset Inventory',
      ' ក្នុងបញ្ជីប្រគល់-ទទួល': ' to Handover Registry',
      ' ក្នុងបញ្ជីចលនាផ្ទេរទ្រព្យ': ' to Transfer Movement Register',
      ' ក្នុងបញ្ជីជួសជុល និងថែទាំ': ' to Maintenance Register',
      ' ក្នុងបញ្ជីទ្រព្យខូច/បាត់បង់': ' to Incident Register',
      ' ក្នុងបញ្ជីស្នើសុំកាត់ចេញ': ' to Write-off Register',
      ' ក្នុងបញ្ជីសន្និធិសម្ភារៈការិយាល័យ': ' to Supplies Inventory',
      ' ក្នុងបញ្ជីរាប់សារពើភណ្ឌប្រចាំឆ្នាំ': ' to Annual Audit Ledger',
      
      // Fields & Labels
      'លេខកូដសម្គាល់ទ្រព្យ *': 'Asset Code *',
      'ឈ្មោះទ្រព្យសម្បត្តិ *': 'Asset Name *',
      'ប្រភេទទ្រព្យសម្បត្តិ *': 'Asset Category *',
      'ប្រភពថវិការៀបចំ': 'Budget Source',
      'បរិមាណ *': 'Quantity *',
      'តម្លៃដើមប៉ាន់ស្មាន (រៀល) *': 'Estimated Cost (Riels) *',
      'កាលបរិច្ឆេទទទួល *': 'Date Received *',
      'ការិយាល័យប្រើប្រាស់ *': 'Office Location *',
      'អ្នកគ្រប់គ្រងទទួលខុសត្រូវ *': 'Custodian *',
      'ស្ថានភាពឧបករណ៍ *': 'Device Status *',
      'ឧបករណ៍បច្ចេកវិទ្យាព័ត៌មាន និងទំនាក់ទំនង (ICT Device)': 'Information and Communication Technology (ICT) Device',
      'លេខស៊េរី (Serial Number)': 'Serial Number',
      'អាសយដ្ឋាន IP (IP Address)': 'IP Address',
      'សុពលភាពការធានា (Warranty)': 'Warranty Status',
      'ជ្រើសរើសឧបករណ៍ក្នុងសារពើភណ្ឌ *': 'Select Inventory Asset *',
      'កូដឧបករណ៍': 'Device Code',
      'ឈ្មោះបុគ្គលិកទទួលបន្ទុក *': 'Staff Name (Custodian) *',
      'កាលបរិច្ឆេទប្រគល់ *': 'Handover Date *',
      'អ្នកប្រគល់ (តំណាងអង្គភាព) *': 'Giver (Unit Rep) *',
      'អ្នកទទួលផ្ទាល់ (ឈ្មោះមន្ត្រី)': 'Receiver Name (Officer)',
      'ស្ថានភាពពេលប្រគល់-ទទួល *': 'Handover Condition *',
      'ផ្ទេរចេញពីការិយាល័យ *': 'From Office Location *',
      'ផ្ទេរចូលទៅការិយាល័យ *': 'To Office Location *',
      'ប្រភេទនៃចលនាផ្ទេរ *': 'Transfer Type *',
      'កាលបរិច្ឆេទចលនាផ្ទេរ *': 'Transfer Date *',
      'អ្នកទទួលខុសត្រូវថ្មី *': 'New Custodian *',
      'កាលបរិច្ឆេទបញ្ជូនជួសជុល *': 'Date Sent for Repair *',
      'ប្រភេទនៃការជួសជុល (ថែទាំ/ដូរគ្រឿងបន្លាស់) *': 'Repair / Service Type *',
      'ចំណាយសេវាជួសជុល (រៀល) *': 'Repair Cost (Riels) *',
      'អ្នកផ្គត់ផ្គង់សេវាកម្ម/ជាងជួសជុល *': 'Service Provider / Repairman *',
      'ប្រភេទគ្រោះមហន្តរាយ/ការខូចខាត *': 'Type of Incident / Damage *',
      'កាលបរិច្ឆេទកើតឡើង *': 'Incident Date *',
      'មូលហេតុលម្អិត និងកម្រិតខូចខាត *': 'Detailed Cause & Severity *',
      'របាយការណ៍ស៊ើបអង្កេត (បើមាន)': 'Investigation Report (If any)',
      'សំណើដោះស្រាយ/ចំណាត់ការបន្ត *': 'Proposed Solution / Next Action *',
      'មូលហេតុនៃការស្នើសុំកាត់ចេញ *': 'Reason for Write-Off *',
      'កាលបរិច្ឆេទស្នើសុំកាត់ចេញ *': 'Request Date *',
      'ស្ថានភាពសំណើ *': 'Proposal Status *',
      'កំណត់សម្គាល់បន្ថែម/យោងឯកសារ': 'Additional Notes / Doc Reference',
      'ឈ្មោះសម្ភារៈប្រើប្រាស់ *': 'Office Supply Item Name *',
      'ឯកតាសម្គាល់ (ឧ. ប្រអប់, ដើម, កេស) *': 'Unit of Measure (e.g. box, piece, box) *',
      'កម្រិតស្តុកទាបត្រូវព្រមាន *': 'Safety Min Warning Stock Level *',
      'សមតុល្យដែលមានជាក់ស្តែង (ដំបូង)': 'Current Stock Balance (Initial)',
      'ឆ្នាំនៃការរាប់សារពើភណ្ឌជាក់ស្តែង *': 'Audit Physical Count Year *',
      'ឈ្មោះគណៈកម្មការត្រួតពិនិត្យ *': 'Physical Count Audit Committee *',
      'កាលបរិច្ឆេទចុះរាប់ជាក់ស្តែង *': 'Audit Count Date *',
      'បរិមាណដែលមានក្នុងបញ្ជីសារពើភណ្ឌ *': 'Book Stock Quantity *',
      'បរិមាណចុះរាប់ជាក់ស្តែង *': 'Audited Physical Quantity *',
      'ភាពលើសខ្វះ (ខុសគ្នា)': 'Discrepancy (Variance)',
      'អនុសាសន៍ និងយោបល់គណៈកម្មការ': 'Recommendations & Committee Feedback',
      
      // Common Options
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
      'ខូចខាតធ្ងន់ធ្ងរ': 'Major Damage',
      'បាត់បង់ឧបករណ៍': 'Lost Asset',
      
      // Placeholders & Buttons
      'បោះបង់': 'Cancel',
      'រក្សាទុក': 'Save Changes',
      'រក្សាទុកទិន្នន័យ': 'Save Changes',
      'ឈ្មោះមន្ត្រីទទួលបន្ទុក': 'Enter officer custodian name',
      'ឧ. តុធ្វើការឈើប្រណីត': 'e.g. Premium Wooden Table',
      'ឈ្មោះមន្ត្រី': 'Enter officer name',
      'ឈ្មោះមន្ត្រីទទួលផ្ទាល់': 'Enter recipient officer name',
      'បញ្ចូលប្រភេទជួសជុល': 'Enter repair details',
      'ឈ្មោះក្រុមហ៊ុន ឬជាង': 'Enter company or repairer name',
      'រៀបរាប់ពីមូលហេតុបង្ក': 'Describe how the incident happened',
      'រៀបរាប់ពីដំណោះស្រាយ ឬសំណើសុំជំនួស': 'Describe solution or replacement proposal',
      'ឈ្មោះសម្ភារៈ ឧ. ក្រដាស A4': 'Supply name e.g. A4 Paper',
      'កេស': 'box',
      'ប្រអប់': 'pack',
      'ដើម': 'unit',
      'ថវិការដ្ឋ': 'State Budget',
      '-- សូមជ្រើសរើសទ្រព្យសម្បត្តិ --': '-- Please select an asset --',
      'គណៈកម្មការរាប់សារពើភណ្ឌ ថ្នាក់នាយកដ្ឋាន': 'Department Inventory Physical Count Committee',
      'អ៊ុំ សារ៉ាត់ (ប្រធានការិយាល័យ)': 'Oum Sarath (Office Chief)'
    };

    return kmToEnMap[text] !== undefined ? kmToEnMap[text] : text;
  };

  useEffect(() => {
    if (editItem) {
      setFormData({ ...editItem });
    } else {
      // Default empty structures based on register type
      const defaultState: any = {};
      
      if (registerType === 'ASSETS' || registerType === 'ICT') {
        defaultState.code = `DCD-ASSET-${Math.floor(100 + Math.random() * 900)}`;
        defaultState.name = '';
        defaultState.category = registerType === 'ICT' ? 'TECHNOLOGY' : 'FURNITURE';
        defaultState.quantity = 1;
        defaultState.cost = 0;
        defaultState.dateReceived = new Date().toISOString().split('T')[0];
        defaultState.budgetSource = 'ថវិការដ្ឋ';
        defaultState.officeId = 'OFFICE_GEN';
        defaultState.responsiblePerson = '';
        defaultState.status = 'ល្អ';
        defaultState.isICT = registerType === 'ICT';
        defaultState.serialNumber = '';
        defaultState.ipAddress = '';
        defaultState.warranty = '';
      } 
      else if (registerType === 'HANDOVERS') {
        const firstAsset = assets[0];
        defaultState.assetId = firstAsset?.id || '';
        defaultState.assetCode = firstAsset?.code || '';
        defaultState.assetName = firstAsset?.name || '';
        defaultState.staffName = '';
        defaultState.handoverDate = new Date().toISOString().split('T')[0];
        defaultState.giverName = '';
        defaultState.receiverName = '';
        defaultState.status = 'ល្អ';
      } 
      else if (registerType === 'MOVEMENTS') {
        const firstAsset = assets[0];
        defaultState.assetId = firstAsset?.id || '';
        defaultState.assetCode = firstAsset?.code || '';
        defaultState.assetName = firstAsset?.name || '';
        defaultState.fromOfficeId = firstAsset?.officeId || 'OFFICE_GEN';
        defaultState.toOfficeId = 'OFFICE_RES';
        defaultState.type = 'ផ្ទេរជាអចិន្ត្រៃយ៍';
        defaultState.date = new Date().toISOString().split('T')[0];
        defaultState.responsiblePerson = '';
      } 
      else if (registerType === 'MAINTENANCE') {
        const firstAsset = assets[0];
        defaultState.assetId = firstAsset?.id || '';
        defaultState.assetCode = firstAsset?.code || '';
        defaultState.assetName = firstAsset?.name || '';
        defaultState.repairDate = new Date().toISOString().split('T')[0];
        defaultState.repairType = '';
        defaultState.cost = 0;
        defaultState.provider = '';
      } 
      else if (registerType === 'DAMAGED_LOST') {
        const firstAsset = assets[0];
        defaultState.assetId = firstAsset?.id || '';
        defaultState.assetCode = firstAsset?.code || '';
        defaultState.assetName = firstAsset?.name || '';
        defaultState.type = 'ខូចខាតធ្ងន់ធ្ងរ';
        defaultState.date = new Date().toISOString().split('T')[0];
        defaultState.reason = '';
        defaultState.investigationReport = '';
        defaultState.proposal = '';
      } 
      else if (registerType === 'WRITEOFFS') {
        const firstAsset = assets[0];
        defaultState.assetId = firstAsset?.id || '';
        defaultState.assetCode = firstAsset?.code || '';
        defaultState.assetName = firstAsset?.name || '';
        defaultState.reason = 'ខូចមិនអាចជួសជុលបាន';
        defaultState.requestDate = new Date().toISOString().split('T')[0];
        defaultState.status = 'កំពុងពិនិត្យ';
        defaultState.notes = '';
      } 
      else if (registerType === 'STOCK_ITEMS') {
        defaultState.name = '';
        defaultState.unit = 'កេស';
        defaultState.minStock = 5;
        defaultState.currentBalance = 0;
      } 
      else if (registerType === 'AUDITS') {
        const firstAsset = assets[0];
        defaultState.year = '២០២៦';
        defaultState.committee = 'គណៈកម្មការរាប់សារពើភណ្ឌ ថ្នាក់នាយកដ្ឋាន';
        defaultState.auditDate = new Date().toISOString().split('T')[0];
        defaultState.assetId = firstAsset?.id || '';
        defaultState.assetCode = firstAsset?.code || '';
        defaultState.assetName = firstAsset?.name || '';
        defaultState.registeredQty = firstAsset?.quantity || 1;
        defaultState.actualQty = firstAsset?.quantity || 1;
        defaultState.diff = 0;
        defaultState.recommendations = '';
      }

      setFormData(defaultState);
    }
  }, [editItem, registerType, assets]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [key]: value };
      
      // Auto fill asset specs when selecting an asset
      if (key === 'assetId' && (registerType === 'HANDOVERS' || registerType === 'MOVEMENTS' || registerType === 'MAINTENANCE' || registerType === 'DAMAGED_LOST' || registerType === 'WRITEOFFS' || registerType === 'AUDITS')) {
        const matched = assets.find(a => a.id === value);
        if (matched) {
          updated.assetCode = matched.code;
          updated.assetName = matched.name;
          if (registerType === 'MOVEMENTS') {
            updated.fromOfficeId = matched.officeId;
          }
          if (registerType === 'AUDITS') {
            updated.registeredQty = matched.quantity;
            updated.diff = updated.actualQty - matched.quantity;
          }
        }
      }

      if (key === 'actualQty' && registerType === 'AUDITS') {
        updated.diff = value - (updated.registeredQty || 0);
      }

      return updated;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('imageName', file.name);
      handleChange('imageData', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const autoFillWithAsset = (asset: any) => {
    setFormData((prev: any) => ({
      ...prev,
      code: asset.code || prev.code,
      name: asset.name || prev.name,
      category: asset.category || prev.category,
      quantity: asset.quantity !== undefined ? asset.quantity : prev.quantity,
      cost: asset.cost !== undefined ? asset.cost : prev.cost,
      dateReceived: asset.dateReceived || prev.dateReceived,
      budgetSource: asset.budgetSource || prev.budgetSource,
      officeId: asset.officeId || prev.officeId,
      responsiblePerson: asset.responsiblePerson || prev.responsiblePerson,
      status: asset.status || prev.status,
      isICT: asset.category === 'TECHNOLOGY' ? true : (asset.isICT !== undefined ? asset.isICT : prev.isICT),
      serialNumber: asset.serialNumber || prev.serialNumber,
      ipAddress: asset.ipAddress || prev.ipAddress,
      warranty: asset.warranty || prev.warranty,
    }));
  };

  const parseDocumentData = async (fileName: string, fileData: string) => {
    setIsParsingDocument(true);
    setParseError(null);
    setParsedAssets(null);
    setRawSheets(null);
    setActiveSheetTab(0);
    setPreviewTab('CONVERTED');
    try {
      const response = await fetch("/api/parse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileData })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(lang === 'KM' 
          ? `ម៉ាស៊ីនមេបានឆ្លើយតបមកវិញនូវទិន្នន័យមិនត្រឹមត្រូវ (កូដកំហុស៖ ${response.status})។` 
          : `Server returned an invalid non-JSON response (Status: ${response.status}).`
        );
      }

      if (!response.ok || !data.success) {
        if (data.error === "API_KEY_MISSING") {
          setParseError(
            lang === 'KM' 
              ? 'សូមកំណត់រចនាសម្ព័ន្ធ (Configure) GEMINI_API_KEY នៅក្នុងប្រព័ន្ធជាមុនសិន (Settings > Secrets)។' 
              : 'Please configure GEMINI_API_KEY in Settings > Secrets first.'
          );
        } else {
          setParseError(data.message || (lang === 'KM' ? 'មានកំហុសក្នុងការវិភាគឯកសារ' : 'Error parsing document'));
        }
      } else {
        const assetsExtracted = data.assets || [];
        setParsedAssets(assetsExtracted);
        setRawSheets(data.rawSheets || null);
        if (assetsExtracted.length > 0) {
          autoFillWithAsset(assetsExtracted[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || (
        lang === 'KM' 
          ? 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេដើម្បីវិភាគឯកសារបានឡើយ។' 
          : 'Unable to connect to server to parse the document.'
      ));
    } finally {
      setIsParsingDocument(false);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('documentName', file.name);
      handleChange('documentData', reader.result as string);
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if ((registerType === 'ASSETS' || registerType === 'ICT') && (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'docx' || fileExt === 'pdf')) {
        parseDocumentData(file.name, reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderAssetSelector = (label: string) => {
    // Find currently selected asset
    const selectedAsset = assets.find(a => a.id === formData.assetId);
    
    // Filter assets by search query (name or code)
    const filteredAssets = assets.filter(a => {
      const query = assetSearchQuery.toLowerCase();
      return a.code.toLowerCase().includes(query) || a.name.toLowerCase().includes(query);
    });

    return (
      <div className="space-y-2">
        <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">{label}</label>
        
        {selectedAsset ? (
          // Selected Asset Card
          <div className="flex items-center justify-between border border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-xl">
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedAsset.imageData ? (
                <img 
                  src={selectedAsset.imageData} 
                  alt={selectedAsset.name} 
                  className="h-10 w-10 object-cover rounded-lg border border-blue-150 dark:border-blue-900/40" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-10 w-10 bg-blue-100/60 dark:bg-blue-950/40 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                  <Image className="h-5 w-5" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]">{selectedAsset.code}</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{selectedAsset.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'KM' ? 'ទីតាំង៖ ' : 'Location: '} {translateOffice(selectedAsset.officeId, lang)} | {lang === 'KM' ? 'បរិមាណ៖ ' : 'Qty: '} {selectedAsset.quantity}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleChange('assetId', '');
                setAssetSearchQuery('');
              }}
              className="text-[11px] shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-900 hover:text-red-500 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm cursor-pointer"
            >
              {lang === 'KM' ? 'ផ្លាស់ប្តូរ' : 'Change'}
            </button>
          </div>
        ) : (
          // Search Input and List
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={assetSearchQuery}
                onFocus={() => setAssetDropdownOpen(true)}
                onBlur={() => setTimeout(() => setAssetDropdownOpen(false), 200)}
                onChange={(e) => {
                  setAssetSearchQuery(e.target.value);
                  setAssetDropdownOpen(true);
                }}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 pl-9 font-bold text-slate-800 dark:text-slate-100 dark:bg-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50"
                placeholder={lang === 'KM' ? '🔍 ស្វែងរកតាមរយៈកូដ ឬឈ្មោះទ្រព្យសម្បត្តិ...' : '🔍 Search by asset code or name...'}
              />
            </div>
            
            {assetDropdownOpen && (
              <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map(a => (
                    <div
                      key={a.id}
                      onMouseDown={() => {
                        handleChange('assetId', a.id);
                        setAssetDropdownOpen(false);
                        setAssetSearchQuery('');
                      }}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-850/60 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {a.imageData ? (
                          <img 
                            src={a.imageData} 
                            alt={a.name} 
                            className="h-8 w-8 object-cover rounded border border-slate-200 dark:border-slate-800 shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400 shrink-0">
                            <Image className="h-4 w-4" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[10px]">{a.code}</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate">{a.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-bold">
                        {translateOffice(a.officeId, lang)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 dark:text-slate-500 italic">
                    {lang === 'KM' ? 'រកមិនឃើញទ្រព្យសម្បត្តិឡើយ' : 'No assets found'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const validateForm = () => {
    const missingFields: string[] = [];

    const addMissing = (fieldKM: string, isMissing: boolean) => {
      if (isMissing) {
        missingFields.push(lang === 'KM' ? fieldKM : translateText(fieldKM));
      }
    };

    if (registerType === 'ASSETS' || registerType === 'ICT') {
      addMissing('លេខកូដសម្គាល់ទ្រព្យ *', !formData.code);
      addMissing('ឈ្មោះទ្រព្យសម្បត្តិ *', !formData.name);
      addMissing('ប្រភេទទ្រព្យសម្បត្តិ *', !formData.category);
      addMissing('បរិមាណ *', formData.quantity === undefined || formData.quantity === null || formData.quantity <= 0);
      addMissing('តម្លៃដើមប៉ាន់ស្មាន *', formData.cost === undefined || formData.cost === null || formData.cost < 0);
      addMissing('កាលបរិច្ឆេទទទួល *', !formData.dateReceived);
      addMissing('ការិយាល័យប្រើប្រាស់ *', !formData.officeId);
      addMissing('អ្នកគ្រប់គ្រងទទួលខុសត្រូវ *', !formData.responsiblePerson);
      addMissing('ស្ថានភាពឧបករណ៍ *', !formData.status);
    } 
    else if (registerType === 'HANDOVERS') {
      addMissing('ជ្រើសរើសទ្រព្យសម្បត្តិដែលប្រគល់ជូន *', !formData.assetId);
      addMissing('ឈ្មោះបុគ្គលិកប្រើប្រាស់ផ្ទាល់ *', !formData.staffName);
      addMissing('កាលបរិច្ឆេទប្រគល់ *', !formData.handoverDate);
      addMissing('ឈ្មោះអ្នកប្រគល់ *', !formData.giverName);
      addMissing('ឈ្មោះអ្នកទទួល *', !formData.receiverName);
    } 
    else if (registerType === 'MOVEMENTS') {
      addMissing('ជ្រើសរើសទ្រព្យសម្បត្តិដែលចលនា *', !formData.assetId);
      addMissing('ផ្ទេរចូលទៅ (ទីតាំងថ្មី) *', !formData.toOfficeId);
      addMissing('ប្រភេទនៃចលនា *', !formData.type);
      addMissing('អ្នកទទួលខុសត្រូវថ្មី *', !formData.responsiblePerson);
      addMissing('កាលបរិច្ឆេទចលនា *', !formData.date);
    } 
    else if (registerType === 'MAINTENANCE') {
      addMissing('ជ្រើសរើសទ្រព្យសម្បត្តិដែលជួសជុល *', !formData.assetId);
      addMissing('ប្រភេទនៃការជួសជុល *', !formData.repairType);
      addMissing('កាលបរិច្ឆេទជួសជុល *', !formData.repairDate);
      addMissing('តម្លៃសេវាជួសជុលសរុប *', formData.cost === undefined || formData.cost === null || formData.cost < 0);
      addMissing('អ្នកផ្គត់ផ្គង់សេវាកម្ម/ហាង *', !formData.provider);
    } 
    else if (registerType === 'DAMAGED_LOST') {
      addMissing('ជ្រើសរើសទ្រព្យសម្បត្តិដែលខូច/បាត់ *', !formData.assetId);
      addMissing('ប្រភេទគ្រោះមហន្តរាយ *', !formData.type);
      addMissing('កាលបរិច្ឆេទកើតឡើង *', !formData.date);
      addMissing('មូលហេតុខូចខាត ឬបាត់បង់ *', !formData.reason);
      addMissing('សំណើដោះស្រាយជូននាយកដ្ឋាន *', !formData.proposal);
    } 
    else if (registerType === 'WRITEOFFS') {
      addMissing('ជ្រើសរើសទ្រព្យសម្បត្តិដែលត្រូវកាត់ចេញ *', !formData.assetId);
      addMissing('ហេតុផលស្នើសុំកាត់ចេញ *', !formData.reason);
      addMissing('កាលបរិច្ឆេទស្នើសុំ *', !formData.requestDate);
      addMissing('ស្ថានភាពសំណើ *', !formData.status);
    } 
    else if (registerType === 'STOCK_ITEMS') {
      addMissing('ឈ្មោះសម្ភារៈការិយាល័យ *', !formData.name);
      addMissing('ឯកតាសម្គាល់ *', !formData.unit);
      addMissing('កម្រិតសុវត្ថិភាពទាបបំផុត *', formData.minStock === undefined || formData.minStock === null || formData.minStock <= 0);
      addMissing('សមតុល្យដែលមានបច្ចុប្បន្ន *', formData.currentBalance === undefined || formData.currentBalance === null || formData.currentBalance < 0);
    } 
    else if (registerType === 'AUDITS') {
      addMissing('ឆ្នាំនៃការរាប់សារពើភណ្ឌ *', !formData.year);
      addMissing('កាលបរិច្ឆេទរាប់ជាក់ស្តែង *', !formData.auditDate);
      addMissing('គណៈកម្មការរៀបចំ *', !formData.committee);
      addMissing('ជ្រើសរើសទ្រព្យសម្បត្តិដែលផ្ទៀងផ្ទាត់ *', !formData.assetId);
      addMissing('ចំនួនរាប់ជាក់ស្តែង *', formData.actualQty === undefined || formData.actualQty === null || formData.actualQty < 0);
      addMissing('អនុសាសន៍ និងការវាយតម្លៃរបស់គណៈកម្មការ *', !formData.recommendations);
    }

    return missingFields;
  };

  const getSummaryFields = (): Record<string, string> => {
    const fields: Record<string, string> = {};
    const label = (km: string, en: string) => lang === 'KM' ? km : en;

    if (registerType === 'ASSETS' || registerType === 'ICT') {
      fields[label('លេខកូដ', 'Code')] = formData.code || '';
      fields[label('ឈ្មោះទ្រព្យ', 'Asset Name')] = formData.name || '';
      fields[label('ប្រភេទទ្រព្យ', 'Category')] = translateCategory(formData.category, lang);
      fields[label('បរិមាណ', 'Quantity')] = `${formData.quantity || 0}`;
      fields[label('តម្លៃដើម', 'Cost')] = `${(formData.cost || 0).toLocaleString()} ៛`;
      fields[label('ការិយាល័យ', 'Office')] = translateOffice(formData.officeId, lang);
      fields[label('អ្នកគ្រប់គ្រង', 'Custodian')] = formData.responsiblePerson || '';
    } 
    else if (registerType === 'HANDOVERS') {
      fields[label('លេខកូដទ្រព្យ', 'Asset Code')] = formData.assetCode || '';
      fields[label('ឈ្មោះទ្រព្យ', 'Asset Name')] = formData.assetName || '';
      fields[label('បុគ្គលិកប្រើប្រាស់', 'Staff Name')] = formData.staffName || '';
      fields[label('អ្នកប្រគល់', 'Giver')] = formData.giverName || '';
      fields[label('អ្នកទទួល', 'Receiver')] = formData.receiverName || '';
      fields[label('កាលបរិច្ឆេទប្រគល់', 'Date')] = formData.handoverDate || '';
    } 
    else if (registerType === 'MOVEMENTS') {
      fields[label('លេខកូដទ្រព្យ', 'Asset Code')] = formData.assetCode || '';
      fields[label('ឈ្មោះទ្រព្យ', 'Asset Name')] = formData.assetName || '';
      fields[label('ផ្ទេរចេញពី', 'From Office')] = translateOffice(formData.fromOfficeId, lang);
      fields[label('ផ្ទេរចូលទៅ', 'To Office')] = translateOffice(formData.toOfficeId, lang);
      fields[label('ប្រភេទចលនា', 'Transfer Type')] = translateText(formData.type || '');
      fields[label('អ្នកទទួលខុសត្រូវថ្មី', 'New Custodian')] = formData.responsiblePerson || '';
    } 
    else if (registerType === 'MAINTENANCE') {
      fields[label('លេខកូដទ្រព្យ', 'Asset Code')] = formData.assetCode || '';
      fields[label('ឈ្មោះទ្រព្យ', 'Asset Name')] = formData.assetName || '';
      fields[label('ប្រភេទជួសជុល', 'Repair Type')] = formData.repairType || '';
      fields[label('តម្លៃសេវា', 'Cost')] = `${(formData.cost || 0).toLocaleString()} ៛`;
      fields[label('ជាង/ហាងជួសជុល', 'Service Provider')] = formData.provider || '';
      fields[label('កាលបរិច្ឆេទ', 'Date')] = formData.repairDate || '';
    } 
    else if (registerType === 'DAMAGED_LOST') {
      fields[label('លេខកូដទ្រព្យ', 'Asset Code')] = formData.assetCode || '';
      fields[label('ឈ្មោះទ្រព្យ', 'Asset Name')] = formData.assetName || '';
      fields[label('ប្រភេទឧបទ្ទវហេតុ', 'Incident Type')] = translateText(formData.type || '');
      fields[label('កាលបរិច្ឆេទ', 'Date')] = formData.date || '';
      fields[label('សំណើដោះស្រាយ', 'Proposal')] = formData.proposal || '';
    } 
    else if (registerType === 'WRITEOFFS') {
      fields[label('លេខកូដទ្រព្យ', 'Asset Code')] = formData.assetCode || '';
      fields[label('ឈ្មោះទ្រព្យ', 'Asset Name')] = formData.assetName || '';
      fields[label('ហេតុផលស្នើសុំ', 'Reason')] = translateText(formData.reason || '');
      fields[label('កាលបរិច្ឆេទស្នើសុំ', 'Request Date')] = formData.requestDate || '';
      fields[label('ស្ថានភាពសំណើ', 'Proposal Status')] = translateText(formData.status || '');
    } 
    else if (registerType === 'STOCK_ITEMS') {
      fields[label('ឈ្មោះសម្ភារៈ', 'Item Name')] = formData.name || '';
      fields[label('ឯកតាសម្គាល់', 'Unit')] = formData.unit || '';
      fields[label('កម្រិតស្តុកទាបបំផុត', 'Min Safety Stock')] = `${formData.minStock || 0}`;
      fields[label('សមតុល្យបច្ចុប្បន្ន', 'Current Balance')] = `${formData.currentBalance || 0}`;
    } 
    else if (registerType === 'AUDITS') {
      fields[label('ឆ្នាំរាប់', 'Audit Year')] = formData.year || '';
      fields[label('គណៈកម្មការ', 'Committee')] = formData.committee || '';
      fields[label('លេខកូដទ្រព្យ', 'Asset Code')] = formData.assetCode || '';
      fields[label('ឈ្មោះទ្រព្យ', 'Asset Name')] = formData.assetName || '';
      fields[label('ចំនួនក្នុងបញ្ជី', 'Book Qty')] = `${formData.registeredQty || 0}`;
      fields[label('ចំនួនជាក់ស្តែង', 'Physical Qty')] = `${formData.actualQty || 0}`;
    }

    return fields;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to top of form so user can see errors
      const container = document.getElementById('add-edit-form-container');
      if (container) container.scrollTop = 0;
      return;
    }
    setValidationErrors([]);
    setShowConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] relative">
        
        {/* Title */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between text-white border-b border-slate-850">
          <h3 className="text-sm font-bold text-slate-100">
            {translateText(editItem ? 'កែសម្រួលព័ត៌មានលម្អិត' : 'បន្ថែមព័ត៌មានថ្មី')} 
            {registerType === 'ASSETS' && translateText(' ក្នុងបញ្ជីសារពើភណ្ឌទ្រព្យរដ្ឋ')}
            {registerType === 'ICT' && (lang === 'KM' ? ' ក្នុងបញ្ជីទ្រព្យសម្បត្តិបច្ចេកវិទ្យាព័ត៌មាន (ICT)' : ' to ICT Asset Register')}
            {registerType === 'HANDOVERS' && translateText(' ក្នុងបញ្ជីប្រគល់-ទទួល')}
            {registerType === 'MOVEMENTS' && translateText(' ក្នុងបញ្ជីចលនាផ្ទេរទ្រព្យ')}
            {registerType === 'MAINTENANCE' && translateText(' ក្នុងបញ្ជីជួសជុល និងថែទាំ')}
            {registerType === 'DAMAGED_LOST' && translateText(' ក្នុងបញ្ជីទ្រព្យខូច/បាត់បង់')}
            {registerType === 'WRITEOFFS' && translateText(' ក្នុងបញ្ជីស្នើសុំកាត់ចេញ')}
            {registerType === 'STOCK_ITEMS' && translateText(' ក្នុងបញ្ជីសន្និធិសម្ភារៈការិយាល័យ')}
            {registerType === 'AUDITS' && translateText(' ក្នុងបញ្ជីរាប់សារពើភណ្ឌប្រចាំឆ្នាំ')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Container */}
        <form id="add-edit-form-container" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-900/40 relative">
          
          {validationErrors.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl text-xs space-y-1.5 text-rose-700 dark:text-rose-400">
              <p className="font-bold flex items-center gap-1.5 text-rose-850 dark:text-rose-300">
                <span className="text-sm">⚠️</span>
                {lang === 'KM' ? 'សូមបំពេញព័ត៌មានកាតព្វកិច្ចឲ្យបានគ្រប់ជ្រុងជ្រោយ៖' : 'Please fill out all required fields:'}
              </p>
              <ul className="list-disc list-inside pl-2 font-bold space-y-0.5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 1. ASSET REGISTER FORM */}
          {(registerType === 'ASSETS' || registerType === 'ICT') && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">លេខកូដសម្គាល់ទ្រព្យ *</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => handleChange('code', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ឈ្មោះទ្រព្យសម្បត្តិ *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                    placeholder="ឧ. តុធ្វើការឈើប្រណីត"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ប្រភេទទ្រព្យសម្បត្តិ *</label>
                  <select
                    value={formData.category || 'FURNITURE'}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    {CATEGORIES.filter(c => c.id !== 'CONSUMABLE').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ប្រភពថវិការៀបចំ</label>
                  <input
                    type="text"
                    value={formData.budgetSource || ''}
                    onChange={(e) => handleChange('budgetSource', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="ឧ. ថវិការដ្ឋ, USAID, ADB"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">បរិមាណ *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantity || 1}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">តម្លៃដើមប៉ាន់ស្មាន (រៀល) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.cost || 0}
                    onChange={(e) => handleChange('cost', parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទទទួល *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateReceived || ''}
                    onChange={(e) => handleChange('dateReceived', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ការិយាល័យប្រើប្រាស់ *</label>
                  <select
                    value={formData.officeId || 'OFFICE_GEN'}
                    onChange={(e) => handleChange('officeId', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    {OFFICES.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">អ្នកគ្រប់គ្រងទទួលខុសត្រូវ *</label>
                  <input
                    type="text"
                    required
                    value={formData.responsiblePerson || ''}
                    onChange={(e) => handleChange('responsiblePerson', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="ឈ្មោះមន្ត្រីទទួលបន្ទុក"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ស្ថានភាពឧបករណ៍ *</label>
                  <select
                    value={formData.status || 'ល្អ'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="ល្អ">ល្អ</option>
                    <option value="មធ្យម">មធ្យម</option>
                    <option value="ខូចស្រាល">ខូចស្រាល</option>
                    <option value="ខូចធ្ងន់">ខូចធ្ងន់</option>
                    <option value="បាត់បង់">បាត់បង់</option>
                  </select>
                </div>
              </div>

              {/* Is ICT Checkbox */}
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isICT || false}
                    onChange={(e) => handleChange('isICT', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  តើឧបករណ៍នេះជាប្រភេទសម្ភារៈបច្ចេកវិទ្យាព័ត៌មាន (ICT)?
                </label>

                {formData.isICT && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={formData.serialNumber || ''}
                        onChange={(e) => handleChange('serialNumber', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                        placeholder="S/N: XXXX-XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">IP Address</label>
                      <input
                        type="text"
                        value={formData.ipAddress || ''}
                        onChange={(e) => handleChange('ipAddress', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                        placeholder="192.168.1.1, 2001:db8::1, DHCP"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                        {lang === 'KM' 
                          ? 'គាំទ្រគ្រប់ទម្រង់ IP (IPv4, IPv6, DHCP, multi-IP, CIDR)' 
                          : 'Supports any IP format (IPv4, IPv6, DHCP, multi-IP, CIDR)'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">សុពលភាពការធានា</label>
                      <input
                        type="text"
                        value={formData.warranty || ''}
                        onChange={(e) => handleChange('warranty', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2"
                        placeholder="ឧ. ១២ ខែ, ២៤ ខែ"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. HANDOVER RECORD FORM */}
          {registerType === 'HANDOVERS' && (
            <div className="space-y-4 text-xs">
              {renderAssetSelector('ជ្រើសរើសទ្រព្យសម្បត្តិដែលប្រគល់ជូន *')}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ឈ្មោះបុគ្គលិកប្រើប្រាស់ផ្ទាល់ *</label>
                  <input
                    type="text"
                    required
                    value={formData.staffName || ''}
                    onChange={(e) => handleChange('staffName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                    placeholder="ឈ្មោះបុគ្គលិកទទួលប្រើប្រាស់"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទប្រគល់ *</label>
                  <input
                    type="date"
                    required
                    value={formData.handoverDate || ''}
                    onChange={(e) => handleChange('handoverDate', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ឈ្មោះអ្នកប្រគល់ (តំណាង) *</label>
                  <input
                    type="text"
                    required
                    value={formData.giverName || ''}
                    onChange={(e) => handleChange('giverName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ឈ្មោះអ្នកទទួល *</label>
                  <input
                    type="text"
                    required
                    value={formData.receiverName || ''}
                    onChange={(e) => handleChange('receiverName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">ស្ថានភាពជាក់ស្តែងពេលប្រគល់</label>
                <input
                  type="text"
                  value={formData.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder="ឧ. ថ្មីប្រអប់, ល្អបង្គួរ, មានស្នាមឆ្កូតតិចតួច"
                />
              </div>
            </div>
          )}

          {/* 3. MOVEMENT RECORD FORM */}
          {registerType === 'MOVEMENTS' && (
            <div className="space-y-4 text-xs">
              {renderAssetSelector('ជ្រើសរើសទ្រព្យសម្បត្តិដែលចលនា *')}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ផ្ទេរចេញពី (ទីតាំងចាស់)</label>
                  <select
                    disabled
                    value={formData.fromOfficeId || 'OFFICE_GEN'}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-100 cursor-not-allowed"
                  >
                    {OFFICES.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ផ្ទេរចូលទៅ (ទីតាំងថ្មី) *</label>
                  <select
                    value={formData.toOfficeId || 'OFFICE_RES'}
                    onChange={(e) => handleChange('toOfficeId', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                  >
                    {OFFICES.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ប្រភេទនៃចលនា *</label>
                  <select
                    value={formData.type || 'ផ្ទេរជាអចិន្ត្រៃយ៍'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="ផ្ទេរជាអចិន្ត្រៃយ៍">ផ្ទេរជាអចិន្ត្រៃយ៍</option>
                    <option value="ខ្ចីបណ្តោះអាសន្ន">ខ្ចីបណ្តោះអាសន្ន</option>
                    <option value="ដកហូតប្រគល់ត្រឡប់">ដកហូតប្រគល់ត្រឡប់</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">អ្នកទទួលខុសត្រូវថ្មី *</label>
                  <input
                    type="text"
                    required
                    value={formData.responsiblePerson || ''}
                    onChange={(e) => handleChange('responsiblePerson', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                    placeholder="ឈ្មោះមន្ត្រីថ្មី"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទចលនា *</label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. MAINTENANCE RECORD FORM */}
          {registerType === 'MAINTENANCE' && (
            <div className="space-y-4 text-xs">
              {renderAssetSelector('ជ្រើសរើសទ្រព្យសម្បត្តិដែលជួសជុល *')}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ប្រភេទនៃការជួសជុល *</label>
                  <input
                    type="text"
                    required
                    value={formData.repairType || ''}
                    onChange={(e) => handleChange('repairType', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="ឧ. ប្តូរកាសែតកំដៅ, ប្តូរប្រេង"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទជួសជុល *</label>
                  <input
                    type="date"
                    required
                    value={formData.repairDate || ''}
                    onChange={(e) => handleChange('repairDate', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">តម្លៃសេវាជួសជុលសរុប (រៀល) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.cost || 0}
                    onChange={(e) => handleChange('cost', parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">អ្នកផ្គត់ផ្គង់សេវាកម្ម/ហាង *</label>
                  <input
                    type="text"
                    required
                    value={formData.provider || ''}
                    onChange={(e) => handleChange('provider', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="ឈ្មោះដៃគូជួសជុល"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. DAMAGED OR LOST FORM */}
          {registerType === 'DAMAGED_LOST' && (
            <div className="space-y-4 text-xs">
              {renderAssetSelector('ជ្រើសរើសទ្រព្យសម្បត្តិដែលខូច/បាត់ *')}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ប្រភេទគ្រោះមហន្តរាយ *</label>
                  <select
                    value={formData.type || 'ខូចខាតធ្ងន់ធ្ងរ'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="ខូចខាតធ្ងន់ធ្ងរ">ខូចខាតធ្ងន់ធ្ងរ</option>
                    <option value="បាត់បង់">បាត់បង់</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទកើតឡើង *</label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">មូលហេតុខូចខាត ឬបាត់បង់ *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.reason || ''}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder="លម្អិតហេតុការណ៍ចរន្តឆ្លង បាត់កូនសោ etc."
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">របាយការណ៍ស៊ើបអង្កេតរបស់មន្ត្រីបច្ចេកទេស</label>
                <textarea
                  rows={2}
                  value={formData.investigationReport || ''}
                  onChange={(e) => handleChange('investigationReport', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder="លទ្ធផលការពិនិត្យរបស់គណៈកម្មការ"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">សំណើដោះស្រាយជូននាយកដ្ឋាន *</label>
                <input
                  type="text"
                  required
                  value={formData.proposal || ''}
                  onChange={(e) => handleChange('proposal', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder="ឧ. ស្នើសុំទិញជំនួស, ផាកពិន័យមន្ត្រី, ស្នើសុំកាត់ចេញ"
                />
              </div>
            </div>
          )}

          {/* 6. WRITE-OFF RECORD FORM */}
          {registerType === 'WRITEOFFS' && (
            <div className="space-y-4 text-xs">
              {renderAssetSelector('ជ្រើសរើសទ្រព្យសម្បត្តិដែលត្រូវកាត់ចេញ *')}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ហេតុផលស្នើសុំកាត់ចេញ *</label>
                  <select
                    value={formData.reason || 'ខូចមិនអាចជួសជុលបាន'}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="ហួសអាយុកាលប្រើប្រាស់">ហួសអាយុកាលប្រើប្រាស់</option>
                    <option value="ខូចមិនអាចជួសជុលបាន">ខូចមិនអាចជួសជុលបាន</option>
                    <option value="បាត់បង់ដោយមានការអនុម័ត">បាត់បង់ដោយមានការអនុម័ត</option>
                    <option value="ផ្សេងៗ">ផ្សេងៗ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទស្នើសុំ *</label>
                  <input
                    type="date"
                    required
                    value={formData.requestDate || ''}
                    onChange={(e) => handleChange('requestDate', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ស្ថានភាពសំណើ *</label>
                  <select
                    value={formData.status || 'កំពុងពិនិត្យ'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="កំពុងពិនិត្យ">កំពុងពិនិត្យ</option>
                    <option value="បានអនុម័ត">បានអនុម័ត</option>
                    <option value="បដិសេធ">បដិសេធ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">កំណត់សម្គាល់ឯកសារភ្ជាប់ (លិខិតយោង)</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder="ឧ. ភ្ជាប់របាយការណ៍បច្ចេកទេសលេខ..."
                />
              </div>
            </div>
          )}

          {/* 7. STOCK ITEM FORM */}
          {registerType === 'STOCK_ITEMS' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">ឈ្មោះសម្ភារៈការិយាល័យ *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                  placeholder="ឧ. ក្រដាស Double A A4 80g"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ឯកតាសម្គាល់ *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit || 'កេស'}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="កេស, ដើម, កំប៉ុង, រាម"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កម្រិតសុវត្ថិភាពទាបបំផុត *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.minStock || 5}
                    onChange={(e) => handleChange('minStock', parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">សមតុល្យដែលមានបច្ចុប្បន្ន *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.currentBalance || 0}
                    disabled={!!editItem} // Disallow manually editing stock levels except via dynamic transactions
                    className={`w-full border border-slate-300 rounded-lg p-2.5 ${editItem ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. ANNUAL AUDIT RECORD FORM */}
          {registerType === 'AUDITS' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ឆ្នាំនៃការរាប់សារពើភណ្ឌ *</label>
                  <input
                    type="text"
                    required
                    value={formData.year || '២០២៦'}
                    onChange={(e) => handleChange('year', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">កាលបរិច្ឆេទរាប់ជាក់ស្តែង *</label>
                  <input
                    type="date"
                    required
                    value={formData.auditDate || ''}
                    onChange={(e) => handleChange('auditDate', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">គណៈកម្មការរៀបចំ *</label>
                  <input
                    type="text"
                    required
                    value={formData.committee || ''}
                    onChange={(e) => handleChange('committee', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              {renderAssetSelector('ជ្រើសរើសទ្រព្យសម្បត្តិដែលផ្ទៀងផ្ទាត់ *')}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ចំនួនក្នុងបញ្ជីសារពើភណ្ឌ</label>
                  <input
                    type="number"
                    disabled
                    value={formData.registeredQty || 0}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ចំនួនរាប់ជាក់ស្តែង *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.actualQty || 0}
                    onChange={(e) => handleChange('actualQty', parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">ភាពលើស ឬខ្វះ</label>
                  <input
                    type="number"
                    disabled
                    value={formData.diff || 0}
                    className={`w-full border border-slate-300 rounded-lg p-2.5 font-bold ${formData.diff < 0 ? 'text-red-600 bg-red-50' : formData.diff > 0 ? 'text-emerald-600 bg-emerald-50' : 'bg-slate-50'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">អនុសាសន៍ និងការវាយតម្លៃរបស់គណៈកម្មការ *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.recommendations || ''}
                  onChange={(e) => handleChange('recommendations', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder="ឧ. ឧបករណ៍ដំណើរការល្អ ត្រូវចុះបញ្ជីផ្ទេរទីតាំងឡើងវិញ"
                />
              </div>
            </div>
          )}

          {/* File & Image Attachment Section */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-5 space-y-4">
            <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === 'KM' ? 'ឯកសារយោង និងរូបភាពភ្ជាប់ (Attachments)' : 'Reference Documents & Image Attachments'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              {/* Image Upload */}
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col items-center justify-center relative min-h-[120px] transition-all hover:border-indigo-400">
                {formData.imageData ? (
                  <div className="w-full flex flex-col items-center space-y-2">
                    <img 
                      src={formData.imageData} 
                      alt="Asset Preview" 
                      className="h-20 w-auto rounded-lg border border-slate-200 object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex items-center gap-2 max-w-full">
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{formData.imageName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('imageName', undefined);
                          handleChange('imageData', undefined);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-center w-full h-full">
                    <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Image className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 font-bold">
                        {lang === 'KM' ? 'បញ្ចូលរូបភាពឧបករណ៍' : 'Upload Device Image'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, JPEG</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Document/Spreadsheet Integration Section */}
              <div className="flex flex-col space-y-3 w-full">
                {/* Method selector tabs */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl max-w-xs self-start">
                  <button
                    type="button"
                    onClick={() => {
                      // Only let them switch if not active parsing
                      if (!isParsingDocument) {
                        // Reset document info if switching methods
                        handleChange('documentName', undefined);
                        handleChange('documentData', undefined);
                        setParsedAssets(null);
                        setRawSheets(null);
                      }
                    }}
                    className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      !formData.documentData || formData.documentName?.includes('Sheets')
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    Google Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isParsingDocument) {
                        handleChange('documentName', undefined);
                        handleChange('documentData', undefined);
                        setParsedAssets(null);
                        setRawSheets(null);
                      }
                    }}
                    className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      formData.documentData && !formData.documentName?.includes('Sheets')
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-3xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    {lang === 'KM' ? 'ឯកសារកុំព្យូទ័រ' : 'Local File'}
                  </button>
                </div>

                {formData.documentData ? (
                  // Display current active attached document state
                  <div className="border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4 bg-indigo-50/10 dark:bg-indigo-950/5 flex flex-col items-center justify-center min-h-[120px] relative">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-150 mb-2">
                      {formData.documentName?.includes('Sheets') ? (
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : formData.documentName?.endsWith('.xlsx') || formData.documentName?.endsWith('.xls') ? (
                        <FileSpreadsheet className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center max-w-full">
                      <span className="text-[11px] text-slate-800 dark:text-slate-200 font-extrabold truncate max-w-[280px]" title={formData.documentName}>
                        {formData.documentName}
                      </span>
                      {formData.documentName?.includes('Sheets') && (
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[240px] font-mono">
                          ID: {formData.documentData.length > 30 ? formData.documentData.substring(0, 30) + '...' : formData.documentData}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('documentName', undefined);
                          handleChange('documentData', undefined);
                          setParsedAssets(null);
                          setRawSheets(null);
                        }}
                        className="mt-2 text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        {lang === 'KM' ? 'លុបឯកសារចេញ' : 'Remove File'}
                      </button>
                    </div>
                  </div>
                ) : (!formData.documentData && (!formData.documentName?.includes('Sheets') && document.activeElement === null /* dummy fallback check to guide tabs */)) ? (
                  // Default tab: Google Sheets Integration Container
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col space-y-4 min-h-[140px]">
                    {/* Direct URL Input */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                        {lang === 'KM' ? '🔗 បញ្ចូលតំណភ្ជាប់ Google Sheets' : '🔗 Paste Google Sheets URL / ID'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={googleSheetsUrlInput}
                          onChange={(e) => setGoogleSheetsUrlInput(e.target.value)}
                          className="flex-1 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (googleSheetsUrlInput.trim()) {
                              if (!googleToken) {
                                setParseError(lang === 'KM' ? 'សូមចូលគណនី Google (ខាងក្រោម) ដើម្បីអនុញ្ញាតការអាន Google Sheets របស់អ្នក' : 'Please sign in with Google below to authorize reading Sheets.');
                              } else {
                                parseGoogleSheetData(googleSheetsUrlInput.trim());
                              }
                            }
                          }}
                          disabled={!googleSheetsUrlInput.trim() || isParsingDocument}
                          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {isParsingDocument ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          {lang === 'KM' ? 'បំប្លែង' : 'Convert'}
                        </button>
                      </div>
                    </div>

                    {/* Google OAuth & Google Drive Explorer Section */}
                    <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3">
                      {!googleUser ? (
                        <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold max-w-sm">
                            {lang === 'KM'
                              ? 'ចូលគណនី Google ដើម្បីស្វែងរក និងជ្រើសរើសឯកសារ Google Sheets ផ្ទាល់ពី Google Drive របស់អ្នក។'
                              : 'Connect Google Account to browse and select spreadsheet sheets directly from your Google Drive.'}
                          </p>
                          <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="gsi-material-button inline-flex items-center justify-center"
                            style={{
                              backgroundColor: 'white',
                              border: '1px solid #dadce0',
                              borderRadius: '12px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '16px', height: '16px' }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                              </svg>
                              <span className="text-xs font-extrabold text-slate-700">
                                {isLoggingIn ? (lang === 'KM' ? 'កំពុងតភ្ជាប់...' : 'Connecting...') : (lang === 'KM' ? 'ភ្ជាប់គណនី Google' : 'Sign in with Google')}
                              </span>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Active Google Session Header */}
                          <div className="flex items-center justify-between gap-4 bg-slate-100/50 dark:bg-slate-900/60 p-2 rounded-xl">
                            <div className="flex items-center gap-2 overflow-hidden">
                              {googleUser.photoURL ? (
                                <img src={googleUser.photoURL} alt={googleUser.displayName} className="h-6 w-6 rounded-full border border-slate-300" />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                  {googleUser.displayName?.charAt(0) || 'G'}
                                </div>
                              )}
                              <div className="overflow-hidden">
                                <p className="text-[10px] font-extrabold text-slate-850 dark:text-slate-200 truncate">{googleUser.displayName}</p>
                                <p className="text-[8px] text-slate-500 truncate">{googleUser.email}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleGoogleLogout}
                              className="text-[9px] font-black text-slate-500 hover:text-red-500 flex items-center gap-1 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <LogOut className="h-3 w-3" />
                              {lang === 'KM' ? 'ចាកចេញ' : 'Sign Out'}
                            </button>
                          </div>

                          {/* Recent Spreadsheets Grid Explorer */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                              <span>📂 {lang === 'KM' ? 'សន្លឹកកិច្ចការថ្មីៗពី Drive' : 'Recent Spreadsheets from Drive'}</span>
                              <button
                                type="button"
                                onClick={() => fetchRecentSpreadsheets(googleToken!)}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                              >
                                {lang === 'KM' ? 'ធ្វើឲ្យស្រស់' : 'Refresh'}
                              </button>
                            </div>

                            {isLoadingDriveFiles ? (
                              <div className="py-6 flex flex-col items-center justify-center space-y-2">
                                <Loader2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                <span className="text-[10px] text-slate-400">{lang === 'KM' ? 'កំពុងស្វែងរកឯកសារ...' : 'Searching files...'}</span>
                              </div>
                            ) : driveError ? (
                              <p className="text-[10px] text-rose-500 font-semibold">{driveError}</p>
                            ) : driveFiles.length === 0 ? (
                              <p className="text-[10px] text-slate-400 text-center py-4 font-semibold">
                                {lang === 'KM' ? 'មិនមានសន្លឹកកិច្ចការ Google Sheets ឡើយ' : 'No Google Sheets spreadsheets found in your Drive.'}
                              </p>
                            ) : (
                              <div className="max-h-32 overflow-y-auto border border-slate-200/50 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 p-1 divide-y divide-slate-100 dark:divide-slate-800">
                                {driveFiles.map((file) => (
                                  <button
                                    key={file.id}
                                    type="button"
                                    onClick={() => parseGoogleSheetData(file.id)}
                                    className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-lg flex items-center justify-between gap-3 text-[10px] transition-colors cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      <span className="text-slate-700 dark:text-slate-200 font-extrabold truncate max-w-[200px]" title={file.name}>
                                        {file.name}
                                      </span>
                                    </div>
                                    <span className="text-[8px] text-slate-400 group-hover:text-indigo-600 shrink-0 font-medium">
                                      {new Date(file.modifiedTime).toLocaleDateString(lang === 'KM' ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Fallback tab: Local file upload
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col items-center justify-center relative min-h-[140px] transition-all hover:border-indigo-400">
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-center w-full h-full">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-slate-700 dark:text-slate-300 font-bold">
                          {lang === 'KM' ? 'បញ្ចូលឯកសារកុំព្យូទ័រ (.xlsx, .pdf)' : 'Upload Local Document (.xlsx, .pdf)'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'KM' ? 'គាំទ្រ Excel ជួរដេក និងតារាង PDF' : 'Supports Excel tables and PDF files'}</p>
                      </div>
                      <input 
                        type="file" 
                        onChange={handleDocumentChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* AI Document Parser Status and Results Panel */}
            {(registerType === 'ASSETS' || registerType === 'ICT') && (isParsingDocument || parseError || (parsedAssets && parsedAssets.length > 0)) && (
              <div id="ai-document-parser-panel" className="mt-4 border-t border-slate-150 dark:border-slate-800 pt-4">
                {isParsingDocument && (
                  <div className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900 rounded-xl p-4 flex flex-col items-center justify-center space-y-3 animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        {lang === 'KM' 
                          ? 'កំពុងវិភាគ និងទាញយកទិន្នន័យទ្រព្យដោយស្វ័យប្រវត្តិ (Gemini AI)...' 
                          : 'Analyzing & extracting asset list automatically (Gemini AI)...'}
                      </span>
                    </div>
                    <p className="text-[10px] text-indigo-500 text-center font-semibold">
                      {lang === 'KM' 
                        ? 'ប្រព័ន្ធកំពុងអានតារាងទិន្នន័យ និងផ្គូផ្គងទៅតាមជួរឈរនៃប្រព័ន្ធ...' 
                        : 'Reading file spreadsheets/tables and mapping columns semantically...'}
                    </p>
                  </div>
                )}

                {parseError && (
                  <div className="w-full bg-rose-50/50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900 rounded-xl p-4 flex flex-col space-y-2">
                    <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                      <span className="font-extrabold text-xs">⚠️ {lang === 'KM' ? 'បរាជ័យក្នុងការទាញយកទិន្នន័យ' : 'Data Extraction Failed'}</span>
                    </div>
                    <p className="text-[10px] text-rose-500 font-semibold leading-relaxed">
                      {parseError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.documentName && formData.documentData) {
                          parseDocumentData(formData.documentName, formData.documentData);
                        }
                      }}
                      className="self-end text-[10px] font-extrabold bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'KM' ? 'ព្យាយាមម្តងទៀត' : 'Retry Extraction'}
                    </button>
                  </div>
                )}

                {parsedAssets && parsedAssets.length > 0 && (
                  <div className="w-full bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900 rounded-2xl p-4 flex flex-col space-y-4">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-400">
                          ✅ {lang === 'KM' ? `បានរកឃើញទ្រព្យចំនួន ${parsedAssets.length} គ្រឿង` : `Extracted ${parsedAssets.length} Assets`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {lang === 'KM' ? 'ជ្រើសរើសផ្ទាំងខាងក្រោមដើម្បីផ្ទៀងផ្ទាត់ទិន្នន័យដើម និងទិន្នន័យបំប្លែង' : 'Switch tabs to compare original sheet data with extracted values'}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (onBulkSave && parsedAssets) {
                            onBulkSave(parsedAssets);
                          }
                        }}
                        className="text-[11px] font-black bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {lang === 'KM' ? 'បញ្ចូលទាំងអស់ដោយស្វ័យប្រវត្តិ' : 'Bulk Import All'}
                      </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl max-w-md">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('CONVERTED')}
                        className={`flex-1 py-2 px-3 text-center text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          previewTab === 'CONVERTED'
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {lang === 'KM' ? '📋 ទិន្នន័យបំប្លែងរួច (Converted)' : '📋 Converted Assets'}
                      </button>
                      {rawSheets && rawSheets.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPreviewTab('ORIGINAL')}
                          className={`flex-1 py-2 px-3 text-center text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                            previewTab === 'ORIGINAL'
                              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
                        >
                          {lang === 'KM' ? ' Excel ដើម (Original)' : ' Excel Original'}
                        </button>
                      )}
                    </div>

                    {/* CONTENT TAB 1: CONVERTED ASSETS TABLE GRID */}
                    {previewTab === 'CONVERTED' && (
                      <div className="overflow-x-auto border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl bg-white dark:bg-slate-950 shadow-3xs max-h-72 overflow-y-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-[11px] leading-normal">
                          <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                            <tr className="text-slate-500 dark:text-slate-400 uppercase text-[9px] font-black border-b border-slate-200 dark:border-slate-800 tracking-wider">
                              <th className="py-2.5 px-3 text-center w-12">{lang === 'KM' ? 'ល.រ' : 'No.'}</th>
                              <th className="py-2.5 px-3 text-left">{lang === 'KM' ? 'កូដទ្រព្យ' : 'Asset Code'}</th>
                              <th className="py-2.5 px-3 text-left">{lang === 'KM' ? 'ឈ្មោះទ្រព្យ' : 'Asset Name'}</th>
                              <th className="py-2.5 px-3 text-center w-16">{lang === 'KM' ? 'បរិមាណ' : 'Qty'}</th>
                              <th className="py-2.5 px-3 text-right">{lang === 'KM' ? 'តម្លៃឯកតា' : 'Unit Cost'}</th>
                              <th className="py-2.5 px-3 text-left">{lang === 'KM' ? 'ទីតាំង' : 'Location'}</th>
                              <th className="py-2.5 px-3 text-center">{lang === 'KM' ? 'ស្ថានភាព' : 'Status'}</th>
                              <th className="py-2.5 px-3 text-center w-24">{lang === 'KM' ? 'សកម្មភាព' : 'Action'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 dark:divide-slate-850 bg-white dark:bg-slate-950">
                            {parsedAssets.map((asset, idx) => (
                              <tr key={idx} className="hover:bg-emerald-50/10 dark:hover:bg-slate-850/30 transition-colors">
                                <td className="py-2.5 px-3 text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-mono font-extrabold text-indigo-600 dark:text-indigo-400 truncate max-w-[110px]" title={asset.code}>{asset.code}</td>
                                <td className="py-2.5 px-3 font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[180px]" title={asset.name}>{asset.name}</td>
                                <td className="py-2.5 px-3 text-center font-extrabold text-slate-700 dark:text-slate-300">{asset.quantity}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">${asset.cost?.toLocaleString() || 0}</td>
                                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[100px]" title={asset.officeId}>
                                  {asset.officeId?.replace('OFFICE_', '')}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black text-[9px] whitespace-nowrap">
                                    {asset.status}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => autoFillWithAsset(asset)}
                                    className="text-[9px] font-black bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    title={lang === 'KM' ? 'បំពេញទិន្នន័យនេះទៅក្នុងទម្រង់ខាងលើ' : 'Fill this data into the form inputs'}
                                  >
                                    {lang === 'KM' ? 'បំពេញ' : 'Fill'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* CONTENT TAB 2: ORIGINAL EXCEL SHEETS GRID */}
                    {previewTab === 'ORIGINAL' && rawSheets && rawSheets.length > 0 && (
                      <div className="space-y-3">
                        {/* Sheets list tab buttons */}
                        {rawSheets.length > 1 && (
                          <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                            {rawSheets.map((sh, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveSheetTab(idx)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                  activeSheetTab === idx
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                📊 {sh.sheetName}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Interactive Spreadsheet Layout */}
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-3xs max-h-72 overflow-y-auto">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-[10px] font-mono leading-normal">
                            <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 z-10">
                              <tr className="divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-2 py-1.5 text-slate-400 font-bold bg-slate-150 dark:bg-slate-950 w-10 select-none"></th>
                                {Array.from({ length: Math.max(5, ...(rawSheets[activeSheetTab]?.rows || []).map((r: any) => r?.length || 0)) }).map((_, colIdx) => (
                                  <th key={colIdx} className="px-3 py-1.5 text-center text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 select-none">
                                    {String.fromCharCode(65 + (colIdx % 26)) + (colIdx >= 26 ? Math.floor(colIdx / 26) : '')}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 dark:divide-slate-850 bg-white dark:bg-slate-950">
                              {(rawSheets[activeSheetTab]?.rows || []).map((row: any[], rowIdx: number) => (
                                <tr key={rowIdx} className="divide-x divide-slate-150 dark:divide-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                  {/* Row Number */}
                                  <td className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-center font-bold text-slate-400 dark:text-slate-500 select-none sticky left-0 z-5 border-r border-slate-200 dark:border-slate-800">
                                    {rowIdx + 1}
                                  </td>
                                  
                                  {/* Row Columns */}
                                  {Array.from({ length: Math.max(5, ...(rawSheets[activeSheetTab]?.rows || []).map((r: any) => r?.length || 0)) }).map((_, colIdx) => {
                                    const val = row && row[colIdx];
                                    const hasContent = val !== undefined && val !== null && String(val).trim() !== '';
                                    return (
                                      <td 
                                        key={colIdx} 
                                        className={`px-3 py-1.5 truncate max-w-[220px] font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-150 dark:border-slate-800/50 ${
                                          hasContent ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                                        }`}
                                        title={val !== undefined ? String(val) : ''}
                                      >
                                        {val !== undefined && val !== null ? String(val) : ''}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="bg-slate-50 dark:bg-slate-950 -mx-6 -mb-6 px-6 py-4 flex justify-end gap-2 border-t border-slate-150 dark:border-slate-850 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
            >
              {translateText('បដិសេធ')}
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Save className="h-4 w-4" />
              {translateText('រក្សាទុកទិន្នន័យ')}
            </button>
          </div>

        </form>

        {showConfirm && (
          <div className="absolute inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex justify-center items-center p-6">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-4 max-h-[90%] overflow-y-auto">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 animate-pulse">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {lang === 'KM' ? 'សូមពិនិត្យ និងផ្ទៀងផ្ទាត់ព័ត៌មាន' : 'Review & Verify Information'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {lang === 'KM' ? 'សូមពិនិត្យមើលទិន្នន័យដែលបានបំពេញខាងក្រោមឱ្យបានច្បាស់លាស់ មុននឹងរក្សាទុកចូលក្នុងប្រព័ន្ធ។' : 'Please check the entered data carefully before saving it to the system.'}
                </p>
              </div>

              {/* Data Summary List */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-850 rounded-xl p-4 divide-y divide-slate-150 dark:divide-slate-850 text-xs">
                {Object.entries(getSummaryFields()).map(([lbl, val]) => (
                  <div key={lbl} className="py-2 first:pt-0 last:pb-0 flex justify-between gap-4">
                    <span className="text-slate-400 dark:text-slate-500 font-bold shrink-0">{lbl}</span>
                    <span className="text-slate-850 dark:text-slate-150 font-extrabold text-right truncate max-w-[200px]">{val}</span>
                  </div>
                ))}
              </div>

              {/* Confirmation Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {lang === 'KM' ? '← កែសម្រួលបន្ថែម' : '← Edit More'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSave(formData);
                    setShowConfirm(false);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  {lang === 'KM' ? 'យល់ព្រមរក្សាទុក' : 'Confirm & Save'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
