import type { Api, Event, CircleRecord } from './types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '');

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

function jsonBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const realApi: Api = {
  getEvents: () =>
    apiFetch<Event[]>('/api/events'),

  addEvent: (event) =>
    apiFetch<Event>('/api/events', jsonBody('POST', event)),

  getRecords: (eventId) =>
    apiFetch<CircleRecord[]>(`/api/records?eventId=${encodeURIComponent(eventId)}`),

  addRecord: (input) =>
    apiFetch<{ duplicate: CircleRecord | null; record?: CircleRecord }>(
      '/api/records',
      jsonBody('POST', input),
    ),

  overwriteRecord: (id, input) =>
    apiFetch<CircleRecord>(`/api/records/${encodeURIComponent(id)}`, jsonBody('PUT', input)),

  updateRecord: (id, patch) =>
    apiFetch<CircleRecord>(`/api/records/${encodeURIComponent(id)}`, jsonBody('PATCH', patch)),

  getGenres: () =>
    apiFetch<string[]>('/api/genres'),
};
