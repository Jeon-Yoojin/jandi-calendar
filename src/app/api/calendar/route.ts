import { getRepoCommitHistory } from '@/service/api/getRepoCommitHistory';
import { GITHUB_BASE_URL, resolveRepoUrl } from '@/utils/gitRepository';
import { NextRequest } from 'next/server';

const headerHeight = 40;
const today = new Date();

const year = today.getFullYear();
const month = today.getMonth();

function getFirstDayInMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function getLastDayInMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

function dateToCoords(
  date: Date | string,
  offset: number
): { row: number; col: number } {
  const day = new Date(date).getDate() - 1;

  const row = Math.floor((day + offset) / 7);
  const col = (day + offset) % 7;

  return { row, col };
}

function calendarHeader(): string {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return weekdays
    .map(
      (day, i) =>
        `
        <g>
          <rect width="150" height="40" fill="#ffffff" x="${150 * i}" y="0" stroke="#e5e5e5" stroke-width="1" />
          <text x="${150 * i + 75}" y="20" font-size="16" fill="#666666" text-anchor="middle" dominant-baseline="middle">${day}</text>
        </g>
      `
    )
    .join('');
}

function calendarCell(date: number, row: number, col: number): string {
  const todayDate = today.getDate();

  return `
    <g transform="translate(0, ${headerHeight})" data-date="${date}">
      <rect width="150" height="115" fill="${col === 0 || col === 6 ? '#fcfcfc' : '#ffffff'}" x="${150 * (col % 7)}" y="${115 * row}" stroke="#e5e5e5" stroke-width="1" />
      ${date === todayDate ? `<circle cx="${150 * (col % 7) + (150 - 25) + 7.5}" cy="${115 * row + 25 - 7.5}" r="15" fill="red" />` : ''}
      <text x="${150 * (col % 7) + (150 - 25) + (date === 1 ? -20 : 0)}" y="${115 * row + 25}" font-size="20" fill="${date === todayDate ? 'white' : 'black'}">${date === 1 ? `${month + 1}월 ${date}` : date}</text>
    </g>
  `;
}

function plantGrass(
  row: number,
  col: number,
  filename: string,
  href: string
): string {
  return `
    <a href="${href}" target="_blank">
      <g transform="translate(${150 * (col % 7)}, ${115 * row + headerHeight + 30})">
        <rect width="150" height="30" fill="#ffffff" />
        <rect width="20" height="30" fill="#0077B6" />
        <text x="25" y="15" font-size="16" fill="#0077B6" dominant-baseline="middle">${textEllipsis(filename)}</text>
      </g>
    </a>
  `;
}

function textEllipsis(text: string) {
  const maxLength = 15;
  const filename = text.split('/').pop()?.replace('.md', '') || text;

  return filename.length <= maxLength
    ? filename
    : `${filename.slice(0, maxLength)}...`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repo_url = searchParams.get('repo_url') || '';

  const { user, repo } = resolveRepoUrl(repo_url);
  const branch = 'main';

  const firstDay = getFirstDayInMonth(year, month);
  const lastDay = getLastDayInMonth(year, month);
  const offset = firstDay.getDay();

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${150 * 7}" height="${115 * 6}">`;
  svg += calendarHeader();

  for (let i = 0; i < lastDay.getDate(); i++) {
    svg += calendarCell(i + 1, Math.floor((i + offset) / 7), (i + offset) % 7);
  }

  const commits = await getRepoCommitHistory(user, repo, firstDay, lastDay);

  const grasses = commits.map(({ date, filename }) => {
    return {
      ...dateToCoords(date, offset),
      filename,
      href: `${GITHUB_BASE_URL}/${user}/${repo}/blob/${branch}/${filename}`,
    };
  });

  for (const grass of grasses) {
    svg += plantGrass(
      grass.row,
      grass.col,
      grass.filename,
      encodeURI(grass.href)
    );
  }

  svg += `</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
