// Google Sheets configuration localStorage module

const STORAGE_KEY = "mantralayam_google_sheets_config";

export interface GoogleSheetsConfig {
  sheetUrl: string;
  lastUpdated: string;
}

// Get Google Sheets configuration
export function getGoogleSheetsConfig(): GoogleSheetsConfig | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading Google Sheets config:", error);
    return null;
  }
}

// Save Google Sheets configuration
export function saveGoogleSheetsConfig(sheetUrl: string): void {
  try {
    const config: GoogleSheetsConfig = {
      sheetUrl: sheetUrl.trim(),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(
      new CustomEvent("googleSheetsConfigUpdated", { detail: config }),
    );
  } catch (error) {
    console.error("Error saving Google Sheets config:", error);
  }
}

// Clear Google Sheets configuration
export function clearGoogleSheetsConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent("googleSheetsConfigUpdated", { detail: null }),
  );
}
