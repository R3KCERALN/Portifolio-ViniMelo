# Andamento

Protocolo: `docs/superpowers/orchestration.md`

- [x] Spec e plano aprovados (2026-10-30)
- [x] Task 1 — Base de testes, dados, WhatsApp — commit 9bbb5c0 — aguardando revisão
  - Ruling: `formatBRL` do plano (min 0 / max 2 casas) devolvia "R$ 32,5" e espaço U+00A0; usei 0 casas para inteiros, 2 para os demais e espaço comum, para bater com a spec ("R$ 32,50"). Custo se errado: um ajuste em format.ts.
  - Ruling: `site.processIntro` junta os dois primeiros parágrafos da spec ("Meu processo..." e "Cada bloco passa pelas mesmas etapas:") separados por "\n\n", já que o tipo é string.
