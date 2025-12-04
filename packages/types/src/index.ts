export interface AxiosRequestConfig {
  baseURL?: string;
  url?: string;
  method?: string;
  params?: Record<string, any>;
  headers?: Record<string, any>;
  body?: any;
  timeout?: number;
}

export interface AxiosResponse<T = any> {
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  data: T;
  config?: AxiosRequestConfig;
}

export class AxiosError extends Error {
  isAxiosError = true;
  config?: AxiosRequestConfig;
  code?: string | null;
  response?: AxiosResponse;

  constructor(message: string, config?: AxiosRequestConfig, code?: string | null, response?: AxiosResponse) {
    super(message);
    this.name = 'AxiosError';
    this.config = config;
    this.code = code ?? null;
    this.response = response;
  }
}

export type RequestInterceptor = (config: AxiosRequestConfig) => Promise<AxiosRequestConfig> | AxiosRequestConfig;
export type ResponseInterceptor = (response: AxiosResponse) => Promise<AxiosResponse> | AxiosResponse;

export type Plugin = {
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
};
