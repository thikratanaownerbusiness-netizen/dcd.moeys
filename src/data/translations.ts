export type Language = 'KM' | 'EN';

export interface Translations {
  appName: string;
  deptName: string;
  officialLedger: string;
  activeSystem: string;
  lowStockAlert: string;
  printFormsBtn: string;
  officerAccount: string;
  officerName: string;
  adminLevel: string;
  searchPlaceholder: string;
  addNewBtn: string;
  editInfoTitle: string;
  addNewTitle: string;
  closeBtn: string;
  saveBtn: string;
  cancelBtn: string;
  dashboard: string;
  
  // Sidebar items
  menuDashboard: string;
  menuAssets: string;
  menuOffices: string;
  menuHandovers: string;
  menuMovements: string;
  menuMaintenance: string;
  menuDamagedLost: string;
  menuWriteoffs: string;
  menuStock: string;
  menuAudits: string;
  menuIct: string;
  menuDocuments: string;
  
  // Section Titles & Subtitles
  officeSectionLabel: string;
  ledgerSectionLabel: string;
  
  // Dashboard Metrics
  totalAssets: string;
  totalCost: string;
  underRepair: string;
  lowStockItems: string;
  itemsLabel: string;
  financialDistribution: string;
  officeDistribution: string;
  rielsLabel: string;
  unitsLabel: string;
  
  // Table Columns & Detail attributes
  assetCode: string;
  assetName: string;
  category: string;
  quantity: string;
  cost: string;
  dateReceived: string;
  budgetSource: string;
  location: string;
  responsiblePerson: string;
  status: string;
  actions: string;
  serialNumber: string;
  ipAddress: string;
  warranty: string;
  isIctQuestion: string;
  
  // Handovers
  staffName: string;
  handoverDate: string;
  giverName: string;
  receiverName: string;
  statusAtHandover: string;
  chooseAsset: string;
  
  // Movements
  fromOffice: string;
  toOffice: string;
  movementType: string;
  movementDate: string;
  newResponsiblePerson: string;
  
  // Maintenance
  repairType: string;
  repairDate: string;
  serviceCost: string;
  provider: string;
  
  // Damaged / Lost
  incidentType: string;
  incidentDate: string;
  reason: string;
  investigationReport: string;
  proposalResolution: string;
  
  // Write-offs
  writeOffReason: string;
  requestDate: string;
  approvedDate: string;
  requestStatus: string;
  notes: string;
  
  // Stock Items
  stockItemName: string;
  unit: string;
  minStockLevel: string;
  currentBalance: string;
  stockLedgerTitle: string;
  stockLedgerSub: string;
  dateCol: string;
  typeCol: string;
  qtyCol: string;
  balanceCol: string;
  receiverGiverCol: string;
  refDocCol: string;
  noTxMessage: string;
  
  // Audits
  auditYear: string;
  auditDate: string;
  auditCommittee: string;
  registeredQty: string;
  actualQty: string;
  difference: string;
  recommendations: string;
  
  // Status labels
  statusGood: string;
  statusMedium: string;
  statusMinorDamage: string;
  statusMajorDamage: string;
  statusLost: string;
  statusUnderRepair: string;
  
  // Writeoff reasons
  reasonLifespan: string;
  reasonIrreparable: string;
  reasonApprovedLost: string;
  reasonOther: string;
  
  // Writeoff statuses
  statusPending: string;
  statusApproved: string;
  statusRejected: string;
  
  // Movement types
  movePermanent: string;
  moveTemporary: string;
  moveReclaimed: string;
  
  // Common terms
  officeAll: string;
  viewDetails: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  noDataFound: string;
  printingAssetCard: string;
  assetCardBtn: string;
  recentMovementsTitle: string;
  tenMinutesAgo: string;
  oneHourAgo: string;
}

