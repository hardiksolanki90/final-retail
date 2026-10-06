// Document line/total math shared by the Order, Delivery, Invoice, Credit Note
// and Debit Note forms. Mirrors the backend (ResolvesDocumentRelations::
// computePricedLine + LineTaxService + sumLineTotals): every component is rounded
// to the currency's decimals, then the rounded lines are summed — so header totals
// always equal the lines shown and match what the server stores.
//
//   net    = qty × price − discount
//   excise = net × excise%            tax = Σ (net + excise) × component rate%
//   total  = net + excise + tax
//
// A tax with several parts (India CGST + SGST, Canada GST + PST) is rounded per
// part, then added — each part is its own figure on the invoice.

import { roundMoney } from './money';

export interface LineInput {
  quantity?: number | string | null;
  price?: number | string | null;
  discount?: number | string | null;
}

/** One part of an item's main tax, e.g. CGST 9 (POST /tax/resolve). */
export interface TaxComponent {
  code: string;
  name: string;
  rate: number;
}

/** Rates the server resolved for an item (POST /tax/resolve). */
export interface LineRates {
  /** Main tax percent (VAT/GST…, all parts added); null = none configured. */
  rate: number | null;
  /** The parts of the main tax. Without them, `rate` is one part. */
  components?: TaxComponent[];
  exciseRate: number;
}

export interface LineAmounts {
  gross: number;
  discount: number;
  net: number;
  excise: number;
  tax: number;
  total: number;
}

const num = (v: number | string | null | undefined) => Number(v) || 0;

/** Tax amount of each part of the main tax on a line's taxable base (net + excise). */
export function lineTaxes(base: number, rates: LineRates | null | undefined, digits: number): { code: string; amount: number }[] {
  if (rates?.components?.length) {
    return rates.components.map((c) => ({ code: c.code, amount: roundMoney((base * c.rate) / 100, digits) }));
  }
  return rates?.rate != null ? [{ code: '', amount: roundMoney((base * rates.rate) / 100, digits) }] : [];
}

export function computeLine(item: LineInput | undefined, digits: number, rates?: LineRates | null): LineAmounts {
  const gross = roundMoney(num(item?.quantity) * num(item?.price), digits);
  const discount = roundMoney(num(item?.discount), digits);
  const net = roundMoney(gross - discount, digits);
  const excise = rates && rates.exciseRate > 0 ? roundMoney((net * rates.exciseRate) / 100, digits) : 0;
  const tax = roundMoney(
    lineTaxes(roundMoney(net + excise, digits), rates, digits).reduce((sum, t) => sum + t.amount, 0),
    digits
  );
  const total = roundMoney(net + excise + tax, digits);
  return { gross, discount, net, excise, tax, total };
}

export function sumLines(lines: LineAmounts[], digits: number): LineAmounts {
  const sum = (key: keyof LineAmounts) =>
    roundMoney(
      lines.reduce((acc, line) => acc + line[key], 0),
      digits
    );
  return { gross: sum('gross'), discount: sum('discount'), net: sum('net'), excise: sum('excise'), tax: sum('tax'), total: sum('total') };
}
