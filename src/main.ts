import './style.css';
import { DuckDBManager } from './duckdb';

const dbManager = new DuckDBManager();
let isInitialized = false;

// DOM Elements
const csvFileInput = document.getElementById('csvFile') as HTMLInputElement;
const sqlQueryTextarea = document.getElementById('sqlQuery') as HTMLTextAreaElement;
const executeBtn = document.getElementById('executeBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const resultsSection = document.getElementById('resultsSection') as HTMLDivElement;
const resultsDiv = document.getElementById('results') as HTMLDivElement;
const resultCount = document.getElementById('resultCount') as HTMLSpanElement;

// Initialize DuckDB
async function initializeDuckDB() {
  try {
    showStatus('Initializing DuckDB...', 'info');
    await dbManager.initialize();
    isInitialized = true;
    showStatus('DuckDB initialization completed.', 'success');
    setTimeout(() => hideStatus(), 2000);
  } catch (error) {
    showStatus(`Initialization error: ${error}`, 'error');
    console.error('DuckDB initialization error:', error);
  }
}

// Show status message
function showStatus(message: string, type: 'info' | 'success' | 'error' | 'warning') {
  statusDiv.classList.remove('hidden', 'alert-info', 'alert-success', 'alert-error', 'alert-warning');
  statusDiv.classList.add(`alert-${type}`);
  statusText.textContent = message;
}

// Hide status message
function hideStatus() {
  statusDiv.classList.add('hidden');
}

// Handle CSV file upload
csvFileInput.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!isInitialized) {
    showStatus('DuckDB is not yet initialized. Please wait...', 'warning');
    return;
  }

  try {
    showStatus(`Loading ${file.name}...`, 'info');
    await dbManager.loadCSV(file);
    showStatus(`${file.name} loaded successfully.`, 'success');
    executeBtn.disabled = false;
    resultsSection.classList.add('hidden');
  } catch (error) {
    showStatus(`CSV load error: ${error}`, 'error');
    console.error('CSV load error:', error);
  }
});

// Handle query execution
executeBtn.addEventListener('click', async () => {
  const query = sqlQueryTextarea.value.trim();
  if (!query) {
    showStatus('Please enter SQL.', 'warning');
    return;
  }

  try {
    showStatus('Executing SQL...', 'info');
    executeBtn.disabled = true;

    const results = await dbManager.executeQuery(query);

    if (results.length === 0) {
      showStatus('No results found.', 'info');
      resultsSection.classList.add('hidden');
      executeBtn.disabled = false;
      return;
    }

    displayResults(results);
    showStatus('SQL executed successfully.', 'success');
    setTimeout(() => hideStatus(), 2000);
  } catch (error) {
    showStatus(`SQL error: ${error}`, 'error');
    console.error('Query execution error:', error);
  } finally {
    executeBtn.disabled = false;
  }
});

// Display query results as table
function displayResults(results: any[]) {
  if (results.length === 0) {
    resultsDiv.innerHTML = '<p class="text-center text-gray-500">No results.</p>';
    return;
  }

  const columns = Object.keys(results[0]);

  let tableHTML = '<table class="table table-zebra table-sm"><thead><tr>';
  columns.forEach(col => {
    tableHTML += `<th class="font-bold">${escapeHtml(col)}</th>`;
  });
  tableHTML += '</tr></thead><tbody>';

  results.forEach(row => {
    tableHTML += '<tr>';
    columns.forEach(col => {
      const value = row[col];
      tableHTML += `<td>${escapeHtml(String(value ?? ''))}</td>`;
    });
    tableHTML += '</tr>';
  });

  tableHTML += '</tbody></table>';
  resultsDiv.innerHTML = tableHTML;
  resultCount.textContent = `${results.length} ${results.length === 1 ? 'row' : 'rows'}`;
  resultsSection.classList.remove('hidden');
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on load
initializeDuckDB();
