import { Axios } from '@axios/client';

async function main() {
  const api = Axios.create({ baseURL: 'https://httpbin.org', timeout: 5000 });
  const res = await api.get('/get');
  console.log('node example response:', res.data);
}

main().catch((e) => console.error(e));
