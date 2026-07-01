/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Offices of the Curriculum Development Department
export interface Office {
  id: string;
  name: string; // Khmer Name
  code: string; // Short code
}

// Asset Classifications
export type AssetCategory = 'FURNITURE' | 'TECHNOLOGY' | 'BOOKS' | 'VEHICLE' | 'CONSUMABLE';

export interface CategoryInfo {
  id: AssetCategory;
  name: string; // Khmer Name
  color: string; // Tailwind color class
}

// 1. Asset Register (បញ្ជីសារពើភណ្ឌទ្រព្យសម្បត្តិរដ្ឋ)
export interface Asset {
  id: string;
  code: string; // លេខកូដសម្គាល់ទ្រព្យ
  name: string; // ឈ្មោះទ្រព្យ
  category: AssetCategory; // ប្រភេទទ្រព្យ
  quantity: number; // បរិមាណ
  cost: number; // តម្លៃដើម (រៀល ឬ ដុល្លារ)
  dateReceived: string; // កាលបរិច្ឆេទទទួល
  budgetSource: string; // ប្រភពថវិកា (រដ្ឋ, ដៃគូអភិវឌ្ឍន៍, ...)
  officeId: string; // ទីតាំងប្រើប្រាស់ (ការិយាល័យ)
  responsiblePerson: string; // អ្នកទទួលខុសត្រូវ
  status: 'ល្អ' | 'មធ្យម' | 'ខូចស្រាល' | 'ខូចធ្ងន់' | 'បាត់បង់';
  isICT: boolean; // True if it belongs to ICT Register
  serialNumber?: string; // For ICT
  ipAddress?: string; // For ICT
  warranty?: string; // For ICT (e.g. 12 ខែ, អស់ការធានា)
  imageName?: string; // ឈ្មោះរូបភាព
  imageData?: string; // ទិន្នន័យរូបភាពជា Base64
  documentName?: string; // ឈ្មោះឯកសារភ្ជាប់ (Word/Excel/PDF)
  documentData?: string; // ទិន្នន័យឯកសារភ្ជាប់ជា Base64
}

// 3. Asset Handover (បញ្ជីប្រគល់-ទទួលទ្រព្យសម្បត្តិ)
export interface HandoverRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  staffName: string; // បុគ្គលិកទទួល
  handoverDate: string; // កាលបរិច្ឆេទប្រគល់
  giverName: string; // អ្នកប្រគល់
  receiverName: string; // អ្នកទទួល
  status: string; // ស្ថានភាពទ្រព្យ (ឧ. ថ្មីស្រឡាង, ល្អបង្គួរ)
}

// 4. Asset Movement (បញ្ជីចលនាទ្រព្យសម្បត្តិ)
export interface MovementRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  fromOfficeId: string; // ពីការិយាល័យ
  toOfficeId: string; // ទៅការិយាល័យ
  type: 'ផ្ទេរជាអចិន្ត្រៃយ៍' | 'ខ្ចីបណ្តោះអាសន្ន' | 'ដកហូតប្រគល់ត្រឡប់';
  date: string; // កាលបរិច្ឆេទចលនា
  responsiblePerson: string; // អ្នកទទួលខុសត្រូវថ្មី
}

// 5. Maintenance (បញ្ជីជួសជុល និងថែទាំ)
export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  repairDate: string; // កាលបរិច្ឆេទជួសជុល
  repairType: string; // ប្រភេទជួសជុល (ឧ. ប្តូរអេក្រង់, ជួសជុលម៉ាស៊ីនត្រជាក់)
  cost: number; // ថ្លៃជួសជុល
  provider: string; // អ្នកផ្គត់ផ្គង់សេវា
}

// 6. Damaged or Lost (បញ្ជីទ្រព្យសម្បត្តិខូច ឬបាត់បង់)
export interface DamagedLostRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  type: 'ខូចខាតធ្ងន់ធ្ងរ' | 'បាត់បង់';
  date: string;
  reason: string; // មូលហេតុខូច/បាត់
  investigationReport: string; // របាយការណ៍ស៊ើបអង្កេត
  proposal: string; // សំណើដោះស្រាយ (ឧ. ទិញជំនួស, ផាកពិន័យ, កាត់រំលាយ)
}

// 7. Write-off Request (បញ្ជីស្នើសុំកាត់ចេញពីបញ្ជីសារពើភណ្ឌ)
export interface WriteOffRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  reason: 'ហួសអាយុកាលប្រើប្រាស់' | 'ខូចមិនអាចជួសជុលបាន' | 'បាត់បង់ដោយមានការអនុម័ត' | 'ផ្សេងៗ';
  requestDate: string;
  approvedDate?: string;
  status: 'កំពុងពិនិត្យ' | 'បានអនុម័ត' | 'បដិសេធ';
  notes?: string;
}

// 8. Stock Card (បញ្ជីសន្និធិសម្ភារៈការិយាល័យ)
export interface StockItem {
  id: string;
  name: string; // ក្រដាស A4, ប៊ិច, ថូណឺរ, etc.
  unit: string; // រាម, ដើម, កំប៉ុង, etc.
  minStock: number; // កម្រិតសុវត្ថិភាព
  currentBalance: number;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  type: 'IN' | 'OUT';
  quantity: number;
  balanceAfter: number;
  receiverOrGiver: string; // អ្នកទទួល ឬអ្នកប្រគល់
  referenceDoc: string; // លិខិតយោង/វិក្កយបត្រ
}

// 9. Annual Inventory Audit (បញ្ជីរាប់សារពើភណ្ឌប្រចាំឆ្នាំ)
export interface AnnualAuditRecord {
  id: string;
  year: string; // ឆ្នាំរាប់ (ឧ. ២០២៥, ២០២៦)
  committee: string; // គណៈកម្មការរាប់សារពើភណ្ឌ
  auditDate: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  registeredQty: number; // ចំនួនក្នុងបញ្ជី
  actualQty: number; // ចំនួនជាក់ស្តែង
  diff: number; // ភាពលើស ឬខ្វះ (+ ឬ -)
  recommendations: string; // អនុសាសន៍
}

// 11. Document Management File (បញ្ជីគ្រប់គ្រងឯកសារ)
export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  category: string; // e.g. "វិក្កយបត្រ", "លិខិតផ្លូវការ", "របាយការណ៍", "ផ្សេងៗ"
  description: string;
  fileData?: string; // Base64 data URI or Object URL
}

// Officer/Manager User Account (គណនីមន្ត្រីគ្រប់គ្រង)
export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  officeId: string;
  role: string; // e.g. "មន្ត្រីជាន់ខ្ពស់", "មន្ត្រីគ្រប់គ្រង", "មន្ត្រីព័ត៌មានវិទ្យា"
}

