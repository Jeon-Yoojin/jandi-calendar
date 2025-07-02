function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function calendarCell(date: number, row: number, col: number): string {
  return `
    <rect width="150" height="115" fill="#fcfcfc" x="${150 * col}" y="${115 * row}" stroke="#e5e5e5" stroke-width="1" />
    <text x="${150 * col + (150 - 25)}" y="${115 * row + 25}" font-size="20" fill="black">${date}</text>
  `;
}

export async function GET() {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  // const date = today.getDate();

  const days = getDaysInMonth(year, month);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${150 * 7}" height="${115 * 6}">`;

  for (let i = 1; i <= days; i++) {
    svg += calendarCell(i, Math.floor(i / 7), i % 7);
  }
  svg += `</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
