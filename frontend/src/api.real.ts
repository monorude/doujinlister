import type { Api, Event, CircleRecord } from './types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '');
const AUTH = import.meta.env.VITE_AUTH_TOKEN as string | undefined;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeader: Record<string, string> = AUTH ? { Authorization: `Bearer ${AUTH}` } : {};
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeader, ...(init?.headers as Record<string, string> ?? {}) },
  });
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