export const translations: Record<Language, Translations> = {
  KM: {
    appName: "ប្រព័ន្ធគ្រប់គ្រងទ្រព្យសម្បត្តិរដ្ឋ",
    deptName: "នាយកដ្ឋានអភិវឌ្ឍកម្មវិធីសិក្សា",
    officialLedger: "ប្រព័ន្ធគ្រប់គ្រង ទ្រព្យសម្បត្តិរដ្ឋផ្លូវការ",
    activeSystem: "ប្រព័ន្ធសកម្ម",
    lowStockAlert: "ស្តុកទាប ({count})",
    printFormsBtn: "បោះពុម្ពឯកសារផ្លូវការ (Forms)",
    officerAccount: "គណនីមន្ត្រីគ្រប់គ្រង",
    officerName: "លោក កែវ សុភ័ក្ត្រ",
    adminLevel: "លំដាប់ថ្នាក់រដ្ឋបាល",
    searchPlaceholder: "ស្វែងរកក្នុងបញ្ជីនេះ...",
    addNewBtn: "បន្ថែមព័ត៌មានថ្មី",
    editInfoTitle: "កែសម្រួលព័ត៌មានលម្អិត",
    addNewTitle: "បន្ថែមព័ត៌មានថ្មី",
    closeBtn: "បិទផ្ទាំងនេះ",
    saveBtn: "រក្សាទុក",
    cancelBtn: "បោះបង់",
    dashboard: "ផ្ទាំងគ្រប់គ្រងសរុប",
    
    // Sidebar items
    menuDashboard: "ផ្ទាំងគ្រប់គ្រងសរុប (Dashboard)",
    menuAssets: "១. បញ្ជីសារពើភណ្ឌទ្រព្យរដ្ឋ",
    menuOffices: "២. បញ្ជីទ្រព្យសម្បត្តិតាមការិយាល័យ",
    menuHandovers: "៣. បញ្ជីប្រគល់-ទទួលបុគ្គលិក",
    menuMovements: "៤. បញ្ជីចលនាផ្ទេរទ្រព្យ",
    menuMaintenance: "៥. បញ្ជីជួសជុល និងថែទាំ",
    menuDamagedLost: "៦. បញ្ជីទ្រព្យខូច ឬបាត់បង់",
    menuWriteoffs: "៧. បញ្ជីស្នើសុំកាត់ចេញ",
    menuStock: "៨. បញ្ជីសម្ភារៈការិយាល័យ",
    menuAudits: "៩. បញ្ជីរាប់សារពើភណ្ឌប្រចាំឆ្នាំ",
    menuIct: "១០. បញ្ជីទ្រព្យសម្បត្តិ ICT",
    menuDocuments: "១១. បញ្ជីគ្រប់គ្រងឯកសារ",
    
    // Section Titles & Subtitles
    officeSectionLabel: "ការិយាល័យចំណុះ",
    ledgerSectionLabel: "បញ្ជីសារពើភណ្ឌ",
    
    // Dashboard Metrics
    totalAssets: "ទ្រព្យសម្បត្តិសរុប",
    totalCost: "តម្លៃដើមសរុប",
    underRepair: "កំពុងជួសជុល",
    lowStockItems: "សម្ភារៈជិតអស់ពីនាយកដ្ឋាន",
    itemsLabel: "គ្រឿង",
    financialDistribution: "បែងចែកទំហំហិរញ្ញវត្ថុ តាមប្រភេទចាត់ថ្នាក់",
    officeDistribution: "បែងចែកបរិមាណសម្ភារៈទ្រព្យសម្បត្តិ តាមការិយាល័យ",
    rielsLabel: "គិតជា រៀល",
    unitsLabel: "គិតជា គ្រឿង/ក្បាល",
    
    // Table Columns & Detail attributes
    assetCode: "លេខកូដសម្គាល់ទ្រព្យ",
    assetName: "ឈ្មោះទ្រព្យសម្បត្តិ",
    category: "ប្រភេទទ្រព្យសម្បត្តិ",
    quantity: "បរិមាណ",
    cost: "តម្លៃដើមប៉ាន់ស្មាន",
    dateReceived: "កាលបរិច្ឆេទទទួល",
    budgetSource: "ប្រភពថវិការៀបចំ",
    location: "ការិយាល័យប្រើប្រាស់",
    responsiblePerson: "អ្នកគ្រប់គ្រងទទួលខុសត្រូវ",
    status: "ស្ថានភាពឧបករណ៍",
    actions: "សកម្មភាព",
    serialNumber: "លេខស៊េរី (Serial Number)",
    ipAddress: "អាសយដ្ឋាន IP (IP Address)",
    warranty: "សុពលភាពការធានា (Warranty)",
    isIctQuestion: "តើឧបករណ៍នេះជាប្រភេទសម្ភារៈបច្ចេកវិទ្យាព័ត៌មាន (ICT)?",
    
    // Handovers
    staffName: "ឈ្មោះបុគ្គលិកប្រើប្រាស់ផ្ទាល់",
    handoverDate: "កាលបរិច្ឆេទប្រគល់",
    giverName: "ឈ្មោះអ្នកប្រគល់ (តំណាង)",
    receiverName: "ឈ្មោះអ្នកទទួល",
    statusAtHandover: "ស្ថានភាពជាក់ស្តែងពេលប្រគល់",
    chooseAsset: "ជ្រើសរើសទ្រព្យសម្បត្តិដែលប្រគល់ជូន",
    
    // Movements
    fromOffice: "ផ្ទេរចេញពី (ទីតាំងចាស់)",
    toOffice: "ផ្ទេរចូលទៅ (ទីតាំងថ្មី)",
    movementType: "ប្រភេទនៃចលនា",
    movementDate: "កាលបរិច្ឆេទចលនា",
    newResponsiblePerson: "អ្នកទទួលខុសត្រូវថ្មី",
    
    // Maintenance
    repairType: "ប្រភេទនៃការជួសជុល",
    repairDate: "កាលបរិច្ឆេទជួសជុល",
    serviceCost: "តម្លៃសេវាជួសជុលសរុប (រៀល)",
    provider: "អ្នកផ្គត់ផ្គង់សេវាកម្ម/ហាង",
    
    // Damaged / Lost
    incidentType: "ប្រភេទគ្រោះមហន្តរាយ",
    incidentDate: "កាលបរិច្ឆេទកើតឡើង",
    reason: "មូលហេតុខូចខាត ឬបាត់បង់",
    investigationReport: "របាយការណ៍ស៊ើបអង្កេតរបស់មន្ត្រីបច្ចេកទេស",
    proposalResolution: "សំណើដោះស្រាយជូននាយកដ្ឋាន",
    
    // Write-offs
    writeOffReason: "ហេតុផលស្នើសុំកាត់ចេញ",
    requestDate: "កាលបរិច្ឆេទស្នើសុំ",
    approvedDate: "កាលបរិច្ឆេទអនុម័ត",
    requestStatus: "ស្ថានភាពសំណើ",
    notes: "កំណត់សម្គាល់ឯកសារភ្ជាប់ (លិខិតយោង)",
    
    // Stock Items
    stockItemName: "ឈ្មោះសម្ភារៈការិយាល័យ",
    unit: "ឯកតាសម្គាល់",
    minStockLevel: "កម្រិតសុវត្ថិភាពទាបបំផុត",
    currentBalance: "សមតុល្យដែលមានបច្ចុប្បន្ន",
    stockLedgerTitle: "ប្រវត្តិលំហូរស្តុកពិតប្រាកដ (Stock Card Ledger)",
    stockLedgerSub: "របស់៖",
    dateCol: "កាលបរិច្ឆេទ",
    typeCol: "ប្រភេទលំហូរ",
    qtyCol: "បរិមាណ",
    balanceCol: "សមតុល្យចុងក្រោយ",
    receiverGiverCol: "អ្នកទទួល / អ្នកប្រគល់",
    refDocCol: "លិខិតយោង / វិក្កយបត្រ",
    noTxMessage: "មិនទាន់មានប្រតិបត្តិការលំហូរស្តុកនៅឡើយទេ",
    
    // Audits
    auditYear: "ឆ្នាំនៃការរាប់សារពើភណ្ឌ",
    auditDate: "កាលបរិច្ឆេទរាប់ជាក់ស្តែង",
    auditCommittee: "គណៈកម្មការរៀបចំ",
    registeredQty: "ចំនួនក្នុងបញ្ជីសារពើភណ្ឌ",
    actualQty: "ចំនួនរាប់ជាក់ស្តែង",
    difference: "ភាពលើស ឬខ្វះ",
    recommendations: "អនុសាសន៍ និងសេចក្តីសម្រេចចិត្ត",
    
    // Status labels
    statusGood: "ល្អ",
    statusMedium: "មធ្យម",
    statusMinorDamage: "ខូចស្រាល",
    statusMajorDamage: "ខូចធ្ងន់",
    statusLost: "បាត់បង់",
    statusUnderRepair: "កំពុងជួសជុល",
    
    // Writeoff reasons
    reasonLifespan: "ហួសអាយុកាលប្រើប្រាស់",
    reasonIrreparable: "ខូចមិនអាចជួសជុលបាន",
    reasonApprovedLost: "បាត់បង់ដោយមានការអនុម័ត",
    reasonOther: "ផ្សេងៗ",
    
    // Writeoff statuses
    statusPending: "កំពុងពិនិត្យ",
    statusApproved: "បានអនុម័ត",
    statusRejected: "បដិសេធ",
    
    // Movement types
    movePermanent: "ផ្ទេរជាអចិន្ត្រៃយ៍",
    moveTemporary: "ខ្ចីបណ្តោះអាសន្ន",
    moveReclaimed: "ដកហូតប្រគល់ត្រឡប់",
    
    // Common terms
    officeAll: "គ្រប់គ្រងទូទៅ / ទាំងអស់",
    viewDetails: "មើលលម្អិត",
    edit: "កែសម្រួល",
    delete: "លុបចេញ",
    confirmDelete: "តើអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?",
    noDataFound: "រកមិនឃើញទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ",
    printingAssetCard: "លម្អិតសម្ភារៈសារពើភណ្ឌ",
    assetCardBtn: "បោះពុម្ពប័ណ្ណទ្រព្យ (Asset Card)",
    recentMovementsTitle: "ចលនាទ្រព្យចុងក្រោយ",
    tenMinutesAgo: "១០ នាទីមុន",
    oneHourAgo: "១ ម៉ោងមុន",
  },
  EN: {
    appName: "State Asset Management System",
    deptName: "Curriculum Development Department",
    officialLedger: "Official Stock and State Asset Ledger System",
    activeSystem: "Active System",
    lowStockAlert: "Low Stock ({count})",
    printFormsBtn: "Print Official Forms",
    officerAccount: "Keo Sopheak's Account",
    officerName: "Mr. Keo Sopheak",
    adminLevel: "Administrative Officer",
    searchPlaceholder: "Search in this ledger...",
    addNewBtn: "Add New Entry",
    editInfoTitle: "Edit Record Details",
    addNewTitle: "Add New Record",
    closeBtn: "Close Dashboard",
    saveBtn: "Save",
    cancelBtn: "Cancel",
    dashboard: "Analytics Dashboard",
    
    // Sidebar items
    menuDashboard: "Dashboard Overview",
    menuAssets: "1. State Asset Register",
    menuOffices: "2. Assets by Office/Location",
    menuHandovers: "3. Employee Handover Ledger",
    menuMovements: "4. Asset Movement Log",
    menuMaintenance: "5. Repairs & Maintenance",
    menuDamagedLost: "6. Damaged / Lost Registry",
    menuWriteoffs: "7. Asset Write-Off Requests",
    menuStock: "8. Office Supplies Inventory",
    menuAudits: "9. Annual Inventory Audits",
    menuIct: "10. Dedicated ICT Registry",
    menuDocuments: "11. Document Management",
    
    // Section Titles & Subtitles
    officeSectionLabel: "Sub-departments / Offices",
    ledgerSectionLabel: "Inventory Registers",
    
    // Dashboard Metrics
    totalAssets: "Total Registered Assets",
    totalCost: "Total Initial Valuation",
    underRepair: "Devices Under Repair",
    lowStockItems: "Critical Stock Alerts",
    itemsLabel: "items",
    financialDistribution: "Asset Valuation by Classification Category",
    officeDistribution: "Asset Unit Distribution by Location/Office",
    rielsLabel: "Currency in KHR (Riels)",
    unitsLabel: "Count in Units",
    
    // Table Columns & Detail attributes
    assetCode: "Asset Code",
    assetName: "Asset Name",
    category: "Asset Category",
    quantity: "Qty",
    cost: "Estimated Cost",
    dateReceived: "Date Received",
    budgetSource: "Budget Source",
    location: "Usage Location",
    responsiblePerson: "Custodian / Responsible Officer",
    status: "Operating Status",
    actions: "Actions",
    serialNumber: "Serial Number (S/N)",
    ipAddress: "IP Address",
    warranty: "Warranty Period",
    isIctQuestion: "Does this device belong to ICT Register?",
    
    // Handovers
    staffName: "Staff Custodian Name",
    handoverDate: "Handover Date",
    giverName: "Giver / Authorizer",
    receiverName: "Receiver",
    statusAtHandover: "Status at Handover",
    chooseAsset: "Select Asset to Handover",
    
    // Movements
    fromOffice: "From Office (Source)",
    toOffice: "To Office (Destination)",
    movementType: "Movement Type",
    movementDate: "Movement Date",
    newResponsiblePerson: "New Custodian",
    
    // Maintenance
    repairType: "Repair/Maintenance Type",
    repairDate: "Service Date",
    serviceCost: "Maintenance Cost (Riels)",
    provider: "Service Provider / Shop",
    
    // Damaged / Lost
    incidentType: "Incident Classification",
    incidentDate: "Incident Date",
    reason: "Cause of Damage / Loss",
    investigationReport: "Technical Evaluation Report",
    proposalResolution: "Proposed Action / Resolution",
    
    // Write-offs
    writeOffReason: "Reason for Write-Off",
    requestDate: "Submission Date",
    approvedDate: "Approved Date",
    requestStatus: "Request Status",
    notes: "Reference Document / Notes",
    
    // Stock Items
    stockItemName: "Office Supply Item Name",
    unit: "Unit of Measure",
    minStockLevel: "Reorder Safety Limit",
    currentBalance: "Current Available Balance",
    stockLedgerTitle: "Real-time Stock Card Ledger",
    stockLedgerSub: "Log for:",
    dateCol: "Log Date",
    typeCol: "Flow Direction",
    qtyCol: "Quantity",
    balanceCol: "Running Balance",
    receiverGiverCol: "Recipient / Dispenser",
    refDocCol: "Reference Doc / Invoice",
    noTxMessage: "No stock card transaction history found",
    
    // Audits
    auditYear: "Audit Fiscal Year",
    auditDate: "Physical Count Date",
    auditCommittee: "Inventory Audit Committee",
    registeredQty: "Book Balance Quantity",
    actualQty: "Physical Count Quantity",
    difference: "Variance (Diff)",
    recommendations: "Committee Recommendations",
    
    // Status labels
    statusGood: "Good",
    statusMedium: "Medium",
    statusMinorDamage: "Minor Damage",
    statusMajorDamage: "Major Damage",
    statusLost: "Lost/Missing",
    statusUnderRepair: "Under Repair",
    
    // Writeoff reasons
    reasonLifespan: "End of Lifespan",
    reasonIrreparable: "Irreparable Damage",
    reasonApprovedLost: "Authorized Loss",
    reasonOther: "Other Reasons",
    
    // Writeoff statuses
    statusPending: "Pending Review",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    
    // Movement types
    movePermanent: "Permanent Transfer",
    moveTemporary: "Temporary Borrowing",
    moveReclaimed: "Reclaimed Asset",
    
    // Common terms
    officeAll: "General / All Locations",
    viewDetails: "View Details",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to permanently delete this record?",
    noDataFound: "No matching records found in this register",
    printingAssetCard: "Asset Inventory Details",
    assetCardBtn: "Print Asset Card",
    recentMovementsTitle: "Recent Asset Actions",
    tenMinutesAgo: "10 minutes ago",
    oneHourAgo: "1 hour ago",
  }
};

