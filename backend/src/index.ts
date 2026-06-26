import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getAccessToken } from './auth';
import { sheetsGet, sheetsAppend, sheetsUpdate, parseRow, padRow } from './sheets';

// ── 型定義 ────────────────────────────────────────────────────────────────

type Priority = -1 | 0 | 1 | 2 | 3 | 4;

interface Event {
  id: string;
  name: string;
  startAt: string;
  genre: string;
}

interface CircleRecord {
  id: string; // "{year}:{rowNum}"
  eventId: string;
  hall: string;
  block: string;
  number: string;
  sub: string;
  announcement: string;
  author: string;
  circleName: string;
  price: number;
  genre: string;
  priority: Priority;
  memo: string;
  purchased: boolean;
  actualAmount: number;
}

type AddRecordInput = Omit<CircleRecord, 'id' | 'purchased' | 'actualAmount'>;

interface Env {
  SPREADSHEET_ID: string;
  GOOGLE_SERVICE_ACCOUNT_JSON: string;
  AUTH_TOKEN: string;
}

// ── スプレッドシート列定義 ─────────────────────────────────────────────────
// 記録シート (14列): A=eventId B=hall C=block D=number E=sub F=announcement
//   G=author H=circleName I=price J=genre K=priority L=memo M=purchased N=actualAmount
// イベントシート (4列): A=id B=name C=startAt D=genre
// ※ 1行目はヘッダー行

const RECORD_COLS = 14;
const EVENT_COLS  = 4;

// ── 変換関数 ──────────────────────────────────────────────────────────────

function rowToEvent(row: string[]): Event {
  const r = padRow(row, EVENT_COLS);
  return { id: r[0], name: r[1], startAt: r[2], genre: r[3] };
}

function eventToRow(e: Event): string[] {
  return [e.id, e.name, e.startAt, e.genre];
}

function rowToRecord(row: string[], year: number, rowNum: number): CircleRecord {
  const r = padRow(row, RECORD_COLS);
  return {
    id:           `${year}:${rowNum}`,
    eventId:      r[0],
    hall:         r[1],
    block:        r[2],
    number:       r[3],
    sub:          r[4],
    announcement: r[5],
    author:       r[6],
    circleName:   r[7],
    price:        parseInt(r[8]) || 0,
    genre:        r[9],
    priority:     (parseInt(r[10]) || 0) as Priority,
    memo:         r[11],
    purchased:    r[12] === 'true',
    actualAmount: parseInt(r[13]) || 0,
  };
}

function inputToRow(input: AddRecordInput, purchased = false, actualAmount = 0): string[] {
  return [
    input.eventId, input.hall, input.block, input.number, input.sub,
    input.announcement, input.author, input.circleName,
    String(input.price), input.genre, String(input.priority), input.memo,
    String(purchased), String(actualAmount),
  ];
}

// ── ヘルパー ──────────────────────────────────────────────────────────────

async function getEventYear(
  token: string,
  spreadsheetId: string,
  eventId: string,
): Promise<number | null> {
  const rows = await sheetsGet(token, spreadsheetId, 'events!A:D');
  const event = rows.slice(1).find(r => r[0] === eventId);
  if (!event) return null;
  const year = new Date(event[2]).getFullYear();
  return isNaN(year) ? null : year;
}

function parseRecordId(id: string): { year: number; rowNum: number } | null {
  const [y, r] = id.split(':');
  const year = parseInt(y);
  const rowNum = parseInt(r);
  if (isNaN(year) || isNaN(rowNum)) return null;
  return { year, rowNum };
}

