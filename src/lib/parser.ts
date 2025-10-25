import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { Patient } from '@/stores/patientStore';
const EXPECTED_HEADERS = ['name', 'dob', 'mrn'];
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
};
const mapDataToPatients = (data: any[]): Patient[] => {
  if (!data || data.length === 0) {
    return [];
  }
  const headerRow = Object.keys(data[0]);
  const normalizedHeaders = headerRow.map(normalizeHeader);
  const headerMap: { [key: string]: string } = {};
  headerRow.forEach((header, index) => {
    const normalized = normalizedHeaders[index];
    if (EXPECTED_HEADERS.includes(normalized)) {
      headerMap[header] = normalized;
    } else {
      headerMap[header] = header; // Keep original if not a standard one
    }
  });
  return data.map((row) => {
    const patient: Patient = { id: uuidv4() };
    for (const key in row) {
      const newKey = headerMap[key] || key;
      patient[newKey] = row[key];
    }
    return patient;
  });
};
export const parseExcelFile = (file: File): Promise<Patient[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Failed to read file.");
        }
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(mapDataToPatients(jsonData));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
export const parseGoogleSheet = async (url: string): Promise<Patient[]> => {
  if (!url.includes('spreadsheets/d/')) {
    throw new Error('Invalid Google Sheet URL. Please use the full URL from your browser.');
  }
  const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    throw new Error('Invalid Google Sheet URL. Could not extract the Sheet ID.');
  }
  const sheetId = match[1];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet. Status: ${response.status}. Ensure it's public.`);
    }
    const csvText = await response.text();
    const workbook = XLSX.read(csvText, { type: 'string', raw: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return mapDataToPatients(jsonData);
  } catch (error) {
    console.error("Google Sheet fetch error:", error);
    if (error instanceof TypeError) { // Likely a CORS error
        throw new Error("Could not fetch the Google Sheet. This may be due to CORS policy. Please ensure the sheet is public ('Anyone with the link can view').");
    }
    throw error;
  }
};