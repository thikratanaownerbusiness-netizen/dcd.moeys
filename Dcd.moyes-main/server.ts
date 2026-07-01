import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.GOOGLE_API_KEY || 
                   process.env.GOOGLE_GENAI_API_KEY || 
                   process.env.GEMINI_API_SECRET || 
                   process.env.AI_STUDIO_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is required but not configured. Please add one of these secrets in Settings > Secrets: GOOGLE_API_KEY, GOOGLE_GENAI_API_KEY, GEMINI_API_SECRET, or AI_STUDIO_API_KEY.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload limits for handling file base64 uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Endpoint to parse uploaded Excel or Word documents
  app.post("/api/parse-document", async (req, res) => {
    try {
      const { fileName, fileData } = req.body;

      if (!fileName || !fileData) {
        return res.status(400).json({ error: "Missing fileName or fileData in request body." });
      }

      // Check if API key is set
      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        return res.status(400).json({ 
          error: "API_KEY_MISSING", 
          message: err.message || "Gemini API key is not configured."
        });
      }

      // Remove the base64 MIME prefix if present (e.g., data:application/...;base64,)
      const base64Clean = fileData.replace(/^data:.*?;base64,/, "");
      const fileBuffer = Buffer.from(base64Clean, "base64");

      const fileExtension = path.extname(fileName).toLowerCase();
      let extractedContentText = "";
      let sheetsData: any[] | null = null;
      const isPDF = fileExtension === ".pdf";

      if (isPDF) {
        // PDF will be processed directly as inlineData by Gemini, no local parsing needed!
      } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
        // Parse spreadsheet using SheetJS with full cell value and date formatting options
        const workbook = XLSX.read(fileBuffer, { 
          type: "buffer",
          cellDates: true,
          cellStyles: true,
          cellNF: true,
          cellFormula: true,
          raw: false // ensures we extract pre-formatted display text rather than raw numbers/datecodes
        });
        sheetsData = [];

        // Read up to 3 sheets to prevent overloading the context
        const sheetsToRead = workbook.SheetNames.slice(0, 3);
        for (const sheetName of sheetsToRead) {
          const sheet = workbook.Sheets[sheetName];
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          if (jsonRows.length > 0) {
            sheetsData.push({
              sheetName,
              rows: jsonRows.slice(0, 300) // Read up to 300 rows to be safe
            });
          }
        }

        extractedContentText = JSON.stringify(sheetsData, null, 2);
      } else if (fileExtension === ".docx") {
        // Extract plain text from Word using mammoth
        const mammothResult = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedContentText = mammothResult.value;
      } else if (fileExtension === ".doc") {
        return res.status(400).json({
          error: "UNSUPPORTED_FORMAT",
          message: "ប្រព័ន្ធគាំទ្រតែឯកសារប្រភេទ .docx, .xlsx, .xls ឬ .pdf ប៉ុណ្ណោះ។ សូមបម្លែងឯកសារ .doc ទៅជា .docx រួចព្យាយាមម្តងទៀត។"
        });
      } else {
        return res.status(400).json({
          error: "UNSUPPORTED_FORMAT",
          message: "ប្រភេទឯកសារមិនគាំទ្រឡើយ។ សូមបញ្ចូលតែឯកសារ Word (.docx), Excel (.xlsx, .xls) ឬ PDF (.pdf)។"
        });
      }

      if (!isPDF && (!extractedContentText || extractedContentText.trim().length === 0)) {
        return res.status(400).json({
          error: "EMPTY_DOCUMENT",
          message: "មិនអាចទាញយកទិន្នន័យពីឯកសារបានឡើយ។ ឯកសារប្រហែលជាមិនមានអត្ថបទ ឬទិន្នន័យតារាងសន្លឹកឡើយ។"
        });
      }

      // Query Gemini to extract assets from extracted document text
      let prompt = `You are a professional inventory officer and Cambodian government assets data analyst.
Analyze the provided reference document.
Identify all assets or inventory items listed in this document, extract their properties, translate/map them semantically to our rigid schema, and output a valid JSON array of objects.

Here is the master list of offices (officeId) you must map locations to:
- 'OFFICE_GEN' for "ការិយាល័យគ្រប់គ្រងទូទៅ" or General Office (code: កគទ)
- 'OFFICE_RES' for "ការិយាល័យស្រាវជ្រាវ និងនវានុវត្តន៍" or Research Office (code: កសន)
- 'OFFICE_LAN' for "ការិយាល័យកម្មវិធីសិក្សាភាសា និងវិទ្យាសាស្ត្រសង្គម" or Language & Social Sciences Office (code: កភស)
- 'OFFICE_MTH' for "ការិយាល័យវិធីសិក្សាគណិតវិទ្យា និងវិទ្យាសាស្ត្រ" or Math & Science Office (code: កគវ)
- 'OFFICE_LIB' for "ការិយាល័យគ្រប់គ្រងបណ្ណាល័យ" or Library Office (code: កគប)
- 'OFFICE_TXB' for "ការិយាល័យគ្រប់គ្រងសៀវភៅសិក្សា" or Textbooks Office (code: កគស)
- 'OFFICE_LIF' for "ការិយាល័យកម្មវិធីសិក្សាអប់រំបំណិនជីវិត" or Life Skills Office (code: កបជ)

Here is the master list of asset categories (category) you must map to:
- 'FURNITURE' for any furniture, desks, chairs, cabinets, tables (គ្រឿងសង្ហារិម)
- 'TECHNOLOGY' for computers, laptops, routers, monitors, printers, projectors, cabling, ICT equipment (សម្ភារៈបច្ចេកវិទ្យា)
- 'BOOKS' for reading books, textbooks, curriculums, publications, libraries (សៀវភៅ និងឯកសារ)
- 'VEHICLE' for motorbikes, cars, vans, trucks (យានយន្ត)
- 'CONSUMABLE' for pens, papers, folders, office supplies (សម្ភារៈការិយាល័យប្រើប្រាស់អស់)

Here is the asset status list (status) you must map to:
- 'ល្អ' (Good / Excellent)
- 'មធ្យម' (Medium / Fair)
- 'ខូចស្រាល' (Minor Damage / Needs Repair)
- 'ខូចធ្ងន់' (Major Damage / Scrap)
- 'បាត់បង់' (Lost)

For each asset, populate these fields in the returned JSON object:
1. "code": The asset identification code (e.g., LIKHIT-xxx, DCD-TECH-xxx). If none is present, generate a clean and consistent identifier prefixed with "DCD-" based on the category (e.g., DCD-TECH-021, DCD-FURN-012).
2. "name": The clean name of the asset (prefer Khmer if bilingual or Khmer is found in rows).
3. "category": Strictly one of the five categories listed above: 'FURNITURE', 'TECHNOLOGY', 'BOOKS', 'VEHICLE', or 'CONSUMABLE'.
4. "quantity": Positive integer of items. Default to 1 if not specified.
5. "cost": Number representing cost per item or total unit cost (clean it of dollar signs, commas, or currency notations, e.g., convert "$1,200" to 1200 or "៥០០,០០០ រៀល" to 500000). Default to 0 if not specified.
6. "dateReceived": Format as "YYYY-MM-DD" if a date is found. If not found or ambiguous, leave as "" or use the current year like "2026-06-24".
7. "budgetSource": Funding source name (e.g. "ថវិការដ្ឋ" or "ដៃគូអភិវឌ្ឍន៍" or "គម្រោង").
8. "officeId": Strictly one of the 7 office codes listed above (e.g., 'OFFICE_GEN'). Do your best to map location column clues (e.g. "គណិតវិទ្យា" maps to 'OFFICE_MTH', "បណ្ណាល័យ" maps to 'OFFICE_LIB'). If unclear, default to 'OFFICE_GEN'.
9. "responsiblePerson": Name of the staff or officer in charge of this asset.
10. "status": Strictly one of: 'ល្អ', 'មធ្យម', 'ខូចស្រាល', 'ខូចធ្ងន់', 'បាត់បង់'. Default to 'ល្អ' if unclear.
11. "isICT": Set to true if category is 'TECHNOLOGY', otherwise false.
12. "serialNumber": Optional string containing serial number (S/N) if present in table.
13. "ipAddress": Optional string containing IP address if present in table. Supports extracting any format such as IPv4, IPv6, subnets/CIDR, DHCP, dynamic, or multiple comma-separated IP addresses.
14. "warranty": Optional string for warranty duration (e.g., "12 ខែ", "1 ឆ្នាំ") if present.`;

      if (isPDF) {
        prompt += `\n\nAnalyze the attached reference PDF file carefully, extract all asset details from its pages or tables, map them, and construct the JSON array.`;
      } else {
        prompt += `\n\nData to extract from:\n---\n${extractedContentText}\n---\n`;
      }

      prompt += `\n\nOutput constraints:\nReturn ONLY a valid JSON array of objects conforming to the Asset properties above. No markdown, no triple backticks, no comments, no extra text. Just a raw JSON array.`;

      // Set up the contents payload
      const contentsPayload = isPDF
        ? [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Clean
              }
            },
            prompt
          ]
        : prompt;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsPayload,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                quantity: { type: Type.INTEGER },
                cost: { type: Type.NUMBER },
                dateReceived: { type: Type.STRING },
                budgetSource: { type: Type.STRING },
                officeId: { type: Type.STRING },
                responsiblePerson: { type: Type.STRING },
                status: { type: Type.STRING },
                isICT: { type: Type.BOOLEAN },
                serialNumber: { type: Type.STRING },
                ipAddress: { type: Type.STRING },
                warranty: { type: Type.STRING },
              },
              required: ["code", "name", "category", "quantity", "cost", "officeId", "status", "isICT"],
            },
          }
        },
      });

      const responseText = response.text || "[]";
      let parsedAssets = [];
      try {
        parsedAssets = JSON.parse(responseText.trim());
      } catch (jsonErr) {
        console.error("Failed to parse Gemini response as JSON:", responseText);
        // Fallback clean regex
        const match = responseText.match(/\[[\s\S]*\]/);
        if (match) {
          parsedAssets = JSON.parse(match[0]);
        } else {
          throw new Error("Gemini returned invalid JSON structure.");
        }
      }

      return res.json({
        success: true,
        count: parsedAssets.length,
        assets: parsedAssets,
        rawSheets: sheetsData
      });

    } catch (error: any) {
      console.error("Document parsing error:", error);
      return res.status(500).json({ 
        error: "INTERNAL_ERROR", 
        message: error.message || "An error occurred during document parsing." 
      });
    }
  });

  // Endpoint to parse Google Sheets
  app.post("/api/parse-gsheet", async (req, res) => {
    try {
      const { accessToken, spreadsheetId: rawSpreadsheetId, googleSheetsUrl } = req.body;

      if (!accessToken) {
        return res.status(400).json({ error: "Missing Google Access Token." });
      }

      let spreadsheetId = rawSpreadsheetId;
      if (googleSheetsUrl) {
        const match = googleSheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          spreadsheetId = match[1];
        }
      }

      if (!spreadsheetId) {
        return res.status(400).json({ error: "Could not resolve a valid Google Spreadsheet ID. Please verify the URL or ID." });
      }

      // Check if Gemini API key is set
      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        return res.status(400).json({ 
          error: "API_KEY_MISSING", 
          message: err.message || "Gemini API key is not configured."
        });
      }

      console.log(`Fetching Google Sheet: ${spreadsheetId}...`);
      const gsheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=true`;
      
      const gsheetResponse = await fetch(gsheetsApiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!gsheetResponse.ok) {
        const errText = await gsheetResponse.text();
        console.error("Google Sheets API error details:", errText);
        return res.status(400).json({
          error: "GSHEET_API_ERROR",
          message: `ការតភ្ជាប់ទៅកាន់ Google Sheets API បានបរាជ័យ (Failed to fetch Google Sheet): ${gsheetResponse.statusText}`
        });
      }

      const data = await gsheetResponse.json() as any;
      const sheetsData: any[] = [];
      
      if (data.sheets && Array.isArray(data.sheets)) {
        // Read up to 3 sheets to prevent overloading the context
        const sheetsToRead = data.sheets.slice(0, 3);
        for (const sheet of sheetsToRead) {
          const sheetName = sheet.properties?.title || "Sheet";
          const rows: any[][] = [];
          if (sheet.data && Array.isArray(sheet.data)) {
            for (const dataGrid of sheet.data) {
              if (dataGrid.rowData && Array.isArray(dataGrid.rowData)) {
                for (const row of dataGrid.rowData) {
                  const rowVals = (row.values || []).map((val: any) => val.formattedValue || val.userEnteredValue?.stringValue || "");
                  rows.push(rowVals);
                }
              }
            }
          }
          if (rows.length > 0) {
            sheetsData.push({
              sheetName,
              rows: rows.slice(0, 300) // Read up to 300 rows to be safe
            });
          }
        }
      }

      if (sheetsData.length === 0) {
        return res.status(400).json({
          error: "EMPTY_SPREADSHEET",
          message: "សន្លឹកកិច្ចការ Google Sheets នេះមិនមានទិន្នន័យឡើយ (This Google Sheet contains no data)."
        });
      }

      const extractedContentText = JSON.stringify(sheetsData, null, 2);

      // Query Gemini to extract assets from Google Sheet text
      let prompt = `You are a professional inventory officer and Cambodian government assets data analyst.
Analyze the provided Google Sheet reference data.
Identify all assets or inventory items listed in this document, extract their properties, translate/map them semantically to our rigid schema, and output a valid JSON array of objects.

Here is the master list of offices (officeId) you must map locations to:
- 'OFFICE_GEN' for "ការិយាល័យគ្រប់គ្រងទូទៅ" or General Office (code: កគទ)
- 'OFFICE_RES' for "ការិយាល័យស្រាវជ្រាវ និងនវានុវត្តន៍" or Research Office (code: កសន)
- 'OFFICE_LAN' for "ការិយាល័យកម្មវិធីសិក្សាភាសា និងវិទ្យាសាស្ត្រសង្គម" or Language & Social Sciences Office (code: កភស)
- 'OFFICE_MTH' for "ការិយាល័យវិធីសិក្សាគណិតវិទ្យា និងវិទ្យាសាស្ត្រ" or Math & Science Office (code: កគវ)
- 'OFFICE_LIB' for "ការិយាល័យគ្រប់គ្រងបណ្ណាល័យ" or Library Office (code: កគប)
- 'OFFICE_TXB' for "ការិយាល័យគ្រប់គ្រងសៀវភៅសិក្សា" or Textbooks Office (code: កគស)
- 'OFFICE_LIF' for "ការិយាល័យកម្មវិធីសិក្សាអប់រំបំណិនជីវិត" or Life Skills Office (code: កបជ)

Here is the master list of asset categories (category) you must map to:
- 'FURNITURE' for any furniture, desks, chairs, cabinets, tables (គ្រឿងសង្ហារិម)
- 'TECHNOLOGY' for computers, laptops, routers, monitors, printers, projectors, cabling, ICT equipment (សម្ភារៈបច្ចេកវិទ្យា)
- 'BOOKS' for reading books, textbooks, curriculums, publications, libraries (សៀវភៅ និងឯកសារ)
- 'VEHICLE' for motorbikes, cars, vans, trucks (យានយន្ត)
- 'CONSUMABLE' for pens, papers, folders, office supplies (សម្ភារៈការិយាល័យប្រើប្រាស់អស់)

Here is the asset status list (status) you must map to:
- 'ល្អ' (Good / Excellent)
- 'មធ្យម' (Medium / Fair)
- 'ខូចស្រាល' (Minor Damage / Needs Repair)
- 'ខូចធ្ងន់' (Major Damage / Scrap)
- 'បាត់បង់' (Lost)

For each asset, populate these fields in the returned JSON object:
1. "code": The asset identification code (e.g., LIKHIT-xxx, DCD-TECH-xxx). If none is present, generate a clean and consistent identifier prefixed with "DCD-" based on the category (e.g., DCD-TECH-021, DCD-FURN-012).
2. "name": The clean name of the asset (prefer Khmer if bilingual or Khmer is found in rows).
3. "category": Strictly one of the five categories listed above: 'FURNITURE', 'TECHNOLOGY', 'BOOKS', 'VEHICLE', or 'CONSUMABLE'.
4. "quantity": Positive integer of items. Default to 1 if not specified.
5. "cost": Number representing cost per item or total unit cost (clean it of dollar signs, commas, or currency notations, e.g., convert "$1,200" to 1200 or "៥០០,០០០ រៀល" to 500000). Default to 0 if not specified.
6. "dateReceived": Format as "YYYY-MM-DD" if a date is found. If not found or ambiguous, leave as "" or use the current year like "2026-06-24".
7. "budgetSource": Funding source name (e.g. "ថវិការដ្ឋ" or "ដៃគូអភិវឌ្ឍន៍" or "គម្រោង").
8. "officeId": Strictly one of the 7 office codes listed above (e.g., 'OFFICE_GEN'). Do your best to map location column clues (e.g. "គណិតវិទ្យា" maps to 'OFFICE_MTH', "បណ្ណាល័យ" maps to 'OFFICE_LIB'). If unclear, default to 'OFFICE_GEN'.
9. "responsiblePerson": Name of the staff or officer in charge of this asset.
10. "status": Strictly one of: 'ល្អ', 'មធ្យម', 'ខូចស្រាល', 'ខូចធ្ងន់', 'បាត់បង់'. Default to 'ល្អ' if unclear.
11. "isICT": Set to true if category is 'TECHNOLOGY', otherwise false.
12. "serialNumber": Optional string containing serial number (S/N) if present in table.
13. "ipAddress": Optional string containing IP address if present in table. Supports extracting any format such as IPv4, IPv6, subnets/CIDR, DHCP, dynamic, or multiple comma-separated IP addresses.
14. "warranty": Optional string for warranty duration (e.g., "12 ខែ", "1 ឆ្នាំ") if present.

Data to extract from:
---
${extractedContentText}
---

Output constraints:
Return ONLY a valid JSON array of objects conforming to the Asset properties above. No markdown, no triple backticks, no comments, no extra text. Just a raw JSON array.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                code: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                quantity: { type: Type.INTEGER },
                cost: { type: Type.NUMBER },
                dateReceived: { type: Type.STRING },
                budgetSource: { type: Type.STRING },
                officeId: { type: Type.STRING },
                responsiblePerson: { type: Type.STRING },
                status: { type: Type.STRING },
                isICT: { type: Type.BOOLEAN },
                serialNumber: { type: Type.STRING },
                ipAddress: { type: Type.STRING },
                warranty: { type: Type.STRING },
              },
              required: ["code", "name", "category", "quantity", "cost", "officeId", "status", "isICT"],
            },
          }
        },
      });

      const responseText = response.text || "[]";
      let parsedAssets = [];
      try {
        parsedAssets = JSON.parse(responseText.trim());
      } catch (jsonErr) {
        console.error("Failed to parse Gemini response as JSON:", responseText);
        const match = responseText.match(/\[[\s\S]*\]/);
        if (match) {
          parsedAssets = JSON.parse(match[0]);
        } else {
          throw new Error("Gemini returned invalid JSON structure.");
        }
      }

      return res.json({
        success: true,
        count: parsedAssets.length,
        assets: parsedAssets,
        rawSheets: sheetsData
      });

    } catch (error: any) {
      console.error("Google Sheets parsing error:", error);
      return res.status(500).json({ 
        error: "INTERNAL_ERROR", 
        message: error.message || "An error occurred during Google Sheets parsing." 
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static handler mounted for /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
