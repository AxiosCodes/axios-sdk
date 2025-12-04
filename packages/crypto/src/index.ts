import { Plugin } from '@axios/types';

export const SolanaSigner = (wallet: { signMessage: (msg: Uint8Array) => Promise<string> }): Plugin => {
  return {
    request: async (config) => {
      const payload = JSON.stringify(config.body || {});
      const signature = await wallet.signMessage(new TextEncoder().encode(payload));
      config.headers = { ...(config.headers || {}), 'X-Signature': signature };
      return config;
    }
  };
};

export const EvmSigner = (signer: { signMessage: (msg: string) => Promise<string> }): Plugin => {
  return {
    request: async (config) => {
      const payload = JSON.stringify(config.body || {});
      const signature = await signer.signMessage(payload);
      config.headers = { ...(config.headers || {}), 'X-Signature': signature };
      return config;
    }
  };
};
