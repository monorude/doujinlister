import type { Api, Event, CircleRecord, AddRecordInput } from './types';

const todayStr = new Date().toISOString().slice(0, 10);

const MOCK_EVENTS: Event[] = [
  { id: 'C107-1', name: 'コミックマーケット107 1日目', startAt: `${todayStr}T10:00:00`, genre: '総合' },
  { id: 'C107-2', name: 'コミックマーケット107 2日目', startAt: '2024-12-30T10:00:00', genre: '総合' },
  { id: 'URC-03', name: 'うらのほうのサークル03', startAt: '2024-11-03T11:00:00', genre: '東方' },
];

let idSeq = 10;
const MOCK_RECORDS: CircleRecord[] = [
  { id: '1', eventId: 'C107-1', hall: '東7', block: 'F', number: '4', sub: 'b', announcement: 'https://x.com/hoge/status/example', author: 'https://x.com/hoge', circleName: '大ケヤキのその先へ', price: 500, genre: 'AB', priority: 1, memo: '', purchased: false, actualAmount: 0 },
  { id: '2', eventId: 'C107-1', hall: '東7', block: 'G', number: '12', sub: 'a', announcement: '', author: 'https://x.com/example2', circleName: 'サンプルサークル', price: 1000, genre: 'オリジナル', priority: 2, memo: '新刊あり', purchased: false, actualAmount: 0 },
  { id: '3', eventId: 'C107-1', hall: '西', block: 'め', number: '25', sub: '', announcement: '', author: '', circleName: 'テストサークル', price: 800, genre: 'AB', priority: 3, memo: '', purchased: false, actualAmount: 0 },
  { id: '4', eventId: 'C107-1', hall: '東1', block: 'A', number: '3', sub: 'b', announcement: '', author: '', circleName: '取消サークル', price: 600, genre: 'オリジナル', priority: -1, memo: '欠席', purchased: false, actualAmount: 0 },
  { id: '5', eventId: 'C107-2', hall: '東1', block: 'A', number: '1', sub: 'a', announcement: '', author: '', circleName: '別日サークル', price: 800, genre: '東方', priority: 1, memo: '', purchased: false, actualAmount: 0 },
  { id: '6', eventId: 'URC-03', hall: '', block: '2', number: '21', sub: '', announcement: '', author: '', circleName: 'ウラサークル', price: 300, genre: '東方', priority: 2, memo: '', purchased: false, actualAmount: 0 },
];

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function findDuplicate(eventId: string, hall: string, block: string, number: string, sub: string): CircleRecord | null {
  return MOCK_RECORDS.find(r =>
    r.eventId === eventId && r.hall === hall && r.block === block && r.number === number && r.sub === sub
  ) ?? null;
}

export const api: Api = {
  async getEvents() {
    await delay(80);
    return [...MOCK_EVENTS];
  },

  async addEvent(event) {
    await delay(80);
    const idx = MOCK_EVENTS.findIndex(e => e.id === event.id);
    if (idx >= 0) MOCK_EVENTS[idx] = event;
    else MOCK_EVENTS.push(event);
    return event;
  },

  async getRecords(eventId) {
    await delay(80);
    return MOCK_RECORDS.filter(r => r.eventId === eventId).map(r => ({ ...r }));
  },

  async addRecord(input) {
    await delay(80);
    const dup = findDuplicate(input.eventId, input.hall, input.block, input.number, input.sub);
    if (dup) return { duplicate: { ...dup } };
    const record: CircleRecord = { id: String(++idSeq), purchased: false, actualAmount: 0, ...input };
    MOCK_RECORDS.push(record);
    return { duplicate: null, record };
  },

  async overwriteRecord(id, input) {
    await delay(80);
    const idx = MOCK_RECORDS.findIndex(r => r.id === id);
    if (idx < 0) throw new Error(`Record ${id} not found`);
    const prev = MOCK_RECORDS[idx];
    MOCK_RECORDS[idx] = { ...prev, ...input };
    return { ...MOCK_RECORDS[idx] };
  },

  async updateRecord(id, patch) {
    await delay(80);
    const idx = MOCK_RECORDS.findIndex(r => r.id === id);
    if (idx < 0) throw new Error(`Record ${id} not found`);
    MOCK_RECORDS[idx] = { ...MOCK_RECORDS[idx], ...patch };
    return { ...MOCK_RECORDS[idx] };
  },

  async getGenres() {
    await delay(40);
    return [...new Set(MOCK_RECORDS.map(r => r.genre).filter(Boolean))];
  },
};
