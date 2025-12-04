# @axios/crypto

Plugins for signing requests. Includes `SolanaSigner` and `EvmSigner` examples which attach an `X-Signature` header.

Usage:

```ts
import { SolanaSigner } from '@axios/crypto';
api.use(SolanaSigner(wallet));
```
