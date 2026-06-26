import { api } from '../api';
import { escHtml, formatDateTime } from '../utils';
import type { Event } from '../types';

export async function renderEvents(container: HTMLElement): Promise<void> {
  container.innerHTML = '<p class="loading">読み込み中...</p>';
  const events = await api.getEvents();
  container.innerHTML = '';
  renderEventList(container, events);
  renderEventForm(container);
}

function renderEventList(container: HTMLElement, events: Event[]): void {
  const wrap = document.createElement('div');
  wrap.id = 'event-list';
  wrap.innerHTML = `
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:1rem">
      ${events.length === 0
        ? '<div class="empty">イベントが登録されていません</div>'
        : `<div class="table-wrap" style="border:none;border-radius:0">
            <table>
              <thead>
                <tr>
                  <th class="no-sort">イベントID</th>
                  <th class="no-sort">イベント名</th>
                  <th class="no-sort">開催日時</th>
                  <th class="no-sort">ジャンル</th>
                </tr>
              </thead>
              <tbody>
                ${events.map(e => `
                  <tr>
                    <td><code>${escHtml(e.id)}</code></td>
                    <td>${escHtml(e.name)}</td>
                    <td>${formatDateTime(e.startAt)}</td>
                    <td>${escHtml(e.genre)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
    </div>`;
  container.appendChild(wrap);
}

function renderEventForm(container: HTMLElement): void {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="event-alert"></div>
    <div class="card">
      <div class="card-title">イベント追加</div>
      <form id="event-form" autocomplete="off">
        <div class="form-grid">
          <div class="form-group">
            <label>イベントID <span style="color:#c92a2a">*</span></label>
            <input name="id" placeholder="例: C107-1" required>
          </div>
          <div class="form-group">
            <label>イベント名 <span style="color:#c92a2a">*</span></label>
            <input name="name" placeholder="例: コミックマーケット107 1日目" required>
          </div>
          <div class="form-group">
            <label>開催日時 <span style="color:#c92a2a">*</span></label>
            <input name="startAt" type="datetime-local" required>
          </div>
          <div class="form-group">
            <label>イベントジャンル</label>
            <input name="genre" placeholder="例: 総合, 東方">
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">追加</button>
          <button type="reset" class="btn btn-secondary">クリア</button>
        </div>
      </form>
    </div>`;
  container.appendChild(wrap);

  const form = wrap.querySelector('#event-form') as HTMLFormElement;
  const alertEl = wrap.querySelector('#event-alert') as HTMLElement;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    alertEl.innerHTML = '';

    const fd = new FormData(form);
    const event: Event = {
      id:      String(fd.get('id') ?? '').trim(),
      name:    String(fd.get('name') ?? '').trim(),
      startAt: String(fd.get('startAt') ?? ''),
      genre:   String(fd.get('genre') ?? '').trim(),
    };

    if (!event.id || !event.name || !event.startAt) {
      alertEl.innerHTML = '<div class="alert alert-error">必須項目を入力してください</div>';
      return;
    }

    await api.addEvent(event);
    alertEl.innerHTML = `<div class="alert alert-success">追加しました: ${escHtml(event.id)}</div>`;
    form.reset();

    // リスト更新
    const events = await api.getEvents();
    const listEl = document.getElementById('event-list');
    if (listEl) {
      const tmp = document.createElement('div');
      renderEventList(tmp, events);
      listEl.replaceWith(tmp.firstElementChild!);
    }
  });
}
