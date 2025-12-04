import { AxiosRequestConfig, AxiosResponse, RequestInterceptor, ResponseInterceptor, AxiosError } from '@axios/types';
import { deepMerge, buildFullURL, safeJSON, TimeoutController } from '@axios/utils';

export class InterceptorManager {
  request: RequestInterceptor[] = [];
  response: ResponseInterceptor[] = [];

  useRequest(fn: RequestInterceptor) {
    this.request.push(fn);
    return () => {
      this.request = this.request.filter((f) => f !== fn);
    };
  }

  useResponse(fn: ResponseInterceptor) {
    this.response.push(fn);
    return () => {
      this.response = this.response.filter((f) => f !== fn);
    };
  }
}

export class AxiosCore {
  defaults: AxiosRequestConfig;
  interceptors = new InterceptorManager();

  constructor(defaults: AxiosRequestConfig = {}) {
    this.defaults = defaults;
  }

  async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    const merged = deepMerge({}, this.defaults, config || {});

    // run request interceptors in order
    let req = merged;
    for (const fn of this.interceptors.request) {
      // eslint-disable-next-line no-await-in-loop
      req = await fn(req);
    }

    const url = buildFullURL(req.baseURL, req.url, req.params);
    const timeout = req.timeout;
    const timeoutCtrl = new TimeoutController(timeout);

    try {
      const res = await this.fetchAdapter(url, req, timeoutCtrl);

      let response: AxiosResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: this.normalizeHeaders(res.headers),
        data: res.data,
        config: req
      };

      // run response interceptors in reverse order
      for (const fn of this.interceptors.response) {
        // eslint-disable-next-line no-await-in-loop
        response = await fn(response);
      }

      return response;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new AxiosError('timeout of ' + timeout + 'ms exceeded', req, 'ETIMEDOUT');
      }

      if (err instanceof AxiosError) throw err;

      throw new AxiosError(err.message || 'Network Error', req, err.code ?? null);
    } finally {
      timeoutCtrl.clear?.();
    }
  }

  normalizeHeaders(headers: any) {
    const map: Record<string, string> = {};
    if (!headers) return map;
    try {
      if (typeof headers.forEach === 'function') {
        headers.forEach((v: string, k: string) => (map[k] = v));
      } else {
        for (const key of Object.keys(headers)) map[key.toLowerCase()] = headers[key];
      }
    } catch (e) {
      // ignore
    }
    return map;
  }

  async fetchAdapter(url: string, config: AxiosRequestConfig, timeoutCtrl: TimeoutController) {
    const headers = config.headers || {};
    const method = (config.method || 'GET').toUpperCase();
    const body = config.body != null ? JSON.stringify(config.body) : undefined;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
        signal: timeoutCtrl.signal
      } as any);

      const text = await res.text();
      const data = safeJSON(text);
      if (!res.ok) {
        throw new AxiosError('Request failed with status ' + res.status, config, null, {
          status: res.status,
          statusText: res.statusText,
          headers: {},
          data,
          config
        });
      }

      return { status: res.status, statusText: res.statusText, headers: res.headers, data };
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      throw err;
    }
  }

  addRequestInterceptor(fn: RequestInterceptor) {
    return this.interceptors.useRequest(fn);
  }

  addResponseInterceptor(fn: ResponseInterceptor) {
    return this.interceptors.useResponse(fn);
  }

  // convenience methods
  get(url: string, config?: AxiosRequestConfig) {
    return this.request({ ...(config || {}), method: 'GET', url });
  }
  post(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.request({ ...(config || {}), method: 'POST', url, body });
  }
  put(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.request({ ...(config || {}), method: 'PUT', url, body });
  }
  patch(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.request({ ...(config || {}), method: 'PATCH', url, body });
  }
  delete(url: string, config?: AxiosRequestConfig) {
    return this.request({ ...(config || {}), method: 'DELETE', url });
  }
}
