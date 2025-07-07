import { ErrorCode } from '@/enums/error';
import { getData } from './index';

interface CommitHistory {
  date: string;
  filename: string;
}

interface GitHubCommitListResDto {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: Date;
    };
    committer: {
      name: string;
      email: string;
      date: Date;
    };
    message: string;
    url: string;
  };
}

interface GitHubChangeFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  blob_url: string;
  raw_url: string;
  contents_url: string;
}

interface GitHubCommitResDto extends GitHubCommitListResDto {
  node_id: string;
  files: GitHubChangeFile[];
}

async function getCommitDetail(
  username: string,
  repository: string,
  sha: string
): Promise<GitHubCommitResDto | null> {
  try {
    return await getData<GitHubCommitResDto>(
      `https://api.github.com/repos/${username}/${repository}/commits/${sha}`
    );
  } catch (error) {
    console.error(`Failed while fetching detail by ${sha}`, error);
    return null;
  }
}

export const getRepoCommitHistory = async (
  username: string,
  repository: string
): Promise<CommitHistory[]> => {
  try {
    const commits = await getData<GitHubCommitListResDto[]>(
      `https://api.github.com/repos/${username}/${repository}/commits`
    );

    const commitDetails = await Promise.all(
      commits.map(({ sha }) => getCommitDetail(username, repository, sha))
    );

    const validCommits = commitDetails.filter(
      (commit): commit is GitHubCommitResDto => commit !== null
    );

    return validCommits.flatMap((commit) =>
      commit.files
        .filter(
          (file) => file.status === 'added'
          // &&
          // (file.filename.includes('TIL') || file.filename.endsWith('.md'))
        )
        .map((file) => ({
          date: new Date(commit.commit.author.date).toISOString().split('T')[0],
          filename: file.filename,
        }))
    );
  } catch (error) {
    throw new Error(
      `${ErrorCode.GITHUB_API}: ${error instanceof Error ? error.message : 'Unknown Error'}`
    );
  }
};
