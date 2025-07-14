import { ErrorCode } from '@/enums/error';

export const GITHUB_BASE_URL = 'https://github.com/' as const;

export function resolveRepoUrl(repo_url: string): {
  user: string;
  repo: string;
} {
  if (!repo_url.includes(GITHUB_BASE_URL)) {
    throw new Error(ErrorCode.BAD_REQUEST);
  }

  const [, accountInfo] = repo_url.split(GITHUB_BASE_URL);
  const [user, repo] = accountInfo.match(/^([^/]+)\/([^/]+)/i)?.slice(1) ?? [];

  return { user, repo };
}