// ── Hono アプリ ───────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return next();
  const auth = c.req.header('Authorization');
  if (!c.env.AUTH_TOKEN || auth !== `Bearer ${c.env.AUTH_TOKEN}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return next();
});

// ── イベント ──────────────────────────────────────────────────────────────

app.get('/api/events', async (c) => {
  const token = await getAccessToken(c.env);
  const rows = await sheetsGet(token, c.env.SPREADSHEET_ID, 'events!A:D');
  const events = rows.slice(1).filter(r => r[0]).map(rowToEvent);
  return c.json(events);
});

app.post('/api/events', async (c) => {
  const body = await c.req.json<Event>();
  const token = await getAccessToken(c.env);
  const rows = await sheetsGet(token, c.env.SPREADSHEET_ID, 'events!A:D');
  const idx = rows.findIndex((r, i) => i > 0 && r[0] === body.id);

  if (idx >= 0) {
    // 上書き更新
    await sheetsUpdate(token, c.env.SPREADSHEET_ID, `events!A${idx + 1}:D${idx + 1}`, [eventToRow(body)]);
  } else {
    await sheetsAppend(token, c.env.SPREADSHEET_ID, 'events!A:D', [eventToRow(body)]);
  }
  return c.json(body);
});

// ── 記録 ──────────────────────────────────────────────────────────────────

app.get('/api/records', async (c) => {
  const eventId = c.req.query('eventId');
  if (!eventId) return c.json({ error: 'eventId is required' }, 400);

  const token = await getAccessToken(c.env);
  const year = await getEventYear(token, c.env.SPREADSHEET_ID, eventId);
  if (!year) return c.json({ error: 'Event not found' }, 404);

  const rows = await sheetsGet(token, c.env.SPREADSHEET_ID, `${year}!A:N`);
  const records = rows
    .slice(1)
    .map((row, i) => ({ row, rowNum: i + 2 }))
    .filter(({ row }) => row[0] === eventId)
    .map(({ row, rowNum }) => rowToRecord(row, year, rowNum));

  return c.json(records);
});

app.post('/api/records', async (c) => {
  const input = await c.req.json<AddRecordInput>();
  const token = await getAccessToken(c.env);
  const year = await getEventYear(token, c.env.SPREADSHEET_ID, input.eventId);
  if (!year) return c.json({ error: 'Event not found' }, 404);

  const rows = await sheetsGet(token, c.env.SPREADSHEET_ID, `${year}!A:N`);

  // 重複チェック: 同一イベントID内でホール+枠+番+補が一致するレコード
  const dupEntry = rows
    .slice(1)
    .map((row, i) => ({ row, rowNum: i + 2 }))
    .find(({ row }) =>
      row[0] === input.eventId &&
      row[1] === input.hall &&
      row[2] === input.block &&
      row[3] === input.number &&
      row[4] === input.sub,
    );

  if (dupEntry) {
    const dup = rowToRecord(dupEntry.row, year, dupEntry.rowNum);
    return c.json({ duplicate: dup });
  }

  const newRow = inputToRow(input);
  const { updatedRange } = await sheetsAppend(token, c.env.SPREADSHEET_ID, `${year}!A:N`, [newRow]);
  const rowNum = parseRow(updatedRange);
  const record = rowToRecord(newRow, year, rowNum);

  return c.json({ duplicate: null, record }, 201);
});

// 上書き (PUT): 既存レコードを全フィールド置換
app.put('/api/records/:id', async (c) => {
  const parsed = parseRecordId(c.req.param('id'));
  if (!parsed) return c.json({ error: 'Invalid record id' }, 400);
  const { year, rowNum } = parsed;

  const input = await c.req.json<AddRecordInput>();
  const token = await getAccessToken(c.env);

  // purchased / actualAmount は現在値を維持
  const existing = await sheetsGet(token, c.env.SPREADSHEET_ID, `${year}!A${rowNum}:N${rowNum}`);
  const cur = padRow(existing[0] ?? [], RECORD_COLS);
  const newRow = inputToRow(input, cur[12] === 'true', parseInt(cur[13]) || 0);

  await sheetsUpdate(token, c.env.SPREADSHEET_ID, `${year}!A${rowNum}:N${rowNum}`, [newRow]);
  return c.json(rowToRecord(newRow, year, rowNum));
});

// 部分更新 (PATCH): 購入チェック・実費・優先度・メモのみ
app.patch('/api/records/:id', async (c) => {
  const parsed = parseRecordId(c.req.param('id'));
  if (!parsed) return c.json({ error: 'Invalid record id' }, 400);
  const { year, rowNum } = parsed;

  const patch = await c.req.json<Partial<CircleRecord>>();
  const token = await getAccessToken(c.env);

  const existing = await sheetsGet(token, c.env.SPREADSHEET_ID, `${year}!A${rowNum}:N${rowNum}`);
  const row = padRow(existing[0] ?? [], RECORD_COLS);

  if ('purchased'    in patch) row[12] = String(patch.purchased);
  if ('actualAmount' in patch) row[13] = String(patch.actualAmount);
  if ('priority'     in patch) row[10] = String(patch.priority);
  if ('memo'         in patch) row[11] = String(patch.memo ?? '');

  await sheetsUpdate(token, c.env.SPREADSHEET_ID, `${year}!A${rowNum}:N${rowNum}`, [row]);
  return c.json(rowToRecord(row, year, rowNum));
});

// ── ジャンル候補 ──────────────────────────────────────────────────────────

app.get('/api/genres', async (c) => {
  const year = new Date().getFullYear();
  const token = await getAccessToken(c.env);
  const rows = await sheetsGet(token, c.env.SPREADSHEET_ID, `${year}!J:J`);
  const genres = [...new Set(rows.slice(1).map(r => r[0]).filter(Boolean))];
  return c.json(genres);
});

// ── 初期セットアップ ──────────────────────────────────────────────────────
// 各シートのヘッダー行が存在しない場合に追加する

app.post('/api/setup', async (c) => {
  const token = await getAccessToken(c.env);
  const year = new Date().getFullYear();

  const eventsHeader = ['イベントID', 'イベント名', '開催時刻', 'ジャンル'];
  const recordsHeader = [
    'イベントID', 'ホール', '枠', '番', '補', '告知URL', '作者URL',
    'サークル名', '値段', 'ジャンル', '優先度', 'メモ', '購入済み', '実費',
  ];

  const eventsRows = await sheetsGet(token, c.env.SPREADSHEET_ID, 'events!A1:D1');
  if (!eventsRows[0]?.length) {
    await sheetsAppend(token, c.env.SPREADSHEET_ID, 'events!A:D', [eventsHeader]);
  }

  const yearRows = await sheetsGet(token, c.env.SPREADSHEET_ID, `${year}!A1:N1`);
  if (!yearRows[0]?.length) {
    await sheetsAppend(token, c.env.SPREADSHEET_ID, `${year}!A:N`, [recordsHeader]);
  }

  return c.json({ ok: true, year });
});

export default app;
