# TexasCalc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PWA dark para celular que calcula Pot Odds, Equidade (Regra do 4 e 2) e EV do call.

**Architecture:** Módulo puro `calc.js` (matemática, testado com node:test) consumido por `app.js` (DOM, recálculo ao vivo). Arquivos estáticos + `manifest.json` + `sw.js` para instalação/offline.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node 26 `node --test`. Sem dependências.

## Global Constraints
- Sem build, sem dependências npm; fontes apenas via Google Fonts.
- Pote atual inclui a aposta do adversário. Pot odds = call / (pote + call). Proporção = pote : call.
- Equidade: Flop = outs × 4%, Turn = outs × 2%, máx. 100%. Outs inteiro 0–20.
- EV = eq × pote − (1 − eq) × call.
- Entradas inválidas → "—"; nunca lançar erro.
- Textos da interface em português do Brasil.

---

### Task 1: Módulo de cálculo (`calc.js`)

**Files:** Create `calc.js`, `tests/calc.test.js`, `package.json` (`"type":"module"`, script `test`).

**Interfaces — Produces:**
- `potOdds(pot: number, call: number): number|null` — fração 0–1.
- `potRatio(pot: number, call: number): number|null` — pote/call.
- `formatRatio(r: number|null): string` — `"3 : 1"`, `"2.5 : 1"`, `"—"`.
- `equity(outs: number, street: 'flop'|'turn'): number|null` — fração 0–1.
- `expectedValue(pot: number, call: number, eq: number): number|null`.
- `analyze({pot, call, outs, street}): {potOdds, ratio, equity, ev, verdict: 'call'|'fold'|'free'|null}`.

- [ ] Step 1: escrever testes (36%/18%/clamp 100%; 300/100 → 0.25 e "3 : 1"; EV 300/100/0.36 → 44; inválidos → null; call 0 → verdict 'free').
- [ ] Step 2: `npm test` → FAIL (módulo inexistente).
- [ ] Step 3: implementar `calc.js`.
- [ ] Step 4: `npm test` → PASS.

### Task 2: Interface (`index.html`, `styles.css`, `app.js`)
- Seletor Flop/Turn, campos Pote e Call (`inputmode="decimal"`), outs com −/+ (0–20), chips de draws (Flush 9, Seq. aberta 8, Gutshot 4, Flush+Seq. 15, Par→Trinca 2).
- Cards de resultado: Pot Odds (% + proporção), Equidade (%), EV (fichas, verde/vermelho), veredito em destaque.
- `app.js` lê entradas em todo `input`/clique, chama `analyze`, renderiza.
- Verificar: abrir no navegador em 390×844, preencher 300/100/9 outs/Flop → 25%, 3 : 1, 36%, +44, CALL.

### Task 3: PWA (`manifest.json`, `sw.js`, `icon.svg`)
- Manifest com `display: standalone`, `theme_color`/`background_color` escuros, ícone SVG.
- Service worker cache-first dos arquivos estáticos; registro em `app.js`.
- Verificar: servir via `python3 -m http.server`, sem erros no console.
