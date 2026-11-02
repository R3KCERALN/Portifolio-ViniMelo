# Orquestração do desenvolvimento

Plano: `docs/superpowers/plans/2026-10-30-portfolio-timeline.md`
Spec: `docs/superpowers/specs/2026-10-30-portfolio-timeline-design.md`
Andamento: `docs/superpowers/progress.md`
Revisões: `docs/superpowers/reviews/`

## Papéis

- **Orquestradora** (sessão original): coordena, responde dúvidas de escopo, não implementa.
- **Implementadora** (uma sessão): executa as tarefas do plano, uma por vez, na ordem abaixo, sem parar entre elas, exceto para pedir troca de modelo/esforço.
- **Revisora** (uma sessão): revisa cada tarefa concluída e registra o resultado. Não edita código.

Uma implementadora só: todas as tarefas de 4 a 9 mexem em `src/pages/index.astro`, então duas em paralelo gerariam conflito e retrabalho.

## Ordem de execução e modelo por tarefa

A ordem agrupa tarefas de mesmo modelo/esforço para trocar o mínimo possível. Todas as dependências do plano são respeitadas.

| Ordem | Tarefa do plano | Modelo / esforço | Motivo |
|---|---|---|---|
| 1 | Task 1 — base de testes, dados, WhatsApp | Sonnet 5.5, médio | dados e funções simples |
| 2 | Task 3 — matemática da timeline | Sonnet 5.5, médio | funções puras com testes prontos |
| 3 | Task 4 — layout, tema, abertura, botão, rodapé | Sonnet 5.5, médio | tela e CSS |
| 4 | Task 2 — vídeos do Google Drive | Sonnet 5.5, alto | integração externa; erro aqui esvazia o portfólio |
| 5 | Task 5 — timeline fixa | Sonnet 5.5, alto | interação central, desktop e celular |
| 6 | Task 6 — portfólio | Sonnet 5.5, alto | junta Drive, player e timeline |
| 7 | Task 7 — processo criativo | Sonnet 5.5, médio | tela com animação simples |
| 8 | Task 8 — preços e pacotes | Sonnet 5.5, médio | tela que usa dados prontos, sem transação |
| 9 | Task 9 — logos | Sonnet 5.5, médio | tela e imagens |
| 10 | Task 10 — publicação diária e revisão final | Sonnet 5.5, médio | workflow e guia |
| 11 | Task 11 — redesign visual (ilha de edição) | Sonnet 5.5, alto | refaz o visual de todas as seções, com responsivo e animação |
| 12 | Task 12 — redesign pelas referências do Allan | Sonnet 5.5, alto | refaz o visual de novo, com carrossel, menu e timeline interativa (play e arrastar) |

Revisora: **Sonnet 5.5, médio** para cada tarefa. Revisão final da branch inteira (uma vez, depois da Task 12): **Opus 5.5, alto**.

## Regra de modelo e esforço (as duas sessões)

Antes de começar cada tarefa, compare o modelo/esforço atual da sessão com a tabela.
- Se for igual, siga sem perguntar.
- Se for diferente, pare e peça ao usuário, numa linha: **"Troque para <modelo>, esforço <nível> (`/model`), para a Task N — <motivo>."** Espere a confirmação.
- Se, durante a tarefa, aparecer algo que a tabela não previu (bug que o modelo atual não resolve em duas tentativas, decisão de segurança), pare e peça a troca para o modelo indicado pelo critério do `~/.claude/CLAUDE.md`, dizendo por quê.
- Nunca use um modelo mais caro "por garantia".

## Skills

Liberadas pelo usuário para este projeto:
- `superpowers:executing-plans` (implementadora) e demais `superpowers:*` conforme o próprio plugin.
- `ui-ux-pro-max:ui-ux-pro-max`: implementadora nas Tasks 4 a 9, antes de montar cada tela (acessibilidade, contraste, toque, responsividade, animação). Revisora em toda tarefa com interface.
- `no-ai-slop`: para **texto novo** que não veio da spec, como títulos de seção, rótulos, `alt`, mensagens de erro, README e mensagens de WhatsApp. A revisora usa o modo "detectar".

**Os textos marcados como "aprovado" na spec são copiados literalmente. Não passe o no-ai-slop neles.**

## Protocolo da implementadora

Para cada tarefa, na ordem da tabela:
1. Leia `docs/superpowers/reviews/` e corrija primeiro qualquer achado **bloqueante** ainda aberto. Commit `fix: ...` e marque o achado como resolvido no arquivo da revisão.
2. Aplique a regra de modelo/esforço.
3. Execute a tarefa exatamente como no plano (TDD, verificações, commit), usando as skills acima.
4. Marque os checkboxes da tarefa no plano e acrescente uma linha em `progress.md`:
   `- [x] Task N — <título> — commit <hash curto> — aguardando revisão`
5. Siga para a próxima tarefa sem pedir confirmação.

Pare e pergunte ao usuário somente para: trocar modelo/esforço; algo que contradiz a spec; uma credencial que só ele tem (chave do Google, Vercel). Ao terminar a Task 12, avise que a revisão final pode começar.

Nunca faça `git push` nem crie contas ou chaves por conta própria.

## Protocolo da revisora

1. Leia `progress.md` e pegue a tarefa mais antiga com "aguardando revisão".
2. Aplique a regra de modelo/esforço (Sonnet 5.5, médio).
3. Revise o commit da tarefa (`git show <hash>`) contra a tarefa do plano, as Global Constraints e a spec. Rode `npm test` e `npm run build`. Nas tarefas com tela, rode `ui-ux-pro-max` em modo revisão e confira 1440 px e 375 px. Em texto novo, rode `no-ai-slop` em modo detectar.
4. Escreva `docs/superpowers/reviews/task-NN.md` com:
   - um veredito: `aprovada`, `aprovada com ressalvas` ou `bloqueada`;
   - os achados numerados, cada um com o arquivo:linha, o problema, a correção sugerida e a gravidade (`bloqueante` ou `sugestão`).
5. Atualize a linha da tarefa em `progress.md` para `revisada: <veredito>` e faça um commit apenas com esses dois arquivos (`docs: review task N`).
6. Se não houver tarefa aguardando, diga isso e pare.
7. Depois da Task 12, peça para trocar para Opus 5.5, esforço alto, e faça a revisão final da branch inteira em `reviews/final.md`.

**Redesign (Tasks 11 e 12):** nas revisões pendentes das Tasks 4, 6, 7, 8, 9 e 11, confira lógica, testes, acessibilidade e textos, mas não registre achados de aparência (cor, fonte, layout), porque a Task 12 refaz o visual. A conferência visual com `ui-ux-pro-max` em 1440/375 px fica para a revisão da Task 12, que substitui o visual da 11.

A revisora não edita código. Se um achado for de escopo (spec ambígua), ela registra como `pergunta para o usuário`.
