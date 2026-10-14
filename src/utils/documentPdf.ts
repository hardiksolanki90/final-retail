import type { DocumentSheet } from '../types/DocumentView';

/** What the PDF needs besides the document itself. */
export interface PdfContext {
  organisation?: string | null;
  currency: string;
  digits: number;
}

// A4 portrait, millimetres.
const PAGE_W = 210;
const MARGIN = 14;
const INK = 30;
const MUTED = 115;

/**
 * Renders a DocumentSheet as an A4 PDF: header, dates, customer / reference blocks, the item table,
 * the summary and notes. jsPDF is loaded on first use so it stays out of the main bundle.
 * Uses the built-in Helvetica font, so text is Latin-only (amounts use the currency code, not its symbol).
 */
export async function buildSheetPdf(sheet: DocumentSheet, ctx: PdfContext) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const amount = (value?: number) => (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: ctx.digits, maximumFractionDigits: ctx.digits });
  const right = PAGE_W - MARGIN;
  let y = MARGIN + 4;

  // Header: organisation left, document kind + number right, status underneath.
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(INK).text(ctx.organisation ?? '', MARGIN, y);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(MUTED).text(sheet.kind.toUpperCase(), right, y - 4, { align: 'right' });
  doc.setFont('courier', 'bold').setFontSize(15).setTextColor(INK).text(sheet.number, right, y + 2, { align: 'right' });
  if (sheet.badges.length > 0) doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(MUTED).text(sheet.badges.map((b) => b.label).join('  ·  '), right, y + 8, { align: 'right' });
  y += 14;
  doc.setDrawColor(220).line(MARGIN, y, right, y);
  y += 7;

  // Dates in one row.
  const dateW = (right - MARGIN) / Math.max(sheet.dates.length, 3);
  sheet.dates.forEach((d, i) => {
    const x = MARGIN + i * dateW;
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(MUTED).text(d.label.toUpperCase(), x, y);
    doc.setFontSize(10).setTextColor(INK).text(d.value ?? 'Not set', x, y + 5);
  });
  y += 13;

  // Customer / salesman block (left) and reference block (right).
  const half = (right - MARGIN) / 2;
  const blockTop = y;
  let leftY = y;
  if (sheet.party) {
    doc.setFontSize(8).setTextColor(MUTED).text(sheet.party.title.toUpperCase(), MARGIN, leftY);
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(INK).text(sheet.party.name ?? 'Not set', MARGIN, leftY + 5.5);
    leftY += 5.5;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(MUTED);
    [sheet.party.code, ...sheet.party.meta].filter(Boolean).forEach((line) => {
      leftY += 4.5;
      doc.text(String(line), MARGIN, leftY);
    });
  }
  const refX = sheet.party ? MARGIN + half + 6 : MARGIN;
  let refY = blockTop;
  doc.setFontSize(8).setTextColor(MUTED).text(sheet.detailsTitle.toUpperCase(), refX, refY);
  sheet.details.forEach((d) => {
    refY += 4.8;
    doc.setFontSize(9).setTextColor(MUTED).text(d.label, refX, refY);
    doc.setTextColor(d.value ? INK : MUTED).text(d.value || 'Not set', right, refY, { align: 'right' });
  });
  y = Math.max(leftY, refY) + 9;

  // Items.
  const priced = sheet.lines.some((l) => l.price !== undefined);
  const loadLines = sheet.lineColumns === 'load';
  const head = [loadLines ? ['#', 'Item Code', 'Name', 'UOM', 'Approved Quantity', 'Requested Quantity'] : ['#', 'Item', 'UOM', 'Qty', ...(priced ? ['Price', 'Discount', 'Tax', 'Total'] : [])]];
  const body = sheet.lines.map((l, i) =>
    loadLines
      ? [String(i + 1), l.code ?? '—', l.name ?? 'Unknown item', l.uom ?? '—', String(l.quantity), String(l.requestedQty ?? 0)]
      : [
          String(i + 1),
          [`${l.name ?? 'Unknown item'}${l.free ? '  (FREE)' : ''}`, l.code, l.detail].filter(Boolean).join('\n'),
          l.uom ?? '—',
          String(l.quantity),
          ...(priced ? [amount(l.price), amount(l.discount), `${amount(l.tax)}${l.taxRate ? `\n${l.taxRate}` : ''}`, amount(l.total)] : []),
        ],
  );
  autoTable(doc, {
    startY: y,
    head,
    body: body.length > 0 ? body : [loadLines ? ['', 'No items', '', '', '', ''] : ['', 'No items', '', '', ...(priced ? ['', '', '', ''] : [])]],
    margin: { left: MARGIN, right: MARGIN },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2, textColor: INK, lineColor: 225, lineWidth: 0.1, valign: 'top' },
    headStyles: { fillColor: [245, 246, 248], textColor: MUTED, fontStyle: 'normal', fontSize: 7.5 },
    columnStyles: { 0: { cellWidth: 8, textColor: MUTED }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index >= 3) data.cell.styles.halign = 'right';
    },
    didDrawPage: (data) => {
      y = data.cursor?.y ?? y;
    },
  });
  y += 8;

  // Summary, right-aligned under the table.
  if (sheet.summary) {
    const s = sheet.summary;
    const rows: [string, string][] = [
      ['Gross', amount(s.gross)],
      ['Discount', `- ${amount(s.discount)}`],
      ['Net', amount(s.net)],
      ...(s.excise > 0 ? [['Excise', `+ ${amount(s.excise)}`] as [string, string]] : []),
      ...s.taxes.map((t) => [t.label, `+ ${amount(t.amount)}`] as [string, string]),
    ];
    if (y + rows.length * 5 + 16 > 287) {
      doc.addPage();
      y = MARGIN + 4;
    }
    const labelX = right - 70;
    doc.setFont('helvetica', 'normal').setFontSize(9);
    rows.forEach(([label, value]) => {
      doc.setTextColor(MUTED).text(label, labelX, y);
      doc.setTextColor(INK).text(value, right, y, { align: 'right' });
      y += 5;
    });
    doc.setDrawColor(200).setLineDashPattern([1, 1], 0).line(labelX, y - 1.5, right, y - 1.5).setLineDashPattern([], 0);
    y += 5;
    doc.setFontSize(8).setTextColor(MUTED).text(`GRAND TOTAL${ctx.currency ? ` · ${ctx.currency}` : ''}`, labelX, y);
    doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(INK).text(amount(s.grand), right, y + 1, { align: 'right' });
    y += 10;
  }

  // Notes.
  if (sheet.notes) {
    const lines = doc.setFont('helvetica', 'normal').setFontSize(9).splitTextToSize(sheet.notes, right - MARGIN) as string[];
    if (y + lines.length * 4.5 + 8 > 287) {
      doc.addPage();
      y = MARGIN + 4;
    }
    doc.setFontSize(8).setTextColor(MUTED).text('NOTES', MARGIN, y);
    doc.setFontSize(9).setTextColor(INK).text(lines, MARGIN, y + 5);
  }

  // Footer on every page.
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(MUTED);
    doc.text(`${sheet.kind} ${sheet.number} · generated ${new Date().toLocaleString('en-GB')}`, MARGIN, 290);
    doc.text(`Page ${page} of ${pages}`, right, 290, { align: 'right' });
  }

  return doc;
}

/** Downloads the document as "<number>.pdf". */
export async function downloadSheetPdf(sheet: DocumentSheet, ctx: PdfContext) {
  (await buildSheetPdf(sheet, ctx)).save(`${sheet.number}.pdf`);
}

/** Opens the browser's print dialog for the same PDF, via a hidden frame so the page itself isn't printed. */
export async function printSheetPdf(sheet: DocumentSheet, ctx: PdfContext) {
  const doc = await buildSheetPdf(sheet, ctx);
  const url = URL.createObjectURL(doc.output('blob'));
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  frame.src = url;
  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      // Browsers that can't print a PDF frame (Safari) get it in a new tab to print from there.
      window.open(url, '_blank');
    }
    setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
    }, 60_000);
  };
  document.body.appendChild(frame);
}
