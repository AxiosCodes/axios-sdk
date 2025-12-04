import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosCore } from '../src';
import { AxiosRequestConfig } from '@axios/types';

describe('AxiosCore', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (global as any).fetch;
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('merges config correctly', async () => {
    const core = new AxiosCore({ baseURL: 'https://api.test', headers: { a: '1' } });
    (global as any).fetch = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })));
    const res = await core.request({ url: '/hello', headers: { b: '2' } as any } as AxiosRequestConfig);
    expect(res.config?.baseURL).toBe('https://api.test');
    expect(res.config?.headers?.a).toBe('1');
    expect(res.config?.headers?.b).toBe('2');
  });

  it('executes interceptors in order', async () => {
    const core = new AxiosCore();
    const order: string[] = [];
    core.addRequestInterceptor(async (c) => {
      order.push('r1');
      return c;
    });
    core.addRequestInterceptor(async (c) => {
      order.push('r2');
      return c;
    });
    core.addResponseInterceptor(async (r) => {
      order.push('s1');
      return r;
    });
    (global as any).fetch = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })));
    await core.get('https://example.com');
    expect(order).toEqual(['r1', 'r2', 's1']);
  });

  it('parses JSON automatically', async () => {
    const core = new AxiosCore();
    (global as any).fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ hello: 'world' }), { status: 200 })));
    const res = await core.get('https://example.com');
    expect(res.data).toEqual({ hello: 'world' });
  });

  it('times out requests', async () => {
    const core = new AxiosCore();
    // create a fetch that never resolves
    (global as any).fetch = vi.fn(() => new Promise(() => {}));
    await expect(core.request({ url: 'https://example.com', timeout: 10 })).rejects.toThrow();
  });

  it('wraps non-ok responses in AxiosError', async () => {
    const core = new AxiosCore();
    (global as any).fetch = vi.fn(() => Promise.resolve(new Response('fail', { status: 500 })));
    await expect(core.get('https://example.com')).rejects.toHaveProperty('isAxiosError', true);
  });
});
