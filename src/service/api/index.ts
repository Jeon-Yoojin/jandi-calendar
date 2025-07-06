import { ErrorCode } from '@/enums/error';

export const getData = async <T>(url: string | URL | globalThis.Request) => {
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(ErrorCode.FETCH_API);
  }
  const data = await res.json();
  return data as T;
};
