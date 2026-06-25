const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

function headers(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function sheetsGet(token: string, spreadsheetId: string, range: string): Promise<string[][]> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 400 || res.status === 404) return []; // sheet may not exist yet
  if (!res.ok) throw new Error(`Sheets GET error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { values?: string[][] };
  return data.values ?? [];
}

export async function sheetsAppend(
  token: string,
  spreadsheetId: string,
  range: string,
  values: string[][],
): Promise<{ updatedRange: string }> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) throw new Error(`Sheets append error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { updates: { updatedRange: string } };
  return { updatedRange: data.updates.updatedRange };
}

export async function sheetsUpdate(
  token: string,
  spreadsheetId: string,
  range: string,
  values: string[][],
): Promise<void> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) throw new Error(`Sheets update error ${res.status}: ${await res.text()}`);
}

// "2025!A5:N5" → 5
export function parseRow(updatedRange: string): number {
  const m = updatedRange.match(/!A(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

export function padRow(row: string[], len: number): string[] {
  return [...row, ...Array<string>(len).fill('')].slice(0, len);
}
