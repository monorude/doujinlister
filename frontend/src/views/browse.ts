import { api } from '../api';
import { escHtml, safeUrl, formatPrice, coordStr, priorityLabel, priorityClass, sortRecords, calcStats, type SortKey, type SortDir } from '../utils';
import type { CircleRecord, Priority } from '../types';

let sortKey: SortKey = 'priority';
let sortDir: SortDir = 'asc';
let records: CircleRecord[] = [];

export async function renderBrowse(container: HTMLElement): Promise<void> {
  container.innerHTML = '<p class="loading">読み込み中...</p>';
  const events = await api.getEvents();

  if (events.length === 0) {
    container.innerHTML = `<div class="card"><div class="empty">イベントが登録されていません。<br>イベントタブから追加してください。</div></div>`;
    return;
  }

  const defaultId = events[0].id;

  container.innerHTML = `
    <div class="card" style="margin-bottom:0.75rem">
      <div class="card-title">イベント選択</div>
      <select id="event-select">
        ${events.map(e => `<option value="${escHtml(e.id)}">${escHtml(e.id)} — ${escHtml(e.name)}</option>`).join('')}
      </select>
    </div>
    <div id="browse-stats" class="stats"></div>
    <div id="browse-table-wrap" class="card" style="padding:0;overflow:hidden"></div>`;

  const sel = document.getElementById('event-select') as HTMLSelectElement;
  sel.addEventListener('change', () => loadRecords(sel.value));
  await loadRecords(defaultId);
}

async function loadRecords(eventId: string): Promise<void> {
  const statsEl = document.getElementById('browse-stats');
  const tableWrap = document.getElementById('browse-table-wrap');
  if (!statsEl || !tableWrap) return;

  statsEl.innerHTML = '<p class="loading" style="padding:0.5rem">読み込み中...</p>';
  tableWrap.innerHTML = '';

  records = await api.getRecords(eventId);

  renderBrowseStats(statsEl);
  renderBrowseTable(tableWrap);
}

function renderBrowseStats(el: HTMLElement): void {
  const { totalBudget, byPriority } = calcStats(records);

  const priorityRows = ([1, 2, 3, 4] as Priority[])
    .filter(p => byPriority.has(p))
    .map(p => `<div class="stat-box"><div class="stat-label">優先度 ${p}</div><div class="stat-value">${formatPrice(byPriority.get(p)!)}</div></div>`)
    .join('');

  el.innerHTML = `
    <div class="stat-box"><div class="stat-label">総予算（有効）</div><div class="stat-value">${formatPrice(totalBudget)}</div></div>
    <div class="stat-box"><div class="stat-label">件数</div><div class="stat-value">${records.length}</div></div>
    ${priorityRows}`;
}

function renderBrowseTable(wrap: HTMLElement): void {
  if (records.length === 0) {
    wrap.innerHTML = '<div class="empty">レコードがありません</div>';
    return;
  }

  const sorted = sortRecords(records, sortKey, sortDir);
  const thCls = (k: SortKey) => k === sortKey ? `sort-${sortDir}` : '';

  wrap.innerHTML = `
    <div class="table-wrap" style="border:none;border-radius:0">
      <table>
        <thead>
          <tr>
            <th data-sort="coord" class="${thCls('coord')}">座標</th>
            <th data-sort="circleName" class="${thCls('circleName')}">サークル名</th>
            <th class="no-sort">告知</th>
            <th data-sort="priority" class="${thCls('priority')}">優先</th>
            <th data-sort="price" class="${thCls('price')}">予算</th>
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
              ? `<a class="link" href="${escHtml(annoUrl)}" target="_blank" rel="noopener">↗</a>`
              : '-';
            return `
            <tr class="${r.priority === -1 ? 'row-cancelled' : ''}">
              <td class="coord">${escHtml(coordStr(r))}</td>
              <td>${nameHtml}</td>
              <td>${annoHtml}</td>
              <td><span class="badge ${priorityClass(r.priority)}">${priorityLabel(r.priority)}</span></td>
              <td>${formatPrice(r.price)}</td>
              <td>${escHtml(r.genre)}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(r.memo)}">${escHtml(r.memo)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  wrap.querySelectorAll<HTMLElement>('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const k = th.dataset.sort as SortKey;
      if (sortKey === k) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = k; sortDir = 'asc'; }
      renderBrowseTable(wrap);
    });
  });
}
