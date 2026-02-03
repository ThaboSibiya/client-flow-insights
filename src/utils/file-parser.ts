
export interface ParsedData {
  data: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  errors: string[];
}

export const parseCSV = (content: string): ParsedData => {
  const errors: string[] = [];
  const lines = content.trim().split(/\r?\n/);
  
  if (lines.length === 0) {
    return { data: [], columns: [], rowCount: 0, errors: ['Empty file'] };
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  const columns = headers.map(h => h.trim());
  
  if (columns.length === 0) {
    return { data: [], columns: [], rowCount: 0, errors: ['No columns found'] };
  }

  // Parse data rows
  const data: Record<string, unknown>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row: Record<string, unknown> = {};
    
    columns.forEach((col, index) => {
      const value = values[index]?.trim() || '';
      row[col] = parseValue(value);
    });
    
    data.push(row);
  }

  return { data, columns, rowCount: data.length, errors };
};

export const parseJSON = (content: string): ParsedData => {
  const errors: string[] = [];
  
  try {
    const parsed = JSON.parse(content);
    
    // Handle array of objects
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        return { data: [], columns: [], rowCount: 0, errors: ['Empty array'] };
      }
      
      // Extract columns from first object
      const columns = Object.keys(parsed[0] || {});
      return { data: parsed, columns, rowCount: parsed.length, errors };
    }
    
    // Handle single object - wrap in array
    if (typeof parsed === 'object' && parsed !== null) {
      const columns = Object.keys(parsed);
      return { data: [parsed], columns, rowCount: 1, errors };
    }
    
    errors.push('Invalid JSON structure - expected array or object');
    return { data: [], columns: [], rowCount: 0, errors };
    
  } catch (err) {
    errors.push(`JSON parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return { data: [], columns: [], rowCount: 0, errors };
  }
};

export const parseExcel = async (file: File): Promise<ParsedData> => {
  // For Excel files, we'll need to use a library like xlsx
  // For now, return an error suggesting CSV conversion
  // In a full implementation, you'd add the xlsx library
  
  const errors: string[] = [];
  
  try {
    // Dynamic import of xlsx library if available
    const XLSX = await import('xlsx').catch(() => null);
    
    if (!XLSX) {
      errors.push('Excel parsing requires the xlsx library. Please convert to CSV or install xlsx package.');
      return { data: [], columns: [], rowCount: 0, errors };
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return { data: [], columns: [], rowCount: 0, errors: ['Empty spreadsheet'] };
    }
    
    const columns = Object.keys(jsonData[0] as Record<string, unknown>);
    return { 
      data: jsonData as Record<string, unknown>[], 
      columns, 
      rowCount: jsonData.length, 
      errors 
    };
    
  } catch (err) {
    errors.push(`Excel parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return { data: [], columns: [], rowCount: 0, errors };
  }
};

// Helper to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Helper to parse values into appropriate types
function parseValue(value: string): unknown {
  // Empty string
  if (value === '') return null;
  
  // Boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Number
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  
  // Date (ISO format)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  
  // String
  return value;
}

export const detectFileType = (file: File): 'csv' | 'json' | 'excel' | 'unknown' => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') return 'csv';
  if (extension === 'json') return 'json';
  if (['xlsx', 'xls'].includes(extension || '')) return 'excel';
  
  // Check MIME type as fallback
  if (file.type === 'text/csv') return 'csv';
  if (file.type === 'application/json') return 'json';
  if (file.type.includes('spreadsheet') || file.type.includes('excel')) return 'excel';
  
  return 'unknown';
};
