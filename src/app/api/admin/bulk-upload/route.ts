import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import prisma from '@/lib/prisma';
import { COLOUR_OPTIONS } from '@/lib/colours';
import { MATERIAL_OPTIONS } from '@/lib/materials';

const CATEGORIES = ["Furniture", "Lighting", "Decor", "Tableware", "Textiles", "Plants", "Seasonal", "Photography", "Weddings", "Signage"];
const CONDITIONS = ["Like New", "Good", "Fair", "Poor", "Vintage/Antique"];

const PLACEHOLDER_IMAGE = '/product-placeholder.svg';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let i = 0;

  while (i < normalized.length) {
    const row: string[] = [];
    let inRow = true;

    while (inRow && i <= normalized.length) {
      if (i === normalized.length || normalized[i] === '\n') {
        inRow = false;
        break;
      }
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
  if (!data.title?.trim()) errors.push('title is required');
  if (!data.category) errors.push('category is required');
  else if (!CATEGORIES.includes(data.category)) errors.push(`invalid category: "${data.category}"`);
  if (!data.condition) errors.push('condition is required');
  else if (!CONDITIONS.includes(data.condition)) errors.push(`invalid condition: "${data.condition}"`);
  if (!data.colors) errors.push('colors is required');
  else {
    const vals = data.colors.split('|').map((c: string) => c.trim()).slice(0, 3);
    const invalid = vals.filter((c: string) => !COLOUR_OPTIONS.includes(c));
    if (invalid.length) errors.push(`invalid colors: ${invalid.join(', ')}`);
  }
  if (data.materials) {
    const vals = data.materials.split('|').map((m: string) => m.trim()).slice(0, 3);
    const invalid = vals.filter((m: string) => !MATERIAL_OPTIONS.includes(m));
    if (invalid.length) errors.push(`invalid materials: ${invalid.join(', ')}`);
  }
  if (!data.price_1_day) errors.push('price_1_day is required');
  else if (isNaN(parseFloat(data.price_1_day)) || parseFloat(data.price_1_day) <= 0) errors.push('price_1_day must be a positive number');
  ['discount_7_day', 'discount_14_day', 'discount_28_day'].forEach(key => {
    if (data[key] !== undefined && data[key] !== '') {
      const v = parseInt(data[key]);
      if (isNaN(v) || v < 0 || v > 50) errors.push(`${key} must be 0–50`);
    }
  });
  if (data.quantity && (isNaN(parseInt(data.quantity)) || parseInt(data.quantity) < 1)) errors.push('quantity must be a positive integer');
  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('No file provided', 400);

    const text = await file.text();
    const allRows = parseCSV(text);
    if (allRows.length < 2) return errorResponse('CSV has no data rows', 400);

    const headers = allRows[0].map(h => h.toLowerCase().trim());
    const dataRows = allRows.slice(1);

    const firstLocation = await prisma.location.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    const results: { row: number; title: string; status: 'created' | 'error'; message?: string }[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const raw = dataRows[i];
      const data: Record<string, string> = {};
      headers.forEach((h, j) => { data[h] = raw[j] ?? ''; });

      const errors = validateRow(data);
      if (errors.length > 0) {
        results.push({ row: i + 2, title: data.title || '(empty)', status: 'error', message: errors.join('; ') });
        continue;
      }

      try {
        const tags = data.tags
          ? data.tags.split('|').map(t => t.trim().toLowerCase()).filter(Boolean)
          : [];

        await prisma.product.create({
          data: {
            ownerId: user.id,
            title: data.title.trim(),
            description: data.description?.trim() || '',
            category: data.category,
            condition: data.condition,
            colors: JSON.stringify(data.colors.split('|').map((c: string) => c.trim()).slice(0, 3)),
            materials: JSON.stringify(data.materials.split('|').map((m: string) => m.trim()).slice(0, 3)),
            quantity: data.quantity ? parseInt(data.quantity) : 1,
            price1Day:     parseFloat(data.price_1_day),
            discount7Day:  Math.min(50, Math.max(0, parseInt(data.discount_7_day)  || 0)),
            discount14Day: Math.min(50, Math.max(0, parseInt(data.discount_14_day) || 0)),
            discount28Day: Math.min(50, Math.max(0, parseInt(data.discount_28_day) || 0)),
            images: JSON.stringify([PLACEHOLDER_IMAGE]),
            tags: JSON.stringify(tags),
            locationId: firstLocation?.id ?? null,
            status: 'ACTIVE',
          },
        });

        results.push({ row: i + 2, title: data.title, status: 'created' });
      } catch (err) {
        results.push({ row: i + 2, title: data.title || '(empty)', status: 'error', message: String(err) });
      }
    }

    const created = results.filter(r => r.status === 'created').length;
    const errors = results.filter(r => r.status === 'error').length;

    return successResponse({ created, errors, results });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Upload failed', 500);
  }
}
