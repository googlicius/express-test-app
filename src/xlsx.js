const XLSX = require('xlsx');
const services = require('./services');

async function exportExampleFile() {
  /* Initial row */
  const ws = XLSX.utils.json_to_sheet(
    [{ A: 'S', B: 'h', C: 'e', D: 'e', E: 't', F: 'J', G: 'S' }],
    { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true },
  );

  /* Write data starting at A2 */
  XLSX.utils.sheet_add_json(
    ws,
    [
      { A: 1, B: 2 },
      { A: 2, B: 3 },
      { A: 3, B: 4 },
    ],
    { skipHeader: true, origin: 'A2' },
  );

  /* Write data starting at E2 */
  XLSX.utils.sheet_add_json(
    ws,
    [
      { A: 5, B: 6, C: 7 },
      { A: 6, B: 7, C: 8 },
      { A: 7, B: 8, C: 9 },
    ],
    { skipHeader: true, origin: { r: 1, c: 4 }, header: ['A', 'B', 'C'] },
  );

  /* Append row */
  XLSX.utils.sheet_add_json(
    ws,
    [{ A: 4, B: 5, C: 6, D: 7, E: 8, F: 9, G: 0 }],
    {
      header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      skipHeader: true,
      origin: -1,
    },
  );

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, ws, 'Sheet-1');

  const fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  await services.upload(fileBuffer, 'test-excel-export-2.xlsx', 's3');
}

module.exports = {
  exportExampleFile,
};
