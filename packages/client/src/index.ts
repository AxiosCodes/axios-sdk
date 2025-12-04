import { AxiosCore } from '@axios/core';
import { AxiosRequestConfig, Plugin } from '@axios/types';

export class AxiosInstance {
  core: AxiosCore;
  interceptors = {
    request: {
      use: (fn: any) => this.core.addRequestInterceptor(fn)
    },
    response: {
      use: (fn: any) => this.core.addResponseInterceptor(fn)
    }
  };

  constructor(core: AxiosCore) {
    this.core = core;
  }

  get(url: string, config?: AxiosRequestConfig) {
    return this.core.get(url, config);
  }
  post(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.core.post(url, body, config);
  }
  put(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.core.put(url, body, config);
  }
  patch(url: string, body?: any, config?: AxiosRequestConfig) {
    return this.core.patch(url, body, config);
  }
  delete(url: string, config?: AxiosRequestConfig) {
    return this.core.delete(url, config);
  }

  use(plugin: Plugin) {
    if (plugin.request) this.interceptors.request.use(plugin.request as any);
    if (plugin.response) this.interceptors.response.use(plugin.response as any);
  }
}

export const Axios = {
  create(config?: AxiosRequestConfig) {
    const core = new AxiosCore(config || {});
    return new AxiosInstance(core);
  }
};

export default Axios;
