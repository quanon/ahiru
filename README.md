# DuckDB CSV Search

A serverless CSV search application powered by DuckDB-Wasm and styled with DaisyUI.

## Features

- 🚀 **Serverless**: Runs entirely in the browser using WebAssembly
- 📊 **DuckDB-Wasm**: Powerful SQL engine for CSV data analysis
- 🎨 **DaisyUI**: Beautiful UI components based on Tailwind CSS
- 💻 **TypeScript**: Type-safe development
- ⚡ **Vite**: Fast development and build tool

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Click "CSVファイルをアップロード" to select a CSV file
2. Wait for the file to load (status will show loading progress)
3. Enter your SQL query in the text area (default: `SELECT * FROM data LIMIT 10`)
4. Click "実行" to execute the query
5. View the results in the table below

## Example Queries

```sql
-- Get all data
SELECT * FROM data

-- Count rows
SELECT COUNT(*) as total FROM data

-- Filter data
SELECT * FROM data WHERE column_name = 'value'

-- Aggregate data
SELECT column_name, COUNT(*) as count
FROM data
GROUP BY column_name
ORDER BY count DESC

-- Join operations (if multiple tables loaded)
SELECT * FROM data1 JOIN data2 ON data1.id = data2.id
```

## Technical Stack

- **DuckDB-Wasm**: In-browser SQL database
- **TypeScript**: Programming language
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library

## License

MIT
