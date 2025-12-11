import { useState, ChangeEvent } from 'react';
import { useDuckDB } from './hooks/useDuckDB';

interface QueryResult {
  [key: string]: unknown;
}

type StatusType = 'info' | 'success' | 'error' | 'warning';

function App() {
  const { isInitialized, error: initError, loadCSV, executeQuery } = useDuckDB();
  const [tableName, setTableName] = useState('data');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM data');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<StatusType>('info');
  const [showStatus, setShowStatus] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const showStatusMessage = (message: string, type: StatusType) => {
    setStatusMessage(message);
    setStatusType(type);
    setShowStatus(true);
  };

  const hideStatus = () => {
    setShowStatus(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isInitialized) {
      showStatusMessage('Initializing DuckDB...', 'warning');
      return;
    }

    try {
      showStatusMessage(`Loading ${file.name}...`, 'info');
      const newTableName = await loadCSV(file);
      setTableName(newTableName);
      setSqlQuery(`SELECT * FROM "${newTableName}"`);
      showStatusMessage(`${file.name} loaded successfully.`, 'success');
      setIsFileLoaded(true);
      setShowResults(false);
      setTimeout(hideStatus, 2000);
    } catch (error) {
      showStatusMessage(`CSV load error: ${error}`, 'error');
      console.error('CSV load error:', error);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      showStatusMessage('Please enter SQL.', 'warning');
      return;
    }

    try {
      showStatusMessage('Running SQL...', 'info');
      setIsExecuting(true);

      const queryResults = await executeQuery(sqlQuery);

      if (queryResults.length === 0) {
        showStatusMessage('No results found.', 'info');
        setShowResults(false);
        return;
      }

      setResults(queryResults);
      setShowResults(true);
      showStatusMessage('SQL ran successfully.', 'success');
      setTimeout(hideStatus, 2000);
    } catch (error) {
      showStatusMessage(`SQL error: ${error}`, 'error');
      console.error('Query execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getBorderColor = () => {
    switch (statusType) {
      case 'info':
        return 'border-info';
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-error';
      case 'warning':
        return 'border-warning';
      default:
        return 'border-base-300';
    }
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl p-8 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">😢</div>
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-center text-error">{initError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl animate-bounce">🦆</div>
            <h2 className="text-2xl font-bold">Ahiru</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl mb-4">🦆 Ahiru</h1>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">CSV</span>
              </label>
              <p className="text-sm text-base-content/70 mb-2 px-1">
                The CSV filename becomes the table name (e.g., birds.csv → birds).
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input file-input-bordered file-input-primary w-full"
              />
            </div>

            <div className={`rounded-lg p-4 mb-4 border ${showStatus ? getBorderColor() : 'border-base-300'}`}>
              <span>{statusMessage || '\u00A0'}</span>
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">SQL</span>
              </label>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="textarea textarea-bordered h-24 font-mono"
                placeholder={`SELECT * FROM "${tableName}"`}
              />
            </div>

            <div className="card-actions justify-end mb-4">
              <button
                onClick={handleExecuteQuery}
                disabled={!isFileLoaded || isExecuting}
                className="btn btn-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Run
              </button>
            </div>

            {showResults && results.length > 0 && (
              <div>
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr>
                        {Object.keys(results[0]).map((col) => (
                          <th key={col} className="font-bold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr key={idx}>
                          {Object.keys(results[0]).map((col) => (
                            <td key={col}>{String(row[col] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-sm text-base-content/70">
                  <span>{results.length} {results.length === 1 ? 'row' : 'rows'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
