import { test } from 'node:test';
import assert from 'node:assert/strict';
import { potOdds, potRatio, formatRatio, equity, expectedValue, analyze } from '../calc.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !== ${b}`);

test('equity: regra do 4 no flop', () => close(equity(9, 'flop'), 0.36));
test('equity: regra do 2 no turn', () => close(equity(9, 'turn'), 0.18));
test('equity: limita a 100%', () => close(equity(30, 'flop'), 1));
test('equity: zero outs', () => close(equity(0, 'turn'), 0));
test('equity: entradas inválidas', () => {
  assert.equal(equity(-1, 'flop'), null);
  assert.equal(equity(NaN, 'flop'), null);
  assert.equal(equity(4, 'river'), null);
});

test('potOdds: 300 / 100 = 25%', () => close(potOdds(300, 100), 0.25));
test('potOdds: inválidos', () => {
  assert.equal(potOdds(-1, 100), null);
  assert.equal(potOdds(0, 0), null);
  assert.equal(potOdds(NaN, 10), null);
});

test('potRatio + formatRatio', () => {
  close(potRatio(300, 100), 3);
  assert.equal(formatRatio(potRatio(300, 100)), '3 : 1');
  assert.equal(formatRatio(potRatio(250, 100)), '2.5 : 1');
  assert.equal(formatRatio(potRatio(100, 30)), '3.3 : 1');
  assert.equal(potRatio(300, 0), null);
  assert.equal(formatRatio(null), '—');
});

test('expectedValue: 300 / 100 / 36% = +44', () => close(expectedValue(300, 100, 0.36), 44));
test('expectedValue: negativo', () => close(expectedValue(100, 100, 0.18), 0.18 * 100 - 0.82 * 100));
test('expectedValue: inválidos', () => assert.equal(expectedValue(-5, 100, 0.3), null));

test('analyze: call lucrativo', () => {
  const r = analyze({ pot: 300, call: 100, outs: 9, street: 'flop' });
  close(r.potOdds, 0.25); close(r.ratio, 3); close(r.equity, 0.36); close(r.ev, 44);
  assert.equal(r.verdict, 'call');
});
test('analyze: fold', () => {
  assert.equal(analyze({ pot: 100, call: 100, outs: 4, street: 'turn' }).verdict, 'fold');
});
test('analyze: check grátis', () => {
  assert.equal(analyze({ pot: 100, call: 0, outs: 4, street: 'turn' }).verdict, 'free');
});
test('analyze: dados incompletos', () => {
  const r = analyze({ pot: NaN, call: 100, outs: 9, street: 'flop' });
  assert.equal(r.verdict, null);
  assert.equal(r.ev, null);
});
