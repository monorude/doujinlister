import { api } from '../api';
import { escHtml, safeUrl, formatPrice, coordStr, priorityLabel, priorityClass, sortRecords, calcStats, type SortKey, type SortDir } from '../utils';
import type { CircleRecord } from '../types';

let sortKey: SortKey = 'priority';
let sortDir: SortDir = 'asc';
let records: CircleRecord[] = [];

export async function renderToday(container: HTMLElement): Promise<void> {
  container.innerHTML = '<p class="loading">読み込み中...</p>';

  const events = await api.getEvents();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEvent = events.find(e => e.startAt.slice(0, 10) === todayStr);

  if (!todayEvent) {
    container.innerHTML = `
      <div class="card">
        <div class="empty">
          <p>本日開催のイベントはありません</p>
          <p style="margin-top:0.5rem;font-size:0.82rem">閲覧タブから過去イベントを確認できます</p>
        </div>
      </div>`;
    return;
  }

  records = await api.getRecords(todayEvent.id);

  container.innerHTML = `
    <div class="card" style="margin-bottom:0.75rem">
      <div class="event-title">${escHtml(todayEvent.name)}</div>
      <div class="event-meta">${new Date(todayEvent.startAt).toLocaleString('ja-JP')} &nbsp;·&nbsp; ${escHtml(todayEvent.genre)}</div>
    </div>
    <div id="today-stats" class="stats"></div>
    <div class="card" style="padding:0;overflow:hidden">
      <div id="today-table"></div>
    </div>`;

  renderStats();
  renderTable();
}

function renderStats(): void {
  const el = document.getElementById('today-stats');
  if (!el) return;
  const { totalBudget } = calcStats(records);
  const purchased = records.filter(r => r.purchased).length;
  const used = records.filter(r => r.purchased).reduce((s, r) => s + r.actualAmount, 0);
  el.innerHTML = `
    <div class="stat-box"><div class="stat-label">総予算</div><div class="stat-value" data-stat="budget">${formatPrice(totalBudget)}</div></div>
    <div class="stat-box"><div class="stat-label">購入済</div><div class="stat-value" data-stat="purchased">${purchased} / ${records.length}</div></div>
    <div class="stat-box"><div class="stat-label">使用金額</div><div class="stat-value" data-stat="used">${formatPrice(used)}</div></div>`;
}

function updateStats(): void {
  const { totalBudget } = calcStats(records);
  const purchased = records.filter(r => r.purchased).length;
  const used = records.filter(r => r.purchased).reduce((s, r) => s + r.actualAmount, 0);
  const q = (sel: string) => document.querySelector<HTMLElement>(`[data-stat="${sel}"]`);
  const b = q('budget'); if (b) b.textContent = formatPrice(totalBudget);
  const p = q('purchased'); if (p) p.textContent = `${purchased} / ${records.length}`;
  const u = q('used'); if (u) u.textContent = formatPrice(used);
}

function renderTable(): void {
  const el = document.getElementById('today-table');
  if (!el) return;

  const sorted = sortRecords(records, sortKey, sortDir);
  const thCls = (k: SortKey) => k === sortKey ? `sort-${sortDir}` : '';

  el.innerHTML = `
    <div class="table-wrap" style="border:none;border-radius:0">
      <table>
        <thead>
          <tr>
            <th data-sort="coord" class="${thCls('coord')}">座標</th>
            <th data-sort="circleName" class="${thCls('circleName')}">サークル名</th>
            <th data-sort="priority" class="${thCls('priority')}">優先</th>
            <th data-sort="price" class="${thCls('price')}">予算</th>
            <th class="no-sort">購入</th>
            <th class="no-sort">実費</th>
            <th data-sort="genre" class="${thCls('genre')}">ジャンル</th>
            <th class="no-sort">メモ</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(r => {
            const authorUrl = safeUrl(r.author);
            const annoUrl = safeUrl(r.announcement);
            const nameHtml = authorUrl
              ? `<a class="link" href="${escHtml(authorUrl)}" target="_blank" rel="noopener">${escHtml(r.circleName)}</a>`
              : escHtml(r.circleName);
            const annoHtml = annoUrl
              ? ` <a class="link" href="${escHtml(annoUrl)}" target="_blank" rel="noopener" title="告知ページ">↗</a>`
              : '';
            return `
            <tr class="${r.priority === -1 ? 'row-cancelled' : ''} ${r.purchased ? 'row-purchased' : ''}" data-id="${escHtml(r.id)}">
              <td class="coord">${escHtml(coordStr(r))}</td>
              <td>${nameHtml}${annoHtml}</td>
              <td><span class="badge ${priorityClass(r.priority)}">${priorityLabel(r.priority)}</span></td>
              <td>${formatPrice(r.price)}</td>
              <td><input type="checkbox" data-id="${escHtml(r.id)}" data-action="toggle" ${r.purchased ? 'checked' : ''}></td>
              <td><input type="number" class="amount-input" data-id="${escHtml(r.id)}" data-action="amount" value="${r.actualAmount || ''}" min="0" placeholder="0"></td>
              <td>${escHtml(r.genre)}</td>
              <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(r.memo)}">${escHtml(r.memo)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  // Sort
  el.querySelectorAll<HTMLElement>('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const k = th.dataset.sort as SortKey;
      if (sortKey === k) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = k; sortDir = 'asc'; }
      renderTable();
    });
  });

  // Purchase toggle
  el.querySelectorAll<HTMLInputElement>('input[data-action="toggle"]').forEach(cb => {
    cb.addEventListener('change', async () => {
      const id = cb.dataset.id!;
      const purchased = cb.checked;
      await api.updateRecord(id, { purchased });
      const idx = records.findIndex(r => r.id === id);
      if (idx < 0) return;
      records[idx] = { ...records[idx], purchased };
      const row = el.querySelector<HTMLElement>(`tr[data-id="${CSS.escape(id)}"]`);
      if (row) {
        row.classList.toggle('row-purchased', purchased);
      }
      updateStats();
    });
  });

  // Actual amount
  el.querySelectorAll<HTMLInputElement>('input[data-action="amount"]').forEach(inp => {
    inp.addEventListener('change', async () => {
      const id = inp.dataset.id!;
      const actualAmount = Math.max(0, parseInt(inp.value) || 0);
      inp.value = actualAmount ? String(actualAmount) : '';
      await api.updateRecord(id, { actualAmount });
      const idx = records.findIndex(r => r.id === id);
      if (idx >= 0) records[idx] = { ...records[idx], actualAmount };
      updateStats();
    });
  });
}
