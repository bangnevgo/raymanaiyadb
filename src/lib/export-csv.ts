/**
 * Converts an array of objects into a CSV string and triggers a browser download.
 *
 * - Extracts headers from the keys of the first object.
 * - Wraps every value in double quotes so that commas, quotes, and special
 *   characters inside values are preserved.
 * - Returns the generated CSV string (useful for testing) and also
 *   triggers a browser file download automatically.
 */

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  const str = String(value);

  // If the value contains a double-quote, newline, or comma it must be wrapped
  // in quotes and any internal quotes must be escaped by doubling them.
  if (str.includes('"') || str.includes('\n') || str.includes(',') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  // Even when there are no special characters, wrap in quotes for consistent
  // cell formatting in spreadsheet tools.
  return `"${str}"`;
}

/**
 * Generate a CSV string from an array of plain objects.
 *
 * @param data    Array of objects. Keys of the first object become the header row.
 * @param columns Optional ordered list of keys to include as columns.
 *                If omitted, all keys from the first object are used (insertion order).
 */
export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: string[],
): string {
  if (data.length === 0) return '';

  const keys = columns ?? Object.keys(data[0]);

  const headerRow = keys.map((k) => escapeCSVValue(k)).join(',');
  const dataRows = data.map((row) =>
    keys.map((k) => escapeCSVValue(row[k])).join(','),
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 *
 * @param csvString  The full CSV content (typically from `generateCSV`).
 * @param filename   Desired file name (e.g. "income-report.csv").
 */
export function downloadCSV(csvString: string, filename: string): void {
  // Prepend BOM so Excel / Google Sheets detect UTF-8 encoding correctly.
  const blob = new Blob(['\uFEFF' + csvString], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL after a short delay to ensure the download starts.
  setTimeout(() => URL.revokeObjectURL(url), 250);
}

/**
 * Convenience function that generates CSV from data rows and immediately
 * triggers a browser download.
 *
 * @param data     Array of objects to export.
 * @param filename File name for the downloaded CSV.
 * @param columns  Optional ordered list of column keys.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: string[],
): void {
  const csv = generateCSV(data, columns);
  downloadCSV(csv, filename);
}
