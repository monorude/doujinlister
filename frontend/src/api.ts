// VITE_API_BASE_URL が設定されている場合は本番APIを、未設定の場合はモックを使用する。
// 本番切り替え: frontend/.env に VITE_API_BASE_URL=https://your-worker.workers.dev を追加。
import { mockApi } from './api.mock';
import { realApi } from './api.real';
import type { Api } from './types';

export const api: Api = import.meta.env.VITE_API_BASE_URL ? realApi : mockApi;
