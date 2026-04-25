'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { Upload, Download, CheckCircle, XCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const CATEGORIES = ["Furniture", "Lighting", "Decor", "Tableware", "Textiles", "Plants", "Seasonal", "Photography", "Weddings", "Signage"];
const CONDITIONS = ["Like New", "Good", "Fair", "Poor", "Vintage/Antique"];
const COLORS = ["Black", "White", "Grey", "Beige", "Brown", "Red", "Blue", "Green", "Yellow", "Orange", "Pink", "Purple", "Gold", "Silver", "Copper", "Natural", "Cream", "Multi-colour"];

const TEMPLATE_CSV = [
  'title,description,category,condition,color,quantity,price_1_day,price_3_day,price_7_day,tags',
  '"Velvet Armchair","A stunning mid-century velvet armchair in excellent condition.",Furniture,"Like New",Purple,1,30,75,150,velvet|armchair|vintage',
  '"Copper Lantern Set","Set of 6 hanging copper lanterns. Perfect for outdoor events.",Lighting,Good,Copper,6,15,35,70,copper|lantern|outdoor',
].join('\n');

interface ParsedRow {
  rowNum: number;
  data: Record<string, string>;
  errors: string[];
}

type UploadResult = { row: number; title: string; status: 'created' | 'error'; message?: string };

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let i = 0;

  while (i < normalized.length) {
    const row: string[] = [];
    let inRow = true;

    while (inRow && i <= normalized.length) {
      if (i === normalized.length || normalized[i] === '\n') { inRow = false; break; }
      if (normalized[i] === '"') {
        i++;
        let val = '';
        while (i < normalized.length) {
          if (normalized[i] === '"' && normalized[i + 1] === '"') { val += '"'; i += 2; }
          else if (normalized[i] === '"') { i++; break; }
          else { val += normalized[i++]; }
        }
        row.push(val);
        if (normalized[i] === ',') i++;
        else inRow = false;
      } else {
        let val = '';
        while (i < normalized.length && normalized[i] !== ',' && normalized[i] !== '\n') val += normalized[i++];
        row.push(val.trim());
        if (normalized[i] === ',') i++;
        else inRow = false;
      }
    }

    if (i < normalized.length && normalized[i] === '\n') i++;
    if (row.length > 0 && row.some(v => v !== '')) rows.push(row);
  }

  return rows;
}

function validateRow(data: Record<string, string>): string[] {
  const errors: string[] = [];
  if (!data.title?.trim()) errors.push('title required');
  if (!data.category) errors.push('category required');
  else if (!CATEGORIES.includes(data.category)) errors.push(`"${data.category}" not a valid category`);
  if (!data.condition) errors.push('condition required');
  else if (!CONDITIONS.includes(data.condition)) errors.push(`"${data.condition}" not a valid condition`);
  if (!data.color) errors.push('color required');
  else if (!COLORS.includes(data.color)) errors.push(`"${data.color}" not a valid color`);
  if (!data.price_1_day) errors.push('price_1_day required');
  else if (isNaN(parseFloat(data.price_1_day)) || parseFloat(data.price_1_day) <= 0) errors.push('price_1_day must be positive');
  if (data.price_3_day && (isNaN(parseFloat(data.price_3_day)) || parseFloat(data.price_3_day) <= 0)) errors.push('price_3_day must be positive');
  if (data.price_7_day && (isNaN(parseFloat(data.price_7_day)) || parseFloat(data.price_7_day) <= 0)) errors.push('price_7_day must be positive');
  if (data.quantity && (isNaN(parseInt(data.quantity)) || parseInt(data.quantity) < 1)) errors.push('quantity must be a positive integer');
  return errors;
}

const COLUMNS = ['title', 'description', 'category', 'condition', 'color', 'quantity', 'price_1_day', 'price_3_day', 'price_7_day', 'tags'];

