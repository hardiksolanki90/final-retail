/** Round half away from zero to `digits` places; exponent shift avoids float errors like 1.005 → 1.00. */
export function roundMoney(value: number, digits: number): number {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  // Values already in exponent form (e.g. 1e-7) can't take the string shift.
  const rounded = String(abs).includes('e') ? Math.round(abs * 10 ** digits) / 10 ** digits : Number(`${Math.round(Number(`${abs}e${digits}`))}e-${digits}`);
  return Math.sign(n) * rounded;
}
