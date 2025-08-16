import { ErrorCode } from '@/enums/error';

export const getData = async <T>(url: string | URL | globalThis.Request) => {
  const res = await fetch(url, {
    cache: 'no-store',
    // TBD: Github token 추가해서 fetch 가능한 횟수 늘리기
    // headers: {
    //   Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    // },
  });

  if (!res.ok) {
    throw new Error(ErrorCode.FETCH_API);
  }
  const data = await res.json();
  return data as T;
};
