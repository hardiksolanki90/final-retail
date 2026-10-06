// Runnable self-check: npx esbuild scripts/checks/documentMath.check.ts --bundle --platform=node --log-level=warning | node
import assert from 'node:assert/strict';
import { roundMoney } from '../../src/utils/money';
import { computeLine, sumLines } from '../../src/utils/documentMath';

// roundMoney edge cases
assert.equal(roundMoney(1.005, 2), 1.01);
assert.equal(roundMoney(2.675, 2), 2.68);
assert.equal(roundMoney(1.0005, 3), 1.001);
assert.equal(roundMoney(1234.5, 0), 1235);
assert.equal(roundMoney(0.1 + 0.2, 2), 0.3);
assert.equal(roundMoney(-1.005, 2), -1.01);
assert.equal(roundMoney(1e-7, 2), 0);
assert.equal(roundMoney(Number.NaN, 2), 0);

// Same cases as the backend test (LineTaxService): qty 3 × price 10
const line = { quantity: 3, price: 10, discount: 0 };
assert.deepEqual(computeLine(line, 2, { rate: 5, exciseRate: 0 }), { gross: 30, discount: 0, net: 30, excise: 0, tax: 1.5, total: 31.5 });
// excise on net, then tax on net + excise
assert.deepEqual(computeLine(line, 2, { rate: 5, exciseRate: 10 }), { gross: 30, discount: 0, net: 30, excise: 3, tax: 1.65, total: 34.65 });
// no rates (exempt / unresolved) and no rate configured
assert.deepEqual(computeLine(line, 2, { rate: null, exciseRate: 0 }), { gross: 30, discount: 0, net: 30, excise: 0, tax: 0, total: 30 });
assert.deepEqual(computeLine(line, 2), { gross: 30, discount: 0, net: 30, excise: 0, tax: 0, total: 30 });
// 0% is a real rate (zero-rated), not "missing"
assert.equal(computeLine(line, 2, { rate: 0, exciseRate: 0 }).tax, 0);

// 3-decimal currency (KWD): components rounded per line, header = sum of rounded lines
const kwd = [computeLine({ quantity: 3, price: 0.3335, discount: 0.0004 }, 3, { rate: 5, exciseRate: 0 }), computeLine({ quantity: '2', price: '1.1115' }, 3, { rate: 5, exciseRate: 0.1 })];
assert.deepEqual(kwd[0], { gross: 1.001, discount: 0, net: 1.001, excise: 0, tax: 0.05, total: 1.051 });
assert.deepEqual(kwd[1], { gross: 2.223, discount: 0, net: 2.223, excise: 0.002, tax: 0.111, total: 2.336 });
const t = sumLines(kwd, 3);
assert.deepEqual(t, { gross: 3.224, discount: 0, net: 3.224, excise: 0.002, tax: 0.161, total: 3.387 });
assert.equal(t.total, roundMoney(kwd[0].total + kwd[1].total, 3));

// many tiny lines: header equals the sum of displayed line totals
const many = Array.from({ length: 7 }, () => computeLine({ quantity: 1, price: 0.335 }, 2));
assert.equal(many[0].total, 0.34);
assert.equal(sumLines(many, 2).total, 2.38);

// 0-decimal currency and blank input
assert.deepEqual(computeLine({ quantity: 3, price: 33.5 }, 0), { gross: 101, discount: 0, net: 101, excise: 0, tax: 0, total: 101 });
assert.deepEqual(computeLine(undefined, 2), { gross: 0, discount: 0, net: 0, excise: 0, tax: 0, total: 0 });

console.log('documentMath checks passed');
