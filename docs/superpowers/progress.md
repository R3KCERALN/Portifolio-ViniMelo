# Andamento

Protocolo: `docs/superpowers/orchestration.md`

- [x] Spec e plano aprovados (2026-10-30)
- [x] Task 1 — Base de testes, dados, WhatsApp — commit 9bbb5c0 — aguardando revisão
  - Ruling: `formatBRL` do plano (min 0 / max 2 casas) devolvia "R$ 32,5" e espaço U+00A0; usei 0 casas para inteiros, 2 para os demais e espaço comum, para bater com a spec ("R$ 32,50"). Custo se errado: um ajuste em format.ts.
  - Ruling: `site.processIntro` junta os dois primeiros parágrafos da spec ("Meu processo..." e "Cada bloco passa pelas mesmas etapas:") separados por "\n\n", já que o tipo é string.
- [x] Task 3 — Matemática da timeline — commit 2baa8c2 — aguardando revisão
  - Ruling: a fórmula do plano `(scrollY + vh/2) / docHeight` dá 0,95 na rolagem máxima, contradizendo o teste do próprio plano (`scrollProgress(7200, 800, 8000)` = 1). Mantive os dois testes e fiz a âncora ir de vh/2 (topo) a vh (fim da página); assim a agulha chega ao fim da régua. Custo se errado: ajuste de uma linha em timeline.ts.
- [x] Task 4 — Layout, tema, abertura, botão, rodapé — commit c8ea113 — aguardando revisão
  - Verificado em 1440 px e 375 px (Chrome headless via CDP): sem rolagem horizontal, foto e texto legíveis, botão 44 px. A extensão do Chrome não conectou, por isso a captura foi pelo CDP.
  - Ruling: `og:image` sai como caminho relativo enquanto `site` não estiver em `astro.config.mjs`; vira URL absoluta quando o domínio da Vercel for definido (Task 10 deve lembrar disso). Custo se errado: prévia de link sem imagem.
  - Risco para a revisão/Task 5: a 375 px o botão "Conversar" é fixo e passa por cima do texto durante a rolagem; conferir com a timeline pronta.
