/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Office, CategoryInfo, Asset, HandoverRecord, MovementRecord, MaintenanceRecord, DamagedLostRecord, WriteOffRecord, StockItem, StockTransaction, AnnualAuditRecord } from '../types';

export const OFFICES: Office[] = [
  { id: 'OFFICE_GEN', name: 'ការិយាល័យគ្រប់គ្រងទូទៅ', code: 'កគទ' },
  { id: 'OFFICE_RES', name: 'ការិយាល័យស្រាវជ្រាវ និងនវានុវត្តន៍', code: 'កសន' },
  { id: 'OFFICE_LAN', name: 'ការិយាល័យកម្មវិធីសិក្សាភាសា និងវិទ្យាសាស្ត្រសង្គម', code: 'កភស' },
  { id: 'OFFICE_MTH', name: 'ការិយាល័យវិធីសិក្សាគណិតវិទ្យា និងវិទ្យាសាស្ត្រ', code: 'កគវ' },
  { id: 'OFFICE_LIB', name: 'ការិយាល័យគ្រប់គ្រងបណ្ណាល័យ', code: 'កគប' },
  { id: 'OFFICE_TXB', name: 'ការិយាល័យគ្រប់គ្រងសៀវភៅសិក្សា', code: 'កគស' },
  { id: 'OFFICE_LIF', name: 'ការិយាល័យកម្មវិធីសិក្សាអប់រំបំណិនជីវិត', code: 'កបជ' }
];

export const CATEGORIES: CategoryInfo[] = [
  { id: 'FURNITURE', name: 'គ្រឿងសង្ហារិម', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'TECHNOLOGY', name: 'សម្ភារៈបច្ចេកវិទ្យា', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'BOOKS', name: 'សៀវភៅ និងឯកសារ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'VEHICLE', name: 'យានយន្ត', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'CONSUMABLE', name: 'សម្ភារៈការិយាល័យប្រើប្រាស់អស់', color: 'bg-slate-100 text-slate-800 border-slate-200' }
];

// Seed realistic assets (បញ្ជីសារពើភណ្ឌទ្រព្យសម្បត្តិរដ្ឋ - គ្រឿងសង្ហារិម, បច្គេកវិទ្យា, សៀវភៅ, យានយន្ត)
export const INITIAL_ASSETS: Asset[] = [];

// Seed Handovers (បញ្ជីប្រគល់-ទទួលទ្រព្យសម្បត្តិ)
export const INITIAL_HANDOVERS: HandoverRecord[] = [];

// Seed Movements (បញ្ជីចលនាទ្រព្យសម្បត្តិ)
export const INITIAL_MOVEMENTS: MovementRecord[] = [];

// Seed Maintenance Records (បញ្ជីជួសជុល និងថែទាំ)
export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [];

// Seed Damaged/Lost (បញ្ជីទ្រព្យសម្បត្តិខូច ឬបាត់បង់)
export const INITIAL_DAMAGED_LOST: DamagedLostRecord[] = [];

// Seed Write-Off Requests (បញ្ជីស្នើសុំកាត់ចេញពីបញ្ជីសារពើភណ្ឌ)
export const INITIAL_WRITEOFFS: WriteOffRecord[] = [];

// Seed Consumables Stocks (បញ្ជីសន្និធិសម្ភារៈការិយាល័យ - Stock Card)
export const INITIAL_STOCK_ITEMS: StockItem[] = [];

// Seed Stock Card Transactions
export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [];

// Seed Annual Inventory Audit (បញ្ជីរាប់សារពើភណ្ឌប្រចាំឆ្នាំ)
export const INITIAL_AUDITS: AnnualAuditRecord[] = [];

