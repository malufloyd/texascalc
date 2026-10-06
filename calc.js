// Matemática do poker — funções puras, sem DOM.
// Convenção: "pot" é o pote atual já incluindo a aposta do adversário;
// "call" é o valor que o jogador precisa pagar.

const isAmount = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;

const MULTIPLIER = { flop: 0.04, turn: 0.02 };

/** Fração do pote final que o call representa: call / (pote + call). */
export function potOdds(pot, call) {
  if (!isAmount(pot) || !isAmount(call) || pot + call === 0) return null;
  return call / (pot + call);
}

/** Quanto o pote paga para cada 1 de call (pote : call). */
export function potRatio(pot, call) {
  if (!isAmount(pot) || !isAmount(call) || call === 0) return null;
  return pot / call;
}

export function formatRatio(ratio) {
  if (ratio === null || !Number.isFinite(ratio)) return '—';
  return `${Number(ratio.toFixed(1))} : 1`;
}

/** Regra do 4 (flop) e do 2 (turn), limitada a 100%. */
export function equity(outs, street) {
  if (!isAmount(outs) || !(street in MULTIPLIER)) return null;
  return Math.min(1, outs * MULTIPLIER[street]);
}

/** EV do call: ganha o pote com a equidade, perde o call no resto. */
export function expectedValue(pot, call, eq) {
  if (!isAmount(pot) || !isAmount(call) || typeof eq !== 'number' || eq < 0 || eq > 1) return null;
  return eq * pot - (1 - eq) * call;
}

export function analyze({ pot, call, outs, street }) {
  const odds = potOdds(pot, call);
  const eq = equity(outs, street);
  const ev = eq === null ? null : expectedValue(pot, call, eq);

  let verdict = null;
  if (odds !== null && eq !== null) {
    if (call === 0) verdict = 'free';
    else verdict = eq >= odds ? 'call' : 'fold';
  }

  return { potOdds: odds, ratio: potRatio(pot, call), equity: eq, ev, verdict };
}
