export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  for (const src of sources) {
    if (!src) continue;
    for (const key of Object.keys(src)) {
      const val = (src as any)[key];
      if (Array.isArray(val)) {
        (target as any)[key] = val.slice();
      } else if (val && typeof val === 'object') {
        (target as any)[key] = deepMerge((target as any)[key] || {}, val);
      } else {
        (target as any)[key] = val;
      }
    }
  }
  return target;
}

export function parseParams(params?: Record<string, any>): string {
  if (!params) return '';
  const parts: string[] = [];
  for (const key of Object.keys(params)) {
    const val = params[key];
    if (val === null || typeof val === 'undefined') continue;
    if (Array.isArray(val)) {
      for (const v of val) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    } else if (typeof val === 'object') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(val))}`);
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
    }
  }
  return parts.join('&');
}

export function buildFullURL(baseURL?: string, url?: string, params?: Record<string, any>) {
  const trimmed = (url || '').replace(/^[\/]+/, '');
  const base = baseURL ? baseURL.replace(/\/$/, '') + '/' : '';
  const qs = parseParams(params);
  let full = base + trimmed;
  if (qs) full += (full.includes('?') ? '&' : '?') + qs;
  return full;
}

export function safeJSON(input: string) {
  try {
    return JSON.parse(input);
  } catch (err) {
    return input;
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class TimeoutController {
  controller: AbortController;
  timer?: NodeJS.Timeout;
  constructor(timeout?: number) {
    this.controller = new AbortController();
    if (timeout && timeout > 0) {
      this.timer = setTimeout(() => this.controller.abort(), timeout);
    }
  }
  get signal() {
    return this.controller.signal;
  }
  clear() {
    if (this.timer) clearTimeout(this.timer);
  }
}
