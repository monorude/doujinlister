export type Priority = -1 | 0 | 1 | 2 | 3 | 4;

export interface Event {
  id: string;
  name: string;
  startAt: string; // ISO 8601
  genre: string;
}

export interface CircleRecord {
  id: string;
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

export type AddRecordInput = Omit<CircleRecord, 'id' | 'purchased' | 'actualAmount'>;

export interface Api {
  getEvents(): Promise<Event[]>;
  addEvent(event: Event): Promise<Event>;
  getRecords(eventId: string): Promise<CircleRecord[]>;
  addRecord(input: AddRecordInput): Promise<{ duplicate: CircleRecord | null; record?: CircleRecord }>;
  overwriteRecord(id: string, input: AddRecordInput): Promise<CircleRecord>;
  updateRecord(id: string, patch: Partial<CircleRecord>): Promise<CircleRecord>;
  getGenres(): Promise<string[]>;
}
