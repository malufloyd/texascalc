import { analyze, formatRatio } from './calc.js';

const MAX_OUTS = 20;
const $ = (sel) => document.querySelector(sel);

const state = { street: 'flop', outs: 0 };

const el = {
  segmented: $('.segmented'),
  streetBtns: document.querySelectorAll('[data-street]'),
  pot: $('#pot'),
  call: $('#call'),
  outs: $('#outs'),
  chips: document.querySelectorAll('.chip'),
  result: $('#result'),
  verdict: $('#verdict'),
  ev: $('#ev'),
  odds: $('#odds'),
  ratio: $('#ratio'),
  equity: $('#equity'),
  equitySub: $('#equity-sub'),
  meterFill: $('#meter-fill'),
  meterMark: $('#meter-mark'),
  note: $('#note'),
};

const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
const chips = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** Aceita "1.250,50", "1250.5" e "1250,5"; vazio vira NaN. */
function parseAmount(raw) {
  const s = raw.trim().replace(/\s/g, '');
  if (s === '') return NaN;
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  return /^\d*\.?\d+$/.test(normalized) || /^\d+\.$/.test(normalized) ? Number(normalized) : NaN;
}

const signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + chips.format(Math.abs(n));

const VERDICT_TEXT = { call: 'CALL', fold: 'FOLD', free: 'CHECK GRÁTIS' };

function render() {
  const pot = parseAmount(el.pot.value);
  const call = parseAmount(el.call.value);
  const r = analyze({ pot, call, outs: state.outs, street: state.street });

  el.outs.value = state.outs;
  el.equitySub.textContent = `${state.outs} outs × ${state.street === 'flop' ? 4 : 2}`;
  el.equity.textContent = r.equity === null ? '—' : pct.format(r.equity);
  el.odds.textContent = r.potOdds === null ? '—' : pct.format(r.potOdds);
  el.ratio.textContent = r.ratio === null ? '—' : formatRatio(r.ratio);
  el.ev.textContent = r.ev === null ? '—' : signed(r.ev);

  el.result.dataset.verdict = r.verdict ?? 'none';
  el.verdict.textContent = VERDICT_TEXT[r.verdict] ?? 'Preencha a mão';

  el.meterFill.style.width = `${(r.equity ?? 0) * 100}%`;
  el.meterMark.style.left = `calc(${(r.potOdds ?? 0) * 100}% - 1px)`;
  el.meterMark.style.opacity = r.potOdds === null || call === 0 ? 0 : 1;

  el.note.textContent = noteFor(r, call);

  el.chips.forEach((c) => c.setAttribute('aria-pressed', String(Number(c.dataset.outs) === state.outs)));
}

function noteFor(r, call) {
  if (r.verdict === null) return 'Informe o pote, o call e seus outs.';
  if (r.verdict === 'free') return 'Não há aposta a pagar: veja a próxima carta de graça.';
  const need = pct.format(r.potOdds);
  const have = pct.format(r.equity);
  const per100 = signed((r.ev / call) * 100);
  return r.verdict === 'call'
    ? `Sua equidade (${have}) cobre os ${need} que o pote exige. Lucro esperado de ${per100} a cada 100 pagos.`
    : `Você precisa de ${need} de equidade e tem ${have}. Prejuízo esperado de ${per100} a cada 100 pagos.`;
}

function setStreet(street) {
  state.street = street;
  el.segmented.dataset.street = street;
  el.streetBtns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.street === street)));
  render();
}

function setOuts(n) {
  state.outs = Math.max(0, Math.min(MAX_OUTS, n));
  render();
}

el.streetBtns.forEach((b) => b.addEventListener('click', () => setStreet(b.dataset.street)));
document.querySelectorAll('[data-step]').forEach((b) =>
  b.addEventListener('click', () => setOuts(state.outs + Number(b.dataset.step))));
el.chips.forEach((c) => c.addEventListener('click', () => setOuts(Number(c.dataset.outs))));
[el.pot, el.call].forEach((input) => input.addEventListener('input', render));

$('#reset').addEventListener('click', () => {
  el.pot.value = '';
  el.call.value = '';
  state.outs = 0;
  setStreet('flop');
});

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Ajuda: cada "?" abre a gaveta com o conteúdo do <template id="help-…">.
const help = {
  dialog: $('#help'),
  title: $('#help-title'),
  body: $('#help-body'),
};

document.querySelectorAll('[data-help]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const tpl = document.getElementById(`help-${btn.dataset.help}`);
    help.title.textContent = tpl.dataset.title;
    help.body.replaceChildren(tpl.content.cloneNode(true));
    help.dialog.showModal();
    help.dialog.scrollTop = 0;
  }));

$('#help-close').addEventListener('click', () => help.dialog.close());
// Toque fora da gaveta (no fundo escurecido) fecha.
help.dialog.addEventListener('click', (e) => {
  if (e.target === help.dialog) {
    const r = help.dialog.getBoundingClientRect();
    if (e.clientY < r.top) help.dialog.close();
  }
});
