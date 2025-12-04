# @axios/client

Public SDK wrapper. Use `Axios.create()` to create instances with convenience methods and plugin support.

```ts
import { Axios } from '@axios/client';
const api = Axios.create({ baseURL: 'https://api.example.com' });
await api.get('/ping');
```
