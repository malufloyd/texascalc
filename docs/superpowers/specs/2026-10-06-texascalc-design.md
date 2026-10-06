# TexasCalc — Calculadora de Texas Hold'em (PWA) — Design

## Objetivo
Web app instalável (PWA) para celular, visual moderno e dark, que calcula Pot Odds, Equidade (Regra do 4 e 2) e EV de um call.

## Stack
HTML + CSS + JavaScript puro (ES modules), sem build, sem dependências. `manifest.json` + service worker para offline e "Adicionar à tela inicial". Testes com `node --test`.

## Entradas
- **Rua:** Flop ou Turn (seletor segmentado).
- **Pote atual:** valor no meio, já incluindo a aposta do adversário (≥ 0).
- **Aposta a pagar (call):** valor do call (≥ 0).
- **Outs:** inteiro 0–20, ajustado por botões −/+ ou atalhos.
- **Atalhos de draws:** Flush 9, Sequência aberta 8, Gutshot 4, Flush + Sequência 15, Par → Trinca 2.

## Regras de cálculo (`calc.js`, funções puras)
- `potOdds(pot, call)` → `call / (pot + call)` (fração 0–1). `null` se entradas inválidas ou pot + call = 0.
- `potRatio(pot, call)` → `pot / call` exibido como `X : 1` (1 casa decimal, sem ".0"). `null` se call = 0.
- `equity(outs, street)` → `outs × 4%` no Flop, `outs × 2%` no Turn, limitado a 100%.
- `expectedValue(pot, call, eq)` → `eq × pot − (1 − eq) × call`.
- Veredito: `CALL` se equidade ≥ pot odds, senão `FOLD`. Com call = 0: "Check grátis".

## Interface
Tela única, recálculo ao vivo. Fundo quase preto com tom verde-feltro sutil, cards com efeito de vidro, fonte Space Grotesk/Inter, números grandes. Verde neon para +EV/CALL, vermelho para −EV/FOLD. Campos numéricos com `inputmode="decimal"`. Layout para uso com uma mão, largura de celular, sem scroll horizontal.

## Erros
Entradas vazias, negativas ou não numéricas → resultados exibem "—"; o app nunca quebra.

## Testes
- 9 outs no Flop = 36%; 9 outs no Turn = 18%; 30 outs no Flop limita a 100%.
- Pote 300 / call 100 → 25% e "3 : 1".
- EV com pote 300, call 100, equidade 36% → 0,36×300 − 0,64×100 = 44.
- Entradas inválidas → `null`.
- Verificação visual no navegador em tamanho de celular.
