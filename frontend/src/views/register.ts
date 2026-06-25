import { api } from '../api';
import { escHtml, coordStr } from '../utils';
import type { CircleRecord, Priority, AddRecordInput } from '../types';

export async function renderRegister(container: HTMLElement): Promise<void> {
  container.innerHTML = '<p class="loading">読み込み中...</p>';

  const [events, genres] = await Promise.all([api.getEvents(), api.getGenres()]);

  if (events.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="empty">
          イベントが登録されていません。<br>
          <a class="link" href="#/events">イベントタブ</a>から先に追加してください。
        </div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div id="register-alert"></div>
    <div class="card">
      <div class="card-title">サークル登録</div>
      <form id="register-form" autocomplete="off">
        <div class="form-grid">
          <div class="form-group full">
            <label>イベントID</label>
            <select name="eventId">
              ${events.map(e => `<option value="${escHtml(e.id)}">${escHtml(e.id)} — ${escHtml(e.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group full">
            <label>サークルスペース座標</label>
            <div class="coord-grid">
              <div>
                <label>ホール</label>
                <input name="hall" placeholder="例: 東7">
              </div>
              <div>
                <label>枠</label>
                <input name="block" placeholder="例: F">
              </div>
              <div>
                <label>番</label>
                <input name="number" placeholder="例: 4">
              </div>
              <div>
                <label>補</label>
                <input name="sub" placeholder="例: b">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>サークル名</label>
            <input name="circleName" placeholder="サークル名">
          </div>

          <div class="form-group">
            <label>優先度</label>
            <select name="priority" class="priority-select">
              <option value="-1">-1: 取消</option>
              <option value="0">0: 不明</option>
              <option value="1" selected>1: 最優先</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4: 低</option>
            </select>
          </div>

          <div class="form-group">
            <label>予算 (円)</label>
            <input name="price" type="number" min="0" placeholder="0 = 未設定">
          </div>

          <div class="form-group">
            <label>ジャンル</label>
            <input name="genre" list="genre-list" placeholder="例: 東方">
            <datalist id="genre-list">
              ${genres.map(g => `<option value="${escHtml(g)}">`).join('')}
            </datalist>
          </div>

          <div class="form-group full">
            <label>告知URL</label>
            <input name="announcement" type="url" placeholder="https://...">
          </div>

          <div class="form-group full">
            <label>作者URL</label>
            <input name="author" type="url" placeholder="https://...">
          </div>

          <div class="form-group full">
            <label>メモ</label>
            <textarea name="memo" placeholder="メモ（任意）"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">登録</button>
          <button type="reset" class="btn btn-secondary">クリア</button>
        </div>
      </form>
    </div>`;

  const form = document.getElementById('register-form') as HTMLFormElement;
  const alertEl = document.getElementById('register-alert')!;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    alertEl.innerHTML = '';

    const fd = new FormData(form);
    const input: AddRecordInput = {
      eventId:      String(fd.get('eventId') ?? ''),
      hall:         String(fd.get('hall') ?? '').trim(),
      block:        String(fd.get('block') ?? '').trim(),
      number:       String(fd.get('number') ?? '').trim(),
      sub:          String(fd.get('sub') ?? '').trim(),
      circleName:   String(fd.get('circleName') ?? '').trim(),
      priority:     parseInt(String(fd.get('priority') ?? '0')) as Priority,
      price:        Math.max(0, parseInt(String(fd.get('price') ?? '0')) || 0),
      genre:        String(fd.get('genre') ?? '').trim(),
      announcement: String(fd.get('announcement') ?? '').trim(),
      author:       String(fd.get('author') ?? '').trim(),
      memo:         String(fd.get('memo') ?? '').trim(),
    };

    const result = await api.addRecord(input);

    if (result.duplicate) {
      showDuplicateModal(input, result.duplicate, form, alertEl);
      return;
    }

    alertEl.innerHTML = `<div class="alert alert-success">登録しました: ${escHtml(input.circleName || '(名前なし)')}</div>`;
    form.reset();
  });
}

function showDuplicateModal(input: AddRecordInput, dup: CircleRecord, form: HTMLFormElement, alertEl: HTMLElement): void {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>重複レコードの検出</h3>
      <p>同一イベント内に同じ座標のレコードが存在します。上書きしますか？</p>
      <div class="modal-detail">
        <div><strong>座標:</strong> ${escHtml(coordStr(dup))}</div>
        <div><strong>サークル名:</strong> ${escHtml(dup.circleName)}</div>
        <div><strong>優先度:</strong> ${dup.priority} &nbsp; <strong>予算:</strong> ¥${dup.price}</div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">キャンセル</button>
        <button class="btn btn-danger" id="modal-overwrite">上書きする</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('#modal-cancel')!.addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-overwrite')!.addEventListener('click', async () => {
    overlay.remove();
    await api.overwriteRecord(dup.id, input);
    alertEl.innerHTML = `<div class="alert alert-success">上書き登録しました: ${escHtml(input.circleName || '(名前なし)')}</div>`;
    form.reset();
  });
}
