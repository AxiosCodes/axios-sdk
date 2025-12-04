# @axios/core

Low-level request engine. Provides `AxiosCore` with request/response interceptors and a fetch adapter with timeout and JSON parsing.

Usage:

```ts
import { AxiosCore } from '@axios/core';
const core = new AxiosCore({ baseURL: 'https://api.example.com' });
await core.get('/path');
```