export default function BulkUpload() {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [showRef, setShowRef] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const csvFileRef = useRef<File | null>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'odd-folk-listings-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    csvFileRef.current = file;
    setFileName(file.name);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const allRows = parseCSV(text);
      if (allRows.length < 2) {
        setParsedRows([]);
        return;
      }
      const headers = allRows[0].map(h => h.toLowerCase().trim());
      const dataRows = allRows.slice(1);

      const parsed: ParsedRow[] = dataRows.map((raw, i) => {
        const data: Record<string, string> = {};
        headers.forEach((h, j) => { data[h] = raw[j] ?? ''; });
        return { rowNum: i + 2, data, errors: validateRow(data) };
      });

      setParsedRows(parsed);
    };
    reader.readAsText(file);
  };

  const validRows = parsedRows.filter(r => r.errors.length === 0);
  const errorRows = parsedRows.filter(r => r.errors.length > 0);

  const handleCreate = async () => {
    if (!csvFileRef.current || validRows.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFileRef.current);
      const res = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const json = await res.json();
      setResults(json.data?.results ?? []);
    } catch {
      setResults([{ row: 0, title: '', status: 'error', message: 'Network error — check console' }]);
    } finally {
      setIsUploading(false);
    }
  };

  const createdCount = results?.filter(r => r.status === 'created').length ?? 0;
  const failedCount = results?.filter(r => r.status === 'error').length ?? 0;

  return (
    <div className="bg-brand-white min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-8">

        {/* Header */}
        <div className="bg-brand-blue rounded-3xl p-10 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow mb-2">Internal Tool</p>
          <h1 className="font-heading text-4xl mb-2">Bulk Upload Listings</h1>
          <p className="text-white/60 font-body">For testing only. Listings are created under your account with a placeholder image.</p>
        </div>

        {/* Template + reference */}
        <div className="bg-white border border-brand-grey rounded-3xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="font-heading text-xl text-brand-burgundy">1. Download the template</h2>
              <p className="text-sm text-brand-burgundy/60 font-body mt-1">Fill it in and save as CSV. Use pipes for tags: <code className="bg-brand-grey/30 px-1.5 py-0.5 rounded text-xs">velvet|wooden|boho</code></p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate} className="flex items-center gap-2 flex-shrink-0">
              <Download className="w-4 h-4" /> Download template
            </Button>
          </div>

          {/* Valid values collapsible */}
          <div className="border border-brand-grey rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowRef(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-brand-burgundy hover:bg-brand-grey/10 transition-colors"
            >
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Valid values reference</span>
              {showRef ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRef && (
              <div className="px-6 pb-6 space-y-4 border-t border-brand-grey">
                {[
                  { label: 'category', values: CATEGORIES },
                  { label: 'condition', values: CONDITIONS },
                  { label: 'color', values: COLORS },
                ].map(({ label, values }) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-brand-burgundy/60 uppercase tracking-wider mb-2 mt-4">{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {values.map(v => (
                        <code key={v} className="bg-brand-grey/30 text-brand-burgundy text-xs px-2 py-0.5 rounded">{v}</code>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-bold text-brand-burgundy/60 uppercase tracking-wider mb-2 mt-4">column names</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLUMNS.map(c => (
                      <code key={c} className="bg-brand-orange/10 text-brand-orange text-xs px-2 py-0.5 rounded">{c}</code>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload */}
        <div className="bg-white border border-brand-grey rounded-3xl p-8 space-y-4">
          <h2 className="font-heading text-xl text-brand-burgundy">2. Upload your CSV</h2>
          <label className="flex items-center gap-4 border-2 border-dashed border-brand-orange/20 rounded-2xl p-6 cursor-pointer hover:border-brand-orange hover:bg-brand-orange/5 transition-all group">
            <Upload className="w-6 h-6 text-brand-orange/40 group-hover:text-brand-orange transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {fileName ? (
                <p className="font-body font-bold text-brand-burgundy truncate">{fileName}</p>
              ) : (
                <p className="font-body text-brand-burgundy/50">Click to choose a CSV file</p>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* Preview */}
        {parsedRows.length > 0 && !results && (
          <div className="bg-white border border-brand-grey rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-brand-grey flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl text-brand-burgundy">3. Review & create</h2>
                <p className="text-sm text-brand-burgundy/60 font-body mt-1">
                  <span className="text-green-600 font-bold">{validRows.length} valid</span>
                  {errorRows.length > 0 && <>, <span className="text-red-500 font-bold">{errorRows.length} with errors</span> (will be skipped)</>}
                </p>
              </div>
              <Button
                onClick={handleCreate}
                isLoading={isUploading}
                disabled={validRows.length === 0 || isUploading}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <Upload className="w-4 h-4" />
                Create {validRows.length} listing{validRows.length !== 1 ? 's' : ''}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="bg-brand-grey/10 text-brand-burgundy/50 text-[10px] uppercase tracking-wider">
                    <th className="text-left px-4 py-3 w-10">#</th>
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Condition</th>
                    <th className="text-left px-4 py-3">Colour</th>
                    <th className="text-left px-4 py-3">Qty</th>
                    <th className="text-left px-4 py-3">1d / 3d / 7d</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-grey/30">
                  {parsedRows.map(row => (
                    <tr key={row.rowNum} className={row.errors.length > 0 ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3 text-brand-burgundy/40">{row.rowNum}</td>
                      <td className="px-4 py-3 text-brand-burgundy font-medium max-w-[180px] truncate">{row.data.title || <span className="text-brand-burgundy/30 italic">empty</span>}</td>
                      <td className="px-4 py-3 text-brand-burgundy/70">{row.data.category}</td>
                      <td className="px-4 py-3 text-brand-burgundy/70">{row.data.condition}</td>
                      <td className="px-4 py-3 text-brand-burgundy/70">{row.data.color}</td>
                      <td className="px-4 py-3 text-brand-burgundy/70">{row.data.quantity || '1'}</td>
                      <td className="px-4 py-3 text-brand-burgundy/70 whitespace-nowrap">
                        £{row.data.price_1_day || '—'}
                        {row.data.price_3_day ? ` / £${row.data.price_3_day}` : ''}
                        {row.data.price_7_day ? ` / £${row.data.price_7_day}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        {row.errors.length === 0 ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle className="w-3.5 h-3.5" /> Valid</span>
                        ) : (
                          <span className="text-red-500 text-xs" title={row.errors.join('\n')}>
                            <span className="flex items-center gap-1 font-bold"><XCircle className="w-3.5 h-3.5 flex-shrink-0" /> {row.errors[0]}{row.errors.length > 1 ? ` +${row.errors.length - 1} more` : ''}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white border border-brand-grey rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-brand-grey">
              <h2 className="font-heading text-xl text-brand-burgundy mb-1">Upload complete</h2>
              <p className="text-sm font-body text-brand-burgundy/60">
                <span className="text-green-600 font-bold">{createdCount} created</span>
                {failedCount > 0 && <>, <span className="text-red-500 font-bold">{failedCount} failed</span></>}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="bg-brand-grey/10 text-brand-burgundy/50 text-[10px] uppercase tracking-wider">
                    <th className="text-left px-4 py-3 w-10">Row</th>
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-grey/30">
                  {results.map((r, i) => (
                    <tr key={i} className={r.status === 'error' ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3 text-brand-burgundy/40">{r.row}</td>
                      <td className="px-4 py-3 text-brand-burgundy font-medium">{r.title}</td>
                      <td className="px-4 py-3">
                        {r.status === 'created' ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle className="w-3.5 h-3.5" /> Created</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-xs font-bold"><XCircle className="w-3.5 h-3.5 flex-shrink-0" /> {r.message}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-brand-grey">
              <button
                onClick={() => { setParsedRows([]); setResults(null); setFileName(''); csvFileRef.current = null; if (fileRef.current) fileRef.current.value = ''; }}
                className="text-brand-blue font-bold text-sm hover:underline"
              >
                Upload another file
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
