# Revisão — Task 3

Veredito: **aprovada com ressalvas**

Commit revisado: `2baa8c25f4910c5b8c23d0b3b3c94231b6d71930`.
Escopo: matemática de progresso, timecode e geometria dos clipes.
Modelo atual mantido conforme autorização do usuário nesta sessão.

Rastreabilidade: a sessão implementadora incorporou este parecer e a mudança de status da Task 3 no commit `2a0043b` durante o trabalho concorrente. O histórico foi preservado; o commit `docs: review task 3` registra esta nota e o vínculo do parecer no andamento, sem mudanças de código.

## Achados

1. **Sugestão — atualizar o contrato documental da âncora de rolagem.** Referência: `docs/superpowers/plans/2026-10-30-portfolio-timeline.md:175` no commit revisado, comparada a `src/lib/timeline.ts:14`. O comentário da interface ainda define a âncora como o centro fixo da viewport. Essa fórmula retornaria `0,95` em `(7200, 800, 8000)`, contrariando o resultado `1` exigido pelo próprio plano. A implementação resolve a contradição deslocando a âncora do centro até a base da viewport. Por exemplo, `(3600, 800, 8000)` retorna `0,525`, em vez de `0,5` da fórmula documentada. A spec deixa a conversão da rolagem a critério da implementação, e o ajuste respeita os exemplos exigidos. Correção sugerida: documentar no plano a âncora móvel e seus limites para evitar que uma manutenção restaure a fórmula antiga. Não requer bloquear o código.

Nenhum achado bloqueante de código identificado. A divergência de coautoria já registrada em `task-01.md` também aparece neste commit; permanece uma observação documental compartilhada, sem duplicação do achado.

## Conferência do contrato

- Constantes de 60 segundos e 30 fps e interfaces exportadas correspondem ao plano.
- `scrollProgress` retorna valores limitados a `[0, 1]`, é monotônico para dimensões válidas e retorna zero quando a altura do documento não é positiva. Em documentos com rolagem, chega a `1` no fim e mantém a âncora dentro da viewport.
- `progressToTimecode` limita o progresso, usa `Math.floor` sobre os frames e formata horas, minutos, segundos e frames. A parametrização de duração e fps também foi conferida.
- `computeClips` preserva IDs e ordem e converte posição e altura para percentuais; retorna lista vazia sem seções ou com altura de documento não positiva.
- Os exemplos de teste exigidos pelo plano estão preservados. Não há novas dependências nem acesso a dados externos.

## Validação

Comandos executados em uma cópia isolada obtida com `git archive 2baa8c2`, usando o `node_modules` instalado no projeto por link simbólico. Código e alterações concorrentes do checkout não foram modificados.

- `npm test`: **PASS**, 3 arquivos e 10 testes, Vitest 5.0.5, saída 0.
- `npm run build`: **PASS**, `1 page(s) built`, saída 0.
- Verificação adicional por Node, sem arquivos de teste novos: **PASS**, 505 amostras de progresso em cinco combinações de documento/viewport, incluindo documentos sem rolagem; limites negativos/excedentes, geometria com altura inválida e timecode com duração de uma hora e fps 24. Nenhuma falha de monotonicidade, faixa ou posicionamento da âncora nos casos com rolagem.
- `engineering:code-review`: conferência do diff contra Task 3, Global Constraints e spec.
- `no-ai-slop`, modo detectar: nenhum novo texto de produto neste commit. Os comentários explicativos foram lidos, sem padrões a sinalizar; nenhum texto reescrito.
- `ui-ux-pro-max` e conferência em 1440/375 px: não aplicáveis ao commit, que contém funções puras e não altera telas. A integração visual pertence à Task 5.

Esta validação cobre o commit da Task 3. Não comprova a integração da timeline com o DOM, o site atual completo nem a etapa RED histórica do TDD.