export const getOfficeName = (id: string, lang: Language) => {
  const names: Record<string, string> = {
    // Standard IDs from mockData.ts
    OFFICE_GEN: "ការិយាល័យគ្រប់គ្រងទូទៅ",
    OFFICE_RES: "ការិយាល័យស្រាវជ្រាវ និងនវានុវត្តន៍",
    OFFICE_LAN: "ការិយាល័យកម្មវិធីសិក្សាភាសា និងវិទ្យាសាស្ត្រសង្គម",
    OFFICE_MTH: "ការិយាល័យវិធីសិក្សាគណិតវិទ្យា និងវិទ្យាសាស្ត្រ",
    OFFICE_LIB: "ការិយាល័យគ្រប់គ្រងបណ្ណាល័យ",
    OFFICE_TXB: "ការិយាល័យគ្រប់គ្រងសៀវភៅសិក្សា",
    OFFICE_LIF: "ការិយាល័យកម្មវិធីសិក្សាអប់រំបំណិនជីវិត",

    // Translation file legacy keys
    GENERAL_ADMIN: "ការិយាល័យគ្រប់គ្រងទូទៅ",
    RESEARCH_INNOVATION: "ការិយាល័យស្រាវជ្រាវ និងនវានុវត្តន៍",
    LANGUAGE_SOCIAL: "ការិយាល័យកម្មវិធីសិក្សាភាសានិងវិទ្យាសាស្ត្រសង្គម",
    MATH_SCIENCE: "ការិយាល័យវិធីសិក្សាគណិតវិទ្យានិងវិទ្យាសាស្ត្រ",
    LIBRARY_MANAGEMENT: "ការិយាល័យគ្រប់គ្រងបណ្ណាល័យ",
    TEXTBOOK_MANAGEMENT: "ការិយាល័យគ្រប់គ្រងសៀវភៅសិក្សា",
    LIFE_SKILLS: "ការិយាល័យកម្មវិធីសិក្សាអប់រំបំណិនជីវិត",

    // Officer account / sign-up offices
    OFF_ADMIN: "ការិយាល័យរដ្ឋបាល",
    OFF_ACC: "ការិយាល័យគណនេយ្យ",
    OFF_ICT: "ការិយាល័យព័ត៌មានវិទ្យា"
  };
  return names[id] || id;
};

export const getCategoryName = (id: string, lang: Language) => {
  const names: Record<string, Record<Language, string>> = {
    FURNITURE: { KM: "គ្រឿងសង្ហារិម", EN: "Furniture" },
    TECHNOLOGY: { KM: "បច្ចេកវិទ្យាព័ត៌មាន", EN: "Information Technology" },
    BOOKS: { KM: "សៀវភៅ និងឯកសារ", EN: "Books & Documents" },
    VEHICLE: { KM: "យានយន្ត", EN: "Vehicles" },
    CONSUMABLE: { KM: "សម្ភារៈប្រើប្រាស់អស់", EN: "Office Supplies" }
  };
  return names[id]?.[lang] || id;
};
