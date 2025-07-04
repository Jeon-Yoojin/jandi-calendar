function getFirstDayInMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function getLastDayInMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
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
  const headerHeight = 40;

  return `
    <g transform="translate(0, ${headerHeight})" data-date="${date}">
      <rect width="150" height="115" fill="#fcfcfc" x="${150 * (col % 7)}" y="${115 * row}" stroke="#e5e5e5" stroke-width="1" />
      <text x="${150 * (col % 7) + (150 - 25)}" y="${115 * row + 25}" font-size="20" fill="black">${date}</text>
    </g>
  `;
}

export async function GET() {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = getFirstDayInMonth(year, month);
  const lastDay = getLastDayInMonth(year, month);
  const offset = firstDay.getDay();

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${150 * 7}" height="${115 * 6}">`;
  svg += calendarHeader();

  for (let i = 0; i < lastDay.getDate(); i++) {
    svg += calendarCell(i + 1, Math.floor((i + offset) / 7), (i + offset) % 7);
  }

  svg += `</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
