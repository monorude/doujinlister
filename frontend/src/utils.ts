import type { CircleRecord, Priority } from './types';

export function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function safeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

export function formatPrice(n: number): string {
  return n === 0 ? '-' : `¥${n.toLocaleString()}`;
}

export function coordStr(r: Pick<CircleRecord, 'hall' | 'block' | 'number' | 'sub'>): string {
  return [r.hall, r.block, r.number, r.sub].filter(Boolean).join('-');
}

export function priorityLabel(p: Priority): string {
  if (p === -1) return '取消';
  if (p === 0) return '不明';
  return String(p);
}

export function priorityClass(p: Priority): string {
  if (p === -1) return 'p-cancel';
  if (p === 0) return 'p-0';
  return `p-${p}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export type SortKey = 'coord' | 'priority' | 'circleName' | 'price' | 'genre';
export type SortDir = 'asc' | 'desc';

// Priority sort order: 1 < 2 < 3 < 4 < 0 < -1
function priorityOrder(p: Priority): number {
  if (p === -1) return 99;
  if (p === 0) return 98;
  return p;
}

export function sortRecords(records: CircleRecord[], key: SortKey, dir: SortDir): CircleRecord[] {
  return [...records].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'coord':
        cmp = coordStr(a).localeCompare(coordStr(b), 'ja');
        break;
      case 'priority':
        cmp = priorityOrder(a.priority) - priorityOrder(b.priority);
        break;
      case 'circleName':
        cmp = a.circleName.localeCompare(b.circleName, 'ja');
        break;
      case 'price':
        cmp = a.price - b.price;
        break;
      case 'genre':
        cmp = a.genre.localeCompare(b.genre, 'ja');
        break;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function calcStats(records: CircleRecord[]): { totalBudget: number; byPriority: Map<Priority, number> } {
  const active = records.filter(r => r.price > 0 && r.priority !== -1);
  const totalBudget = active.reduce((s, r) => s + r.price, 0);
  const byPriority = new Map<Priority, number>();
  for (const r of active) {
    byPriority.set(r.priority, (byPriority.get(r.priority) ?? 0) + r.price);
  }
  return { totalBudget, byPriority };
}
