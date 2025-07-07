import { getRepoCommitHistory } from '@/service/api/getRepoCommitHistory';

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
  return `
    <g transform="translate(0, ${headerHeight})" data-date="${date}">
      <rect width="150" height="115" fill="#fcfcfc" x="${150 * (col % 7)}" y="${115 * row}" stroke="#e5e5e5" stroke-width="1" />
      <text x="${150 * (col % 7) + (150 - 25) + (date === 1 ? -20 : 0)}" y="${115 * row + 25}" font-size="20" fill="black">${date === 1 ? `${month + 1}월 ${date}` : date}</text>
    </g>
  `;
}

function plantGrass(row: number, col: number, href: string): string {
  const username = 'Jeon-Yoojin';
  const repository = 'jandi-calendar';
  const branch = 'main';

  return `
    <a href="https://github.com/${username}/${repository}/blob/${branch}/${encodeURI(href)}" target="_blank">
      <g transform="translate(${150 * (col % 7)}, ${115 * row + headerHeight + 30})">
        <rect width="150" height="30" fill="#ffffff" />
        <rect width="20" height="30" fill="#0077B6" />
        <text x="40" y="15" font-size="16" fill="#0077B6" text-anchor="middle" dominant-baseline="middle">${textEllipsis(href)}</text>
      </g>
    </a>
  `;
}

function textEllipsis(text: string) {
  const maxLength = 15;
  const filename = text.split('/').pop()?.replace('.md', '') || text;

  if (filename.length <= maxLength) {
    return filename;
  }

  return `${filename.slice(0, maxLength)}...`;
}

export async function GET() {
  const firstDay = getFirstDayInMonth(year, month);
  const lastDay = getLastDayInMonth(year, month);
  const offset = firstDay.getDay();

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${150 * 7}" height="${115 * 6}">`;
  svg += calendarHeader();

  for (let i = 0; i < lastDay.getDate(); i++) {
    svg += calendarCell(i + 1, Math.floor((i + offset) / 7), (i + offset) % 7);
  }

  const commits = await getRepoCommitHistory('Jeon-Yoojin', 'jandi-calendar');

  const grasses = commits.map(({ date, filename }) => {
    return { ...dateToCoords(date, offset), filename };
  });

  for (const grass of grasses) {
    svg += plantGrass(grass.row, grass.col, grass.filename);
  }

  svg += `</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
