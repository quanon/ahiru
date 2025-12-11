import './style.css';
import { DuckDBManager } from './duckdb';
const dbManager = new DuckDBManager();
let isInitialized = false;
// DOM Elements
const csvFileInput = document.getElementById('csvFile');
const sqlQueryTextarea = document.getElementById('sqlQuery');
const executeBtn = document.getElementById('executeBtn');
const statusDiv = document.getElementById('status');
const statusText = document.getElementById('statusText');
const resultsSection = document.getElementById('resultsSection');
const resultsDiv = document.getElementById('results');
const resultCount = document.getElementById('resultCount');
// Initialize DuckDB
async function initializeDuckDB() {
    try {
        showStatus('DuckDBを初期化中...', 'info');
        await dbManager.initialize();
        isInitialized = true;
        showStatus('DuckDBの初期化が完了しました', 'success');
        setTimeout(() => hideStatus(), 2000);
    }
    catch (error) {
        showStatus(`初期化エラー: ${error}`, 'error');
        console.error('DuckDB initialization error:', error);
    }
}
// Show status message
function showStatus(message, type) {
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
    const file = event.target.files?.[0];
    if (!file)
        return;
    if (!isInitialized) {
        showStatus('DuckDBがまだ初期化されていません。少々お待ちください...', 'warning');
        return;
    }
    try {
        showStatus(`${file.name} を読み込み中...`, 'info');
        await dbManager.loadCSV(file);
        showStatus(`${file.name} の読み込みが完了しました！`, 'success');
        executeBtn.disabled = false;
        resultsSection.classList.add('hidden');
    }
    catch (error) {
        showStatus(`CSVの読み込みエラー: ${error}`, 'error');
        console.error('CSV load error:', error);
    }
});
// Handle query execution
executeBtn.addEventListener('click', async () => {
    const query = sqlQueryTextarea.value.trim();
    if (!query) {
        showStatus('SQLクエリを入力してください', 'warning');
        return;
    }
    try {
        showStatus('クエリを実行中...', 'info');
        executeBtn.disabled = true;
        const results = await dbManager.executeQuery(query);
        if (results.length === 0) {
            showStatus('結果が見つかりませんでした', 'info');
            resultsSection.classList.add('hidden');
            executeBtn.disabled = false;
            return;
        }
        displayResults(results);
        showStatus('クエリが正常に実行されました', 'success');
        setTimeout(() => hideStatus(), 2000);
    }
    catch (error) {
        showStatus(`クエリエラー: ${error}`, 'error');
        console.error('Query execution error:', error);
    }
    finally {
        executeBtn.disabled = false;
    }
});
// Display query results as table
function displayResults(results) {
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p class="text-center text-gray-500">結果がありません</p>';
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
    resultCount.textContent = `${results.length} 行の結果`;
    resultsSection.classList.remove('hidden');
}
// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Initialize on load
initializeDuckDB();
