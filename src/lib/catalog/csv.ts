export function parseCsvRows(input: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim() !== ""));
}

export function toObjectRows<T extends Record<string, string>>(rows: string[][]) {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    throw new Error("CSV file is missing a header row.");
  }

  const headers = headerRow.map((header) => header.trim());

  return dataRows.map((row) =>
    headers.reduce<Record<string, string>>((accumulator, header, index) => {
      accumulator[header] = row[index]?.trim() ?? "";
      return accumulator;
    }, {}) as T,
  );
}

function escapeCsvCell(value: unknown) {
  const normalized = value === null || value === undefined ? "" : String(value);

  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export function stringifyCsvRows<T extends object>(headers: string[], rows: T[]) {
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCsvCell((row as Record<string, unknown>)[header]))
        .join(","),
    ),
  ].join("\n");
}
