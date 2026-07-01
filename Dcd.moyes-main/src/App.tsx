/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RegisterTable from './components/RegisterTable';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AssetDetailModal from './components/AssetDetailModal';
import AddEditModal from './components/AddEditModal';
import DocumentTemplates from './components/DocumentTemplates';
import AdminSettings from './components/AdminSettings';
import { Language } from './data/translations';

import { 
  Asset, 
  HandoverRecord, 
  MovementRecord, 
  MaintenanceRecord, 
  DamagedLostRecord, 
  WriteOffRecord, 
  StockItem, 
  StockTransaction, 
  AnnualAuditRecord,
  DocumentFile,
  UserAccount
} from './types';

import { 
  INITIAL_ASSETS, 
  INITIAL_HANDOVERS, 
  INITIAL_MOVEMENTS, 
  INITIAL_MAINTENANCE, 
  INITIAL_DAMAGED_LOST, 
  INITIAL_WRITEOFFS, 
  INITIAL_STOCK_ITEMS, 
  INITIAL_STOCK_TRANSACTIONS, 
  INITIAL_AUDITS 
} from './data/mockData';

export default function App() {
  
  // --- STATE PERSISTENCE IN LOCAL STORAGE ---
  // On first load of this updated version, clear old sample local storage to ensure fresh empty start
  const clearCacheVersion = 'DCD_CLEARED_SAMPLES_V3';
  if (!localStorage.getItem(clearCacheVersion)) {
    localStorage.removeItem('DCD_ASSETS');
    localStorage.removeItem('DCD_HANDOVERS');
    localStorage.removeItem('DCD_MOVEMENTS');
    localStorage.removeItem('DCD_MAINTENANCE');
    localStorage.removeItem('DCD_DAMAGED_LOST');
    localStorage.removeItem('DCD_WRITEOFFS');
    localStorage.removeItem('DCD_STOCK_ITEMS');
    localStorage.removeItem('DCD_STOCK_TRANSACTIONS');
    localStorage.removeItem('DCD_AUDITS');
    localStorage.removeItem('DCD_DOCUMENTS');
    localStorage.setItem(clearCacheVersion, 'true');
  }

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('DCD_ASSETS');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [handovers, setHandovers] = useState<HandoverRecord[]>(() => {
    const saved = localStorage.getItem('DCD_HANDOVERS');
    return saved ? JSON.parse(saved) : INITIAL_HANDOVERS;
  });

  const [movements, setMovements] = useState<MovementRecord[]>(() => {
    const saved = localStorage.getItem('DCD_MOVEMENTS');
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('DCD_MAINTENANCE');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [damagedLost, setDamagedLost] = useState<DamagedLostRecord[]>(() => {
    const saved = localStorage.getItem('DCD_DAMAGED_LOST');
    return saved ? JSON.parse(saved) : INITIAL_DAMAGED_LOST;
  });

  const [writeoffs, setWriteoffs] = useState<WriteOffRecord[]>(() => {
    const saved = localStorage.getItem('DCD_WRITEOFFS');
    return saved ? JSON.parse(saved) : INITIAL_WRITEOFFS;
  });

  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('DCD_STOCK_ITEMS');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });

  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem('DCD_STOCK_TRANSACTIONS');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_TRANSACTIONS;
  });

  const [audits, setAudits] = useState<AnnualAuditRecord[]>(() => {
    const saved = localStorage.getItem('DCD_AUDITS');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  // Save states back to LocalStorage when changed
  useEffect(() => {
    localStorage.setItem('DCD_ASSETS', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('DCD_HANDOVERS', JSON.stringify(handovers));
  }, [handovers]);

  useEffect(() => {
    localStorage.setItem('DCD_MOVEMENTS', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('DCD_MAINTENANCE', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('DCD_DAMAGED_LOST', JSON.stringify(damagedLost));
  }, [damagedLost]);

  useEffect(() => {
    localStorage.setItem('DCD_WRITEOFFS', JSON.stringify(writeoffs));
  }, [writeoffs]);

  useEffect(() => {
    localStorage.setItem('DCD_STOCK_ITEMS', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('DCD_STOCK_TRANSACTIONS', JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  useEffect(() => {
    localStorage.setItem('DCD_AUDITS', JSON.stringify(audits));
  }, [audits]);

  // --- LANGUAGE & THEME STATE ---
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('DCD_LANGUAGE');
    return (saved === 'KM' || saved === 'EN') ? saved : 'KM';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('DCD_THEME');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('DCD_LANGUAGE', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('DCD_THEME', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- SYSTEM LOGO STATE ---
  const [systemLogo, setSystemLogo] = useState<string | null>(() => {
    return localStorage.getItem('DCD_SYSTEM_LOGO');
  });

  const [logoScale, setLogoScale] = useState<number>(() => {
    const saved = localStorage.getItem('DCD_LOGO_SCALE');
    return saved ? parseFloat(saved) : 100;
  });

  const [logoX, setLogoX] = useState<number>(() => {
    const saved = localStorage.getItem('DCD_LOGO_X');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [logoY, setLogoY] = useState<number>(() => {
    const saved = localStorage.getItem('DCD_LOGO_Y');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (systemLogo) {
      localStorage.setItem('DCD_SYSTEM_LOGO', systemLogo);
    } else {
      localStorage.removeItem('DCD_SYSTEM_LOGO');
    }
  }, [systemLogo]);

  useEffect(() => {
    localStorage.setItem('DCD_LOGO_SCALE', logoScale.toString());
  }, [logoScale]);

  useEffect(() => {
    localStorage.setItem('DCD_LOGO_X', logoX.toString());
  }, [logoX]);

  useEffect(() => {
    localStorage.setItem('DCD_LOGO_Y', logoY.toString());
  }, [logoY]);

  // --- DOCUMENTS STATE ---
  const [documents, setDocuments] = useState<DocumentFile[]>(() => {
    const saved = localStorage.getItem('DCD_DOCUMENTS');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('DCD_DOCUMENTS', JSON.stringify(documents));
  }, [documents]);

  // --- USER AUTHENTICATION & OFFICERS STATE ---
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('DCD_CURRENT_USER');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.fullName === 'លី សុភ័ក្រ' || parsed.email === 'sophak.ly@dcd.gov.kh')) {
          parsed.fullName = 'Admin';
          parsed.email = 'admin@dcd.gov.kh';
        }
        return parsed;
      } catch (e) {
        // Fallback below
      }
    }
    // Logged in by default with a high-profile officer account
    return {
      id: 'USER_DEFAULT',
      fullName: 'Admin',
      email: 'admin@dcd.gov.kh',
      officeId: 'OFF_ADMIN',
      role: 'មន្ត្រីជាន់ខ្ពស់'
    };
  });

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('DCD_REGISTERED_USERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((u: any) => {
            if (u.id === 'USER_DEFAULT' || u.fullName === 'លី សុភ័ក្រ' || u.email === 'sophak.ly@dcd.gov.kh') {
              return {
                id: 'USER_DEFAULT',
                fullName: 'Admin',
                email: 'admin@dcd.gov.kh',
                password: 'admin',
                officeId: 'OFF_ADMIN',
                role: 'មន្ត្រីជាន់ខ្ពស់'
              };
            }
            return u;
          });
        }
      } catch (e) {
        // Fallback below
      }
    }
    return [
      {
        id: 'USER_DEFAULT',
        fullName: 'Admin',
        email: 'admin@dcd.gov.kh',
        password: 'admin',
        officeId: 'OFF_ADMIN',
        role: 'មន្ត្រីជាន់ខ្ពស់'
      }
    ];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('DCD_CURRENT_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('DCD_CURRENT_USER');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('DCD_REGISTERED_USERS', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<string>('ANALYTICS');

  // --- MODAL & PREVIEW STATES ---
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpOffice, setSignUpOffice] = useState('OFF_ADMIN');
  const [signUpRole, setSignUpRole] = useState('មន្ត្រីគ្រប់គ្រង');

  // --- CRUD DISPATCH ACTION HANDLERS ---
  
  const handleOpenAdd = () => {
    setEditItem(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditItem(item);
    setAddEditModalOpen(true);
  };

  const handleSaveEntry = (data: any) => {
    const isEdit = !!editItem;

    if (activeTab === 'ASSETS' || activeTab === 'OFFICES' || activeTab === 'ICT') {
      if (isEdit) {
        setAssets(prev => prev.map(a => a.id === data.id ? data : a));
      } else {
        const newAsset: Asset = {
          ...data,
          id: `ASSET_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setAssets(prev => [...prev, newAsset]);
      }
    } 
    else if (activeTab === 'HANDOVERS') {
      if (isEdit) {
        setHandovers(prev => prev.map(h => h.id === data.id ? data : h));
      } else {
        const newHandover: HandoverRecord = {
          ...data,
          id: `HO_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setHandovers(prev => [...prev, newHandover]);
      }
    } 
    else if (activeTab === 'MOVEMENTS') {
      if (isEdit) {
        setMovements(prev => prev.map(m => m.id === data.id ? data : m));
      } else {
        const newMovement: MovementRecord = {
          ...data,
          id: `MV_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setMovements(prev => [...prev, newMovement]);

        // Dynamically update the holding Office ID & holding responsible person in the core Assets registry
        setAssets(prev => prev.map(a => {
          if (a.id === data.assetId || a.code === data.assetCode) {
            return {
              ...a,
              officeId: data.toOfficeId,
              responsiblePerson: data.responsiblePerson
            };
          }
          return a;
        }));
      }
    } 
    else if (activeTab === 'MAINTENANCE') {
      if (isEdit) {
        setMaintenance(prev => prev.map(m => m.id === data.id ? data : m));
      } else {
        const newMaintenance: MaintenanceRecord = {
          ...data,
          id: `MT_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setMaintenance(prev => [...prev, newMaintenance]);
      }
    } 
    else if (activeTab === 'DAMAGED_LOST') {
      if (isEdit) {
        setDamagedLost(prev => prev.map(d => d.id === data.id ? data : d));
      } else {
        const newDamaged: DamagedLostRecord = {
          ...data,
          id: `DL_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setDamagedLost(prev => [...prev, newDamaged]);

        // Dynamically update the asset quality status in the core Assets registry
        setAssets(prev => prev.map(a => {
          if (a.id === data.assetId || a.code === data.assetCode) {
            return {
              ...a,
              status: data.type === 'បាត់បង់' ? 'បាត់បង់' : 'ខូចធ្ងន់'
            };
          }
          return a;
        }));
      }
    } 
    else if (activeTab === 'WRITEOFFS') {
      if (isEdit) {
        setWriteoffs(prev => prev.map(w => w.id === data.id ? data : w));
      } else {
        const newWriteoff: WriteOffRecord = {
          ...data,
          id: `WO_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setWriteoffs(prev => [...prev, newWriteoff]);
      }
    } 
    else if (activeTab === 'STOCK_ITEMS') {
      if (isEdit) {
        setStockItems(prev => prev.map(s => s.id === data.id ? data : s));
      } else {
        const newStock: StockItem = {
          ...data,
          id: `STK_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setStockItems(prev => [...prev, newStock]);
      }
    } 
    else if (activeTab === 'AUDITS') {
      if (isEdit) {
        setAudits(prev => prev.map(a => a.id === data.id ? data : a));
      } else {
        const newAudit: AnnualAuditRecord = {
          ...data,
          id: `AD_${Math.floor(1000 + Math.random() * 9000)}`
        };
        setAudits(prev => [...prev, newAudit]);
      }
    }

    setAddEditModalOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុបព័ត៌មាននេះចេញពីប្រព័ន្ធមែនទេ?')) return;

    if (activeTab === 'ASSETS' || activeTab === 'OFFICES' || activeTab === 'ICT') {
      setAssets(prev => prev.filter(a => a.id !== id));
    } else if (activeTab === 'HANDOVERS') {
      setHandovers(prev => prev.filter(h => h.id !== id));
    } else if (activeTab === 'MOVEMENTS') {
      setMovements(prev => prev.filter(m => m.id !== id));
    } else if (activeTab === 'MAINTENANCE') {
      setMaintenance(prev => prev.filter(m => m.id !== id));
    } else if (activeTab === 'DAMAGED_LOST') {
      setDamagedLost(prev => prev.filter(d => d.id !== id));
    } else if (activeTab === 'WRITEOFFS') {
      setWriteoffs(prev => prev.filter(w => w.id !== id));
    } else if (activeTab === 'STOCK_ITEMS') {
      setStockItems(prev => prev.filter(s => s.id !== id));
      setStockTransactions(prev => prev.filter(tx => tx.itemId !== id));
    } else if (activeTab === 'AUDITS') {
      setAudits(prev => prev.filter(a => a.id !== id));
    }
  };

  // Dedicated Stock transaction handler (IN/OUT logging)
  const handleStockTransaction = (itemId: string, type: 'IN' | 'OUT', quantity: number, person: string, doc: string) => {
    
    // 1. Log transaction
    const targetItem = stockItems.find(s => s.id === itemId);
    if (!targetItem) return;

    const balanceAfter = type === 'IN' 
      ? targetItem.currentBalance + quantity 
      : Math.max(0, targetItem.currentBalance - quantity);

    const newTx: StockTransaction = {
      id: `TX_${Math.floor(1000 + Math.random() * 9000)}`,
      itemId,
      itemName: targetItem.name,
      date: new Date().toISOString().split('T')[0],
      type,
      quantity,
      balanceAfter,
      receiverOrGiver: person,
      referenceDoc: doc
    };

    setStockTransactions(prev => [newTx, ...prev]);

    // 2. Adjust balance in main array
    setStockItems(prev => prev.map(s => {
      if (s.id === itemId) {
        return {
          ...s,
          currentBalance: balanceAfter
        };
      }
      return s;
    }));
  };

  const getBannerDetails = () => {
    const details: Record<string, { title: string; desc: string }> = {
      ASSETS: {
        title: lang === 'KM' ? '១. បញ្ជីសារពើភណ្ឌទ្រព្យសម្បត្តិរដ្ឋ (Asset Register)' : '1. State Asset Register',
        desc: lang === 'KM' 
          ? 'កត់ត្រាព័ត៌មានទ្រព្យសម្បត្តិទាំងអស់រួមមាន លេខកូដសម្គាល់ ឈ្មោះប្រភេទទ្រព្យ បរិមាណ តម្លៃដើម ប្រភពថវិការៀបចំ ទីតាំងប្រើប្រាស់ និងមន្ត្រីទទួលខុសត្រូវខ្ពស់។'
          : 'Records all state asset entries, including unique ID codes, categorization, unit counts, valuation cost, source budgets, locations, and custodian assignments.'
      },
      OFFICES: {
        title: lang === 'KM' ? '២. បញ្ជីទ្រព្យសម្បត្តិតាមការិយាល័យ (Office Asset List)' : '2. Assets by Office/Location',
        desc: lang === 'KM'
          ? 'តម្រៀប និងបង្ហាញព័ត៌មានទ្រព្យសម្បត្តិរដ្ឋទាំងអស់ បែងចែកដាច់ដោយឡែកពីគ្នាស្របតាមការិយាល័យទាំង៧ ចំណុះឱ្យនាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា។'
          : 'Sorts, groups, and displays registered assets separated specifically across each of the 7 offices under the department.'
      },
      HANDOVERS: {
        title: lang === 'KM' ? '៣. បញ្ជីប្រគល់-ទទួលទ្រព្យសម្បត្តិ (Handover Register)' : '3. Employee Handover Ledger',
        desc: lang === 'KM'
          ? 'កត់ត្រាការចាត់ចែងប្រគល់ឧបករណ៍ទ្រព្យសម្បត្តិរដ្ឋជូនមន្ត្រី ឬបុគ្គលិកប្រើប្រាស់ផ្ទាល់ខ្លួនដើម្បីបំពេញការងារ កាលបរិច្ឆេទប្រគល់ និងហត្ថលេខាទទួលសន្យាថែទាំ។'
          : 'Tracks handovers of state assets to personnel/officers for personal office assignment, dates, and custody acceptance.'
      },
      MOVEMENTS: {
        title: lang === 'KM' ? '៤. បញ្ជីចលនាទ្រព្យសម្បត្តិ (Movement Register)' : '4. Asset Movement Log',
        desc: lang === 'KM'
          ? 'ចងក្រងរាល់ការផ្លាស់ប្តូរទីតាំងចរាចរណ៍ទ្រព្យសម្បត្តិផ្ទេររវាងការិយាល័យ ខ្ចីប្រើប្រាស់បណ្តោះអាសន្ន ឬការដកហូតឧបករណ៍ប្រគល់ត្រឡប់មកនាយកដ្ឋានវិញ។'
          : 'Logs all temporary borrowings, permanent transfers, or retrievals of assets shifting between different sub-department offices.'
      },
      MAINTENANCE: {
        title: lang === 'KM' ? '៥. បញ្ជីជួសជុល និងថែទាំ (Maintenance Register)' : '5. Repairs & Maintenance',
        desc: lang === 'KM'
          ? 'តាមដានរាល់កំណត់ត្រាការចំណាយថវិកាជួសជុល និងថែទាំឧបករណ៍របស់នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា កាលបរិច្ឆេទ ប្រភេទសេវាកម្ម និងហាងសហការ។'
          : 'Monitors historical repair records, maintenance costs, service dates, provider details, and equipment downtime logs.'
      },
      DAMAGED_LOST: {
        title: lang === 'KM' ? '៦. បញ្ជីទ្រព្យសម្បត្តិខូច ឬបាត់បង់ (Damaged/Lost Register)' : '6. Damaged / Lost Registry',
        desc: lang === 'KM'
          ? 'កត់ត្រាឧបករណ៍ដែលរងការខូចខាតធ្ងន់ធ្ងរមិនអាចដំណើរការបាន ឬការបាត់បង់ដែលកើតឡើងជាយថាហេតុ រួមទាំងមូលហេតុ និងរបាយការណ៍ស៊ើបអង្កេត។'
          : 'Tracks severe damages, technical malfunctions, or accidental losses alongside detailed investigation records.'
      },
      WRITEOFFS: {
        title: lang === 'KM' ? '៧. បញ្ជីស្នើសុំកាត់ចេញពីបញ្ជីសារពើភណ្ឌ (Write-off Register)' : '7. Asset Write-Off Requests',
        desc: lang === 'KM'
          ? 'ចងក្រងឯកសារសំណើស្នើសុំកាត់ឧបករណ៍ចេញពីបញ្ជីសារពើភណ្ឌរដ្ឋ ចំពោះឧបករណ៍ដែលហួសអាយុកាលប្រើប្រាស់ ខូចខាតមិនអាចជួសជុល ឬបាត់បង់ដោយមានអនុម័ត។'
          : 'Manages proposals and files to write off assets from the government inventory due to age, decay, or verified loss.'
      },
      STOCK_ITEMS: {
        title: lang === 'KM' ? '៨. បញ្ជីសន្និធិសម្ភារៈការិយាល័យ (Stock Card Register)' : '8. Office Supplies Inventory',
        desc: lang === 'KM'
          ? 'គ្រប់គ្រងលំហូរសន្និធិសម្ភារៈការិយាល័យប្រើប្រាស់អស់ជាប្រចាំ (ក្រដាស A4, ប៊ិច, ថូណឺរព្រីនទ័រ HP, និងឯកសារផ្សេងៗ) កត់ត្រាលំហូរ ចូល ចេញ និងសមតុល្យជាក់ស្តែង។'
          : 'Coordinates stock levels of consumable office supplies (paper, ink cartridges, pens) with inbound/outbound flow cards.'
      },
      AUDITS: {
        title: lang === 'KM' ? '៩. បញ្ជីរាប់សារពើភណ្ឌប្រចាំឆ្នាំ (Annual Inventory Audit)' : '9. Annual Inventory Audits',
        desc: lang === 'KM'
          ? 'របាយការណ៍ផ្ទៀងផ្ទាត់ និងការរាប់ទ្រព្យជាក់ស្តែងប្រចាំឆ្នាំរបស់គណៈកម្មការត្រួតពិនិត្យ ធៀបនឹងបញ្ជីសារពើភណ្ឌរួម ដើម្បីវាយតម្លៃភាពលើសខ្វះ និងផ្តល់អនុសាសន៍។'
          : 'Annual validation reports of physical asset counts conducted by committees to assess variance against registry records.'
      },
      ICT: {
        title: lang === 'KM' ? '១០. បញ្ជីទ្រព្យសម្បត្តិបច្ចេកវិទ្យាព័ត៌មាន (ICT Asset Register)' : '10. Dedicated ICT Registry',
        desc: lang === 'KM'
          ? 'បញ្ជីលម្អិតផ្តោតជាពិសេសលើទ្រព្យសម្បត្តិផ្នែកបច្ចេកវិទ្យាព័ត៌មាន (ICT) រួមមាន Desktops, Laptops, Printers, Scanners, Projectors, Servers, UPS, និងឧបករណ៍បណ្តាញ។'
          : 'Monitors technology infrastructure assets specifically (workstations, servers, routers, laptops, printers, accessories).'
      },
      DOCUMENTS: {
        title: lang === 'KM' ? '១១. បញ្ជីគ្រប់គ្រងឯកសារ (Document Management Register)' : '11. Document Management Register',
        desc: lang === 'KM'
          ? 'ផ្ទុក និងគ្រប់គ្រងឯកសារសារពើភណ្ឌរដ្ឋ វិក្កយបត្រទិញចូល លិខិតផ្ទេរប្រគល់ផ្លូវការ និងរបាយការណ៍សន្និធិផ្សេងៗ ដោយអនុញ្ញាតឱ្យបញ្ចូល (Upload) និងទាញយក (Download) គ្រប់ប្រភេទឯកសារ格式។'
          : 'Store and manage state asset inventories, purchase invoices, official handover letters, and auditing report documents with full upload and download support.'
      },
      SETTINGS: {
        title: lang === 'KM' ? '១២. ការកំណត់រចនាសម្ព័ន្ធ Admin (Admin Settings)' : '12. Admin Configuration Settings',
        desc: lang === 'KM'
          ? 'គ្រប់គ្រងសិទ្ធិប្រើប្រាស់ បង្ហោះរាល់ប្រភេទឯកសារ និងនាំចេញ/នាំចូលទិន្នន័យប្រព័ន្ធទូទៅ'
          : 'Configure roles, upload official assets documents, and perform full system database backup imports/exports.'
      }
    };
    return details[activeTab] || { title: '', desc: '' };
  };

  const banner = getBannerDetails();

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark text-slate-100' : 'text-slate-800'} overflow-hidden font-sans transition-colors duration-200 relative`}>
      
      {/* Liquid Glass Dynamic Background Mesh */}
      <div className="liquid-bg-mesh">
        <div className="liquid-blob liquid-blob-1" />
        <div className="liquid-blob liquid-blob-2" />
        <div className="liquid-blob liquid-blob-3" />
      </div>

      {/* 1. Permanent Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenDocuments={() => setDocumentsOpen(true)}
        lang={lang}
        currentUser={currentUser}
        onSignOut={() => setCurrentUser(null)}
        onOpenSignIn={() => setSignInOpen(true)}
        onOpenSignUp={() => setSignUpOpen(true)}
        systemLogo={systemLogo}
        onLogoChange={setSystemLogo}
        logoScale={logoScale}
        setLogoScale={setLogoScale}
        logoX={logoX}
        setLogoX={setLogoX}
        logoY={logoY}
        setLogoY={setLogoY}
      />

      {/* Right Column Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/70 dark:bg-slate-950/70">
        
        {/* 2. Top Header */}
        <Header 
          assets={assets} 
          stockItems={stockItems} 
          handovers={handovers}
          movements={movements}
          maintenance={maintenance}
          damagedLost={damagedLost}
          writeoffs={writeoffs}
          audits={audits}
          lang={lang} 
          setLang={setLang} 
          theme={theme} 
          setTheme={setTheme} 
          systemLogo={systemLogo}
          logoScale={logoScale}
          logoX={logoX}
          logoY={logoY}
        />

        {/* 3. Main Workspace Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-100/50 dark:bg-slate-950/50 backdrop-blur-md">
          
          {activeTab === 'ANALYTICS' ? (
            <AnalyticsDashboard 
              assets={assets} 
              stockItems={stockItems} 
              maintenance={maintenance} 
              lang={lang}
            />
          ) : activeTab === 'SETTINGS' ? (
            <AdminSettings 
              lang={lang}
              currentUser={currentUser}
              registeredUsers={registeredUsers}
              setRegisteredUsers={setRegisteredUsers}
              assets={assets}
              setAssets={setAssets}
              handovers={handovers}
              setHandovers={setHandovers}
              movements={movements}
              setMovements={setMovements}
              damagedLost={damagedLost}
              setDamagedLost={setDamagedLost}
              maintenance={maintenance}
              setMaintenance={setMaintenance}
              writeoffs={writeoffs}
              setWriteoffs={setWriteoffs}
              stockItems={stockItems}
              setStockItems={setStockItems}
              stockTransactions={stockTransactions}
              setStockTransactions={setStockTransactions}
              audits={audits}
              setAudits={setAudits}
              documents={documents}
              setDocuments={setDocuments}
              systemLogo={systemLogo}
              onLogoChange={setSystemLogo}
              logoScale={logoScale}
              setLogoScale={setLogoScale}
              logoX={logoX}
              setLogoX={setLogoX}
              logoY={logoY}
              setLogoY={setLogoY}
            />
          ) : (
            <div className="space-y-4 animate-fade-in">
              
              {/* Context Specific Explanations Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-xl space-y-2">
                  <h3 className="text-md font-bold">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-normal font-medium">
                    {banner.desc}
                  </p>
                </div>
                {/* Visual Accent */}
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-blue-500/15 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Dynamic Interactive Register Tables */}
              <RegisterTable
                activeRegister={activeTab}
                assets={assets}
                handovers={handovers}
                movements={movements}
                damagedLost={damagedLost}
                maintenance={maintenance}
                writeoffs={writeoffs}
                stockItems={stockItems}
                stockTransactions={stockTransactions}
                audits={audits}
                documents={documents}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteEntry}
                onViewDetail={(a) => setSelectedAsset(a)}
                onAddStockTransaction={handleStockTransaction}
                onAddDocument={(doc) => setDocuments(prev => [doc, ...prev])}
                onDeleteDocument={(id) => {
                  if (confirm(lang === 'KM' ? 'តើអ្នកប្រាកដជាចង់លុបឯកសារនេះមែនទេ?' : 'Are you sure you want to delete this document?')) {
                    setDocuments(prev => prev.filter(d => d.id !== id));
                  }
                }}
                lang={lang}
              />
            </div>
          )}

        </div>

      </div>

      {/* --- OVERLAY MODALS --- */}

      {/* 1. Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          handovers={handovers}
          movements={movements}
          maintenance={maintenance}
          audits={audits}
          onClose={() => setSelectedAsset(null)}
          onPrintCard={(assetId) => {
            setSelectedAsset(null);
            setDocumentsOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* 2. Add / Edit Modal */}
      {addEditModalOpen && (
        <AddEditModal
          registerType={activeTab}
          editItem={editItem}
          assets={assets}
          onSave={handleSaveEntry}
          onBulkSave={(importedAssets) => {
            const processed = importedAssets.map(a => ({
              ...a,
              isICT: activeTab === 'ICT' ? true : (a.isICT !== undefined ? a.isICT : false),
              id: a.id || `ASSET_${Math.floor(100000 + Math.random() * 900000)}`
            }));
            setAssets(prev => [...prev, ...processed]);
            setAddEditModalOpen(false);
          }}
          onClose={() => setAddEditModalOpen(false)}
          lang={lang}
        />
      )}

      {/* 3. Official Documents Generator & Printing Modal (Forms overlay) */}
      {documentsOpen && (
        <DocumentTemplates
          assets={assets}
          stockItems={stockItems}
          handovers={handovers}
          movements={movements}
          maintenance={maintenance}
          writeoffs={writeoffs}
          audits={audits}
          stockTransactions={stockTransactions}
          onClose={() => setDocumentsOpen(false)}
        />
      )}

      {/* 4. SIGN IN MODAL */}
      {signInOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden animate-fade-in">
            <button
              onClick={() => {
                setSignInOpen(false);
                setSignInError('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-blue-500/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {lang === 'KM' ? 'ចូលគណនីមន្ត្រីគ្រប់គ្រង' : 'Officer Sign In'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {lang === 'KM' ? 'សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីចូលប្រព័ន្ធ' : 'Please complete fields below to sign in'}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const user = registeredUsers.find(u => u.email === signInEmail && u.password === signInPassword);
              if (user) {
                setCurrentUser(user);
                setSignInEmail('');
                setSignInPassword('');
                setSignInError('');
                setSignInOpen(false);
              } else {
                setSignInError(lang === 'KM' ? 'អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ!' : 'Invalid email or password!');
              }
            }} className="space-y-4 text-xs font-semibold">
              {signInError && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-100 dark:border-red-900/40 font-bold text-center">
                  {signInError}
                </div>
              )}

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  {lang === 'KM' ? 'អាសយដ្ឋានអ៊ីមែល (Email Address)' : 'Email Address'} *
                </label>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="admin@dcd.gov.kh"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  {lang === 'KM' ? 'លេខសម្ងាត់ (Password)' : 'Password'} *
                </label>
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSignInOpen(false);
                    setSignInError('');
                  }}
                  className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
                >
                  {lang === 'KM' ? 'បដិសេធ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-100 dark:shadow-transparent cursor-pointer text-center"
                >
                  {lang === 'KM' ? 'ចូលប្រព័ន្ធ' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-450">
              {lang === 'KM' ? 'មិនទាន់មានគណនីមែនទេ?' : "Don't have an account?"} {' '}
              <button
                onClick={() => {
                  setSignInOpen(false);
                  setSignInError('');
                  setSignUpOpen(true);
                }}
                className="text-blue-600 hover:underline font-bold"
              >
                {lang === 'KM' ? 'ចុះឈ្មោះឥឡូវនេះ' : 'Sign Up Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SIGN UP MODAL */}
      {signUpOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden animate-fade-in">
            <button
              onClick={() => setSignUpOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-blue-500/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {lang === 'KM' ? 'ចុះឈ្មោះមន្ត្រីគ្រប់គ្រងថ្មី' : 'Officer Sign Up'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {lang === 'KM' ? 'បង្កើតគណនីថ្មីសម្រាប់ការិយាល័យសារពើភណ្ឌ' : 'Create a new account for inventory registries'}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!signUpName || !signUpEmail || !signUpPassword) {
                alert(lang === 'KM' ? 'សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!' : 'Please fill all required fields!');
                return;
              }
              const emailExists = registeredUsers.some(u => u.email === signUpEmail);
              if (emailExists) {
                alert(lang === 'KM' ? 'អ៊ីមែលនេះមានរួចហើយនៅក្នុងប្រព័ន្ធ!' : 'This email already exists in the system!');
                return;
              }

              const newUser: UserAccount = {
                id: `USER_${Date.now()}`,
                fullName: signUpName,
                email: signUpEmail,
                password: signUpPassword,
                officeId: signUpOffice,
                role: signUpRole
              };

              setRegisteredUsers(prev => [...prev, newUser]);
              setCurrentUser(newUser);

              // Clear and close
              setSignUpName('');
              setSignUpEmail('');
              setSignUpPassword('');
              setSignUpOffice('OFF_ADMIN');
              setSignUpRole('មន្ត្រីគ្រប់គ្រង');
              setSignUpOpen(false);
            }} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  {lang === 'KM' ? 'នាមនិងគោត្តនាម (Full Name)' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder={lang === 'KM' ? "សុក ជា" : "Sok Chea"}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  {lang === 'KM' ? 'អាសយដ្ឋានអ៊ីមែល (Email Address)' : 'Email Address'} *
                </label>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="user@dcd.gov.kh"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                  {lang === 'KM' ? 'លេខសម្ងាត់ (Password)' : 'Password'} *
                </label>
                <input
                  type="password"
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                    {lang === 'KM' ? 'ការិយាល័យ (Office)' : 'Office'}
                  </label>
                  <select
                    value={signUpOffice}
                    onChange={(e) => setSignUpOffice(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium outline-none"
                  >
                    <option value="OFF_ADMIN">ការិយាល័យរដ្ឋបាល</option>
                    <option value="OFF_ACC">ការិយាល័យគណនេយ្យ</option>
                    <option value="OFF_ICT">ការិយាល័យព័ត៌មានវិទ្យា</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                    {lang === 'KM' ? 'តួនាទី (Role)' : 'Role'}
                  </label>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium outline-none"
                  >
                    <option value="មន្ត្រីគ្រប់គ្រង">{lang === 'KM' ? 'មន្ត្រីគ្រប់គ្រង' : 'Registry Officer'}</option>
                    <option value="មន្ត្រីជាន់ខ្ពស់">{lang === 'KM' ? 'មន្ត្រីជាន់ខ្ពស់' : 'Senior Officer'}</option>
                    <option value="មន្ត្រីព័ត៌មានវិទ្យា">{lang === 'KM' ? 'មន្ត្រីព័ត៌មានវិទ្យា' : 'ICT Officer'}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSignUpOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
                >
                  {lang === 'KM' ? 'បដិសេធ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-100 dark:shadow-transparent cursor-pointer text-center"
                >
                  {lang === 'KM' ? 'ចុះឈ្មោះ' : 'Sign Up'}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-450">
              {lang === 'KM' ? 'មានគណនីរួចហើយមែនទេ?' : 'Already have an account?'} {' '}
              <button
                onClick={() => {
                  setSignUpOpen(false);
                  setSignInOpen(true);
                }}
                className="text-blue-600 hover:underline font-bold"
              >
                {lang === 'KM' ? 'ចូលប្រព័ន្ធទីនេះ' : 'Sign In Here'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
