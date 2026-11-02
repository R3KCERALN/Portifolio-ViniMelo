# Andamento

Protocolo: `docs/superpowers/orchestration.md`

- [x] Spec e plano aprovados (2026-10-30)
- [x] Task 1 — Base de testes, dados, WhatsApp — commit 9bbb5c0 — revisada: aprovada com ressalvas
  - Ruling: `formatBRL` do plano (min 0 / max 2 casas) devolvia "R$ 32,5" e espaço U+00A0; usei 0 casas para inteiros, 2 para os demais e espaço comum, para bater com a spec ("R$ 32,50"). Custo se errado: um ajuste em format.ts.
  - Ruling: `site.processIntro` junta os dois primeiros parágrafos da spec ("Meu processo..." e "Cada bloco passa pelas mesmas etapas:") separados por "\n\n", já que o tipo é string.
- [x] Task 3 — Matemática da timeline — commit 2baa8c2 — revisada: aprovada com ressalvas
  - Parecer: `docs/superpowers/reviews/task-03.md`. Registro inicial incorporado pela sessão concorrente em `2a0043b`; rastreabilidade registrada em `docs: review task 3`.
  - Ruling: a fórmula do plano `(scrollY + vh/2) / docHeight` dá 0,95 na rolagem máxima, contradizendo o teste do próprio plano (`scrollProgress(7200, 800, 8000)` = 1). Mantive os dois testes e fiz a âncora ir de vh/2 (topo) a vh (fim da página); assim a agulha chega ao fim da régua. Custo se errado: ajuste de uma linha em timeline.ts.
- [x] Task 4 — Layout, tema, abertura, botão, rodapé — commit c8ea113 — aguardando revisão
  - Verificado em 1440 px e 375 px (Chrome headless via CDP): sem rolagem horizontal, foto e texto legíveis, botão 44 px. A extensão do Chrome não conectou, por isso a captura foi pelo CDP.
  - Ruling: `og:image` sai como caminho relativo enquanto `site` não estiver em `astro.config.mjs`; vira URL absoluta quando o domínio da Vercel for definido (Task 10 deve lembrar disso). Custo se errado: prévia de link sem imagem.
  - Risco para a revisão/Task 5: a 375 px o botão "Conversar" é fixo e passa por cima do texto durante a rolagem; conferir com a timeline pronta.
- [x] Task 2 — Vídeos do Google Drive — commit c8c2d79 — aguardando revisão
  - Fixture montada com a listagem real da pasta pública (11 arquivos; IDs e nomes reais). `size` e `createdTime` são aproximados, como o plano manda; sem `thumbnailLink` nem `videoMediaMetadata` (não há como saber), então no dev o pôster é nulo e a proporção é 9:16.
  - Ruling: erros de rede e HTTP nunca incluem a URL nem a chave (a chave vai na query string); falha de rede vira "Drive API inacessível". Custo se errado: mensagem de erro menos detalhada.
  - Ruling: `fetchLatestVideos` monta a query com `encodeURIComponent` (e não `URLSearchParams`) para o espaço sair como `%20`, como o teste do plano exige.
  - Pendente do usuário (não bloqueia o código): a chave `GOOGLE_DRIVE_API_KEY` real, para testar `fetchLatestVideos` contra a API de verdade. Os testes usam `fetch` falso.
- [x] Task 5 — Timeline fixa — commit e467c52 — aguardando revisão
  - Verificado em 1440 px e 375 px com uma página temporária (não commitada) com as 5 seções e 10 clipes V2 falsos: timecode de 00:00:03 a 01:00:00:00, agulha sobre o clipe da seção visível, clique em "Contrate" leva à seção, Tab percorre os 14 botões, sem rolagem horizontal, altura 120 px / 56 px, pílula acima da faixa.
  - Ruling: a página real ainda só tem a abertura; `index.astro` passa só os clipes V1 e a timeline ignora ids sem elemento. Os clipes V2 (`video-1…N`) entram na Task 6, quando o Drive for lido na página (ler o Drive agora quebraria o build sem chave).
  - Ruling: coluna de rótulos e timecode com 96 px (o plano não fixa o valor) para a régua ficar alinhada às trilhas.
  - Ruling: no celular os clipes V2 ficam com ~11 px de largura (10 vídeos em 375 px), abaixo dos 44 px de alvo de toque. A spec manda a faixa fina com todos os clipes; a navegação por toque nos vídeos continua pela rolagem. Custo se errado: tocar no clipe certo é difícil no celular.
  - Ao fim da página (padding + rodapé) nenhum clipe fica ativo; a agulha chega ao fim da régua sem clipe embaixo.
- [x] Task 6 — Seção Portfólio — commit 4d595b8 — aguardando revisão
  - Verificado: dev sem chave mostra os 10 vídeos da fixture; `npm run build` sem chave falha citando `GOOGLE_DRIVE_API_KEY` e não gera `dist/index.html`; no build de produção (fixture forçada só no teste, já revertida) saem 10 blocos `id="video-"`, **0 downloads de MP4 antes do play**, o clique real no play dispara o download, o vídeo de 150 MB usa o iframe do Drive só depois do clique, 375 px e 1440 px sem rolagem horizontal. `curl` no endereço direto: 206, `video/mp4`, CORS aberto.
  - Ruling: o Vidstack não renderiza no servidor (`window is not defined` no tooltip do layout padrão, e o Astro interrompe a página). Troquei `client:visible` do plano por `client:only="react"`, com um bloco de `aspect-ratio` reservando o espaço para não haver salto de layout. Custo: os 10 players montam no carregamento (sem baixar vídeo), em vez de só ao entrar na tela.
  - Ruling: a fixture não traz `thumbnailLink`, então no dev os vídeos aparecem sem pôster (fundo preto até o play). Com a chave real o pôster vem do Drive via `getImage`.
  - Não verificado (precisa da chave real do Google, que só o usuário tem): `npm run build` com `GOOGLE_DRIVE_API_KEY` válida, o download dos pôsteres do `lh3.googleusercontent.com` e se o áudio/vídeo toca de ponta a ponta (o Chrome headless não reproduz mídia).
- [x] Task 7 — Processo criativo — commit 10a7dfb — aguardando revisão
  - Verificado no build de produção (fixture forçada só no teste, já revertida), 1440 px e 375 px sem rolagem horizontal: as 5 etapas animam de 25% de opacidade/8% de largura até o final; com `prefers-reduced-motion: reduce` aparecem completas de imediato; o timelapse só pede os primeiros trechos do arquivo (`preload="metadata"`) e não toca sem clique.
  - Ruling: em vez de `<MotionConfig reducedMotion="user">`, usei `useReducedMotion()` e, com reduced motion, o `motion.div` vai direto ao estado final sem transição. Motivo: o HTML do servidor já sai no estado "apagado" e o `MotionConfig` ainda animava a opacidade. Custo se errado: nenhum visível.
  - Ruling: a largura final do clipe é limitada ao que sobra na trilha (`min(width+20, 100-left)`) e o texto quebra linha, porque a etapa 5 passava de 100% e o texto das etapas 4 e 5 era cortado a 375 px.
  - A foto da timeline (`processo-timeline.jpg`) é um print vertical 717×1280 (50 KB); o timelapse tem 11 MB, como a spec.
- [x] Task 8 — Preços e pacotes — commit 04baae5 — aguardando revisão
  - `npm test`: 36/36 (5 novos de preço). Build: `dist/index.html` tem a nota fiscal literal e as 7 mensagens de WhatsApp certas. 1440 px e 375 px sem rolagem horizontal; VIP com contorno azul e badge "Mais vantajoso".
  - Ruling: `Tier` ganhou o campo opcional `priceNote`, usado só no Complexo ("Negociado conforme a ideia do vídeo", que está na tabela da spec). Custo se errado: remover um campo.
  - Ruling: o texto de "Vídeo avulso" copia o parágrafo da spec ("O preço depende da duração…") em vez de reescrever; títulos "Vídeo avulso" e "Pacotes" são rótulos curtos novos.
  - Ruling: mensagens dos pacotes usam "no Pacote X" (sem "em"), como o plano manda; as demais usam "em um vídeo …".
  - Armadilha achada: em componentes React dentro de `.astro`, `class` é ignorado, precisa `className` (o contorno do VIP sumia). Vale para as Tasks 9 e 10.
  - Criei `src/components/ChatLink.astro` (pílula "Conversar") para os 7 botões dos cards.
- [x] Task 9 — Trabalhou com (logos) — commit 8f771b0 — aguardando revisão
  - `npm test`: 40/40 (4 novos). Build: as 14 logos saem só em webp, a maior com 31 KB (< 40 KB); nenhum PNG/JPEG de logo vai para o `dist`. 1440 px e 375 px sem rolagem horizontal; Fazz em círculo, Yêda Carvalho e Pró-Cardíaco clareadas e legíveis.
  - Ruling: aparei a margem transparente de 7 logos (Eletromóveis, GG Eletrônicos, Nokia, Pró-Cardíaco, Sapatilhas.com, SEA Telecom, Skyfit) nas cópias de `src/assets/logos`, porque ocupavam só 19–70% da tela e saíam minúsculas (Pró-Cardíaco quase invisível). Os originais seguem em ~/Downloads. É a "otimização para web" da spec, sem mudar cor nem forma. Custo se errado: restaurar do Downloads.
  - Ruling: espaço de cada logo com `max-h-14` e `max-w-44` (o plano só fala em ~56 px de altura) para logos largas não ficarem miúdas.
  - `brightness(1.8)` aprovado no olho para Yêda Carvalho e Pró-Cardíaco.
- [x] Task 10 — Publicação diária e revisão final — commit 2a0043b — aguardando revisão
  - Criados `.github/workflows/daily-rebuild.yml` (cron `0 6 * * *` = 03:00 Brasília, `workflow_dispatch`, `permissions: {}`) e a seção "Publicação" do README, em 6 passos. Texto novo passou pelo no-ai-slop.
  - Revisão no navegador (build de produção com a fixture forçada só no teste, já revertida; Chrome headless): 1440 px e 375 px percorridos sem rolagem horizontal; pílula "Conversar" 12 px acima da timeline em ambos; nenhum `<video>`/`<audio>` com autoplay e nenhum tocando; reduced motion → `scroll-behavior: auto` e etapas estáticas; rodapé abre `https://instagram.com/giovanni1.ia` em nova aba; 0 erros de JS; 90 paradas de Tab, todas com indicador de foco.
  - Defeito achado e corrigido na revisão: a raiz do player Vidstack recebia foco por Tab sem indicador (o tema zera o contorno). Regra em `global.css` com o contorno azul.
  - `npm test`: 40/40. `npm run build` **sem chave falha de propósito** (mensagem cita `GOOGLE_DRIVE_API_KEY`); o build completo com a chave real não foi rodado (a chave é do usuário).
  - Risco conhecido do plano: o GitHub desativa workflows agendados em repositório público sem atividade por 60 dias (registrado no README).
  - Tasks 1 a 10 concluídas.
- [x] Task 11 — Redesign visual (ilha de edição) — commits feat: redesign tokens/hero, portfolio, process, hire, clients+footer (último: ver `git log`) — aguardando revisão
  - Fonte Archivo variável (wdth) no lugar da Geist; tokens do `.dark` conforme a tabela (`#1d1d1d` página, `#232323`/`#262626` trilhas, `#111` fios, `#000` só em players/foto); `h1`/`h2` em `.display` (largura 75%, peso 850). Marcador quadrado de 10 px na cor do clipe antes de cada `h2`. Textos aprovados intactos; não houve texto novo (nada passou pelo no-ai-slop além dos rótulos já existentes).
  - Verificado no build de produção (fixture forçada só no teste, já revertida) em 1440, 1024 e 375 px: sem rolagem horizontal em nenhuma seção nem no fim da página; 0 MP4 de vídeos baixados antes do play (o timelapse pede só os metadados, como na Task 7); com `prefers-reduced-motion: reduce` o `h1` e a foto ficam sem `animation` (`none`); agulha e clipe ativo batem em abertura, vídeos 1/5/10, processo, contrate (e trabalhou-com no celular); 0 erros de JS; 7 mensagens de WhatsApp iguais às de antes (+ a pílula); `npm test` 40/40; `npm run build` sem chave segue falhando de propósito. Contraste medido: `#e6e6e6` ≥ 12:1, `#9a9a9a` ≥ 5,4:1, `#4da3ff` ≥ 5,7:1, texto `#111` nos clipes ≥ 6,6:1.
  - Capturas: `docs/superpowers/screenshots/task-11/` (`<seção>-D|T|M.jpg` = 1440, 1024, 375 px).
  - Ruling: o `<video>` do timelapse ignorava `aspect-ratio`/`width` das classes (saía 16:9, 100%) porque o CSS do Vidstack tem uma regra sem camada (`:where(video:not([width]):not([height]))`) que vence o `@layer utilities` do Tailwind. Pus `width`/`height` no elemento. Custo se errado: nenhum visível. Vale para qualquer `<video>`/`<iframe>` novo sem atributos.
  - Ruling: pílula "Conversar" ficava em cima do botão "Conversar" das linhas de preço (1440 px). Criei `--pill-gutter` (≥1024 px) e as linhas da tabela e do contrato personalizado deixam essa folga à direita. Nas demais seções a pílula só passa por cima enquanto se rola, como qualquer botão flutuante. Custo se errado: tabela ~130 px mais estreita a 1024 px.
  - Ruling: abaixo de 1024 px as linhas de preço empilham (nome+preço, descrição, botão); a grade de 4 colunas só entra a partir de `lg`. Portfólio e Processo viram duas colunas também em `lg` (a plano diz "Desktop ≥1024 px" só para o Portfólio).
  - Ruling: `Timeline.tsx` ganhou só `tabular-nums` no timecode (saiu o `ui-monospace`) e o rótulo cinza `#8a8a8a`→`#9a9a9a` (token de texto secundário; antes dava ~4,1:1).
  - Ruling: o contorno do VIP é `outline` de 2 px com offset negativo (não `ring`); "Mais vantajoso" é texto no canto, sem pílula. Foto da abertura: `object-contain` na moldura `#000` no desktop, então sobram faixas pretas laterais em volta do retrato (a moldura é o "monitor").
  - Limitação conhecida (igual a antes): nos últimos ~150–200 px da página (padding + rodapé) a agulha passa do clipe "Trabalhou com" e nenhum clipe fica ativo no desktop.
  - Não verificado: build com a chave real do Google; reprodução real dos vídeos; pôsteres (a fixture não tem). Revisão final (Opus 5.5, alto) pode começar.
- [x] Ajuste pedido pelo Allan — capas dos vídeos — commit d4f2c9d — aguardando revisão
  - Sem `thumbnailLink` (lista de exemplo do dev, ou arquivo que a API não devolva miniatura), a capa usa a miniatura pública do Drive `https://lh3.googleusercontent.com/d/<ID>=w1280`, que não exige chave porque a pasta é pública. Testado com `curl` nos 11 arquivos: 200, JPEG, quadro real do vídeo.
  - Fixture: o institucional da SEA (`114ny…`) ganhou `videoMediaMetadata` 1280×720 (tirado da miniatura), para não aparecer espremido em 9:16 no dev. Os outros 10 são 1080×1920.
  - Verificado no dev (CDP) em 1440 px e 375 px: capa visível nos vídeos 1, 2 e 9. `npm test`: 40/40.
  - Achado à parte, já existia: aviso de hidratação no `Waveform` da timeline (Node e navegador arredondam `Math.sin` diferente na última casa). Só aparece no console; corrigir arredondando `y`/`height` a 3 casas.
- [x] Ajuste pedido pelo Allan — player dos vídeos — commit 2c9dc82 — aguardando revisão
  - Sintoma: ao clicar no play, os vídeos ficavam carregando para sempre; só o da SEA (player do Drive) tocava.
  - Causa (reproduzida via CDP): o pedido de mídia do navegador volta `net::ERR_BLOCKED_BY_ORB`. O Drive responde **403 HTML** a `drive.usercontent.google.com/download` quando `Sec-Fetch-Dest` é `video` ou `empty` (com e sem CORS); só a navegação direta (`document`) recebe o 206 `video/mp4`. A validação original com `curl` não mandava esses cabeçalhos, por isso parecia funcionar.
  - Decisão do Allan: player do Drive em todos. `PortfolioVideo.playback` virou `embedUrl`; saíram `DIRECT_PLAY_MAX_BYTES`, o `VideoPlayer.tsx`, a dependência `@vidstack/react` e a regra de foco do Vidstack em `global.css`. O iframe entra direto no HTML com `loading="lazy"` e a capa por baixo, para tocar com **um** clique (com a capa e o botão do site antes, eram dois). README: sem limite de 100 MB.
  - Verificado (CDP, 1440 px): o player do Drive mostra a capa e o play; só os iframes perto da tela carregam (4 no topo, 6 depois de rolar até o vídeo 2). `npm test`: 39/39. Não deu para confirmar o vídeo tocando dentro do iframe no Chrome sem janela; o Allan confirmou que o player do Drive toca (vídeo da SEA).
- [x] Task 12 — Redesign pelas referências do Allan — commits `feat: add Task 12 tokens…` a `feat: interactive timeline…` (`git log`) — aguardando revisão
  - Entregue: menu fixo (`SiteHeader`, sublinhado por IntersectionObserver), abertura, carrossel do portfólio com abas, processo com mini timeline e `<dialog>` do timelapse, contrate (tabela + pacotes), clientes, rodapé e a timeline nova (play, arrastar, agulha `role="slider"`, V2 subdividindo o clipe Portfólio, timecode ao vivo em `[data-timecode]`). Pílula "Conversar", `WhatsAppButton` e `--pill-gutter` removidos. Fonte nova: IBM Plex Mono (`@fontsource/ibm-plex-mono`, 400/500).
  - TDD: `videoName.test.ts` (6 testes) e 6 testes novos em `timeline.test.ts` (`progressToScrollY` ida e volta, `subdivideClip`). `npm test`: 51/51. `npm run build` sem chave falha pela chave, como deve.
  - Verificado (dev e build de produção com a fixture forçada só no teste, já revertida; Chrome headless/CDP): 1440, 1024 e 375 px sem rolagem horizontal; agulha e clipe ativo certos em todas as seções (o clipe "Clientes" agora vai até o fim, então a limitação do rodapé da Task 11 acabou); o play andou 5 s em 4,97 s e pausa com a roda; reduced motion: sem animação no título/foto e o play salta de seção a cada 4 s; arrastar até o meio da régua cai em 00:00:30:00; V2 "07" leva o carrossel ao card 07; abas filtram (nomes forçados só no teste), "Todos" volta com o clique no V2 de um card filtrado; setas, contador e ← → do teclado; slider com setas, PageUp, Home e End; o diálogo abre, Esc fecha e o foco volta ao botão; 0 erros de JS; 7 mensagens de WhatsApp iguais às de antes, mais 2 links sem mensagem (menu e abertura). Contrastes novos medidos antes de usar (`--dim` e `--text` ≥ 10:1 sobre `#121211`).
  - Capturas: `docs/superpowers/screenshots/task-12/` (`ref01`, `ref02`, `ref03` = os tamanhos das referências, 1586/1586/1086 px; as outras em 1440, 1024 e 375).
  - Ruling: `h1`/`h2` ficaram maiores que o "~150/~80 px" do plano. Medi a altura das maiúsculas na referência (≈145 e 63 px) e não o corpo da fonte: `h1` `clamp(3.5rem, 13vw, 13rem)` e `h2` `clamp(2.75rem, 5.7vw, 5.75rem)`, com `font-stretch: 86%` (a 100% a palavra "Vinicius" saía 16% mais larga que na imagem) e entrelinha 0.8/0.88. Custo se errado: ajustar três números em `global.css`.
  - Ruling: `.page` usa `box-sizing: content-box`, então os 90rem são do conteúdo e a margem de 5% fica por fora (como na referência a 1586 px: conteúdo de 80 a 1506).
  - Ruling: o "Início" da timeline é o topo da página, que a fórmula de `scrollProgress` põe em 00:00:05 (a âncora é o meio da tela). Por isso Home/arrastar até a esquerda param em ~00:00:05 e o play começa daí. Mudar isso é mexer na fórmula da Task 3.
  - Ruling: primeiro clipe V1 começa em 0 e o último vai até 100% da régua (o menu fixo ocupa o topo e o rodapé fica depois da seção Clientes).
  - Ruling: o play com reduced motion salta para a próxima seção a cada 4 s e para na última; o plano não dizia o que fazer no fim. Também: o Enter/Espaço no próprio botão de play não conta como "keydown" que pausa (senão pausava e o clique tocava de novo).
  - Ruling: as etapas do processo usam os rótulos curtos da referência (`processStepLabels`); `site.processSteps` (aprovados, com "Texto na tela e legendas, quando necessário") ficou em `site.ts` sem uso. `ChatLink.astro` virou o botão "Conversar ↗" dos pacotes (preenchido no VIP); `card.tsx` e `badge.tsx` seguem no repositório sem uso.
  - Ruling: os botões ("Ver portfólio", "Vamos conversar" etc.) usam as classes `.btn`/`.btn-fill` do CSS em vez de um componente; o "↗" é um SVG (a Archivo não tem a seta).
  - Ruling: título do card limitado a 3 linhas (`line-clamp-3`, com `title` completo) e largura mínima de 14rem para vídeo vertical, senão os nomes atuais, longos e em caixa alta, quebravam em 5+ linhas.
  - Os vídeos verticais ficam estreitos (~224 px) com 360 px de altura, então cabem ~6 cards a 1440 px (a referência mostra 3 cards mais largos). É o que a proporção 9:16 dá com altura fixa.
  - Limitações conhecidas: o foco por Tab entra nos iframes do Drive (o contorno do foco dentro deles é do Drive); o número do card fica por cima do iframe (sem clique), e a barra de título do Drive aparece embaixo dele; o play desenhado da referência não existe (decisão 4 do plano).
  - Não verificado: build com a chave real do Google; reprodução real dos vídeos do Drive.
  - Nomes sugeridos para o Vinicius renomear no Drive (`Título - Categoria - Detalhe`; sem isso o título é o nome inteiro e as abas não aparecem):
    1. `Efeito clone - Criativo - Conversão para consultoria`
    2. `Correção de estratégia de treino - Criativo - Foco em consultoria`
    3. `Estagnação na academia - Criativo - Venda de consultoria`
    4. `Venda de consultoria de musculação - Criativo - Foco em glúteos`
    5. `Correção de exercícios - Criativo - Venda de consultoria`
    6. `Erros comuns na academia - Criativo - Venda de consultoria`
    7. `SEA Telecom 10 anos - Institucional - Evento de aniversário`
    8. `Logo 3D com IA - Motion & IA - Vídeo de estudo`
    9. `SEA Telecom 10 anos - Institucional - Filme de comemoração`
    10. `Spoiler de promoção - Criativo - Calçados`
    11. `Vídeo trend - Criativo`
- [x] Ajuste pedido pelo Allan — vídeo deslocado no carrossel — commit `fix: keep Drive player at least 20rem wide` — aguardando revisão
  - Sintoma: o play aparecia deslocado para a direita (só clicava no vazio ao lado) e o vídeo tocando saía metade preto e cortado.
  - Causa: o player do Drive monta a página dele com ~320 px de largura no mínimo. Os cards verticais tinham 224 px, então o conteúdo passava do iframe e o centro (onde fica o play) caía fora do centro visível.
  - Correção: a caixa da mídia nunca é mais estreita que 20rem; o vídeo vertical fica com faixas pretas dos dois lados e o play centrado. Em 1440 px cabem ~4 cards. Conferido no dev (CDP) em 1586 e 375 px. Não deu para testar a reprodução (o headless não toca).
- [x] Ajuste pedido pelo Allan — play dos vídeos e capa do vídeo 8 — aguardando revisão
  - Sintoma: depois do ajuste de 20rem, o play deixou de responder no navegador do Allan; o vídeo 8 sem capa e, quando tocava, não carregava.
  - Causa da capa: a miniatura que o Drive gera para o vídeo 8 (`VÍDEO DE ESTUDO - APLICAÇÃO DE IA PRA CRIAÇÃO DE LOGO 3D`) é um quadro todo preto, porque o vídeo começa escuro. Não é erro do site.
  - Causa do play: não reproduzi no Chrome headless (lá o play toca nos cards 1 e 8). O player do Drive dentro do carrossel com rolagem horizontal depende da largura e do quadro do iframe, que mudam com a rolagem e com o login do Google; é frágil demais para corrigir no escuro.
  - Correção: os cards não têm mais iframe. Cada card mostra a capa e o botão de play no canto (como na referência 02) e, no clique, o player do Drive abre numa janela (`<dialog>`) com pelo menos 26rem de largura e até 80% da altura da tela, com "Fechar", clique fora para fechar e o link "Abrir no Google Drive" para quando o Drive não carregar. O iframe só existe com a janela aberta: nenhum vídeo carrega antes do clique (volta a valer a Global Constraint) e fechar para o vídeo. O carrossel passou a `client:load`, porque com `client:visible` o clique no V2 vindo do topo da página se perdia antes da hidratação.
  - Capa personalizada (novo, com testes): uma imagem na mesma pasta do Drive com o mesmo nome do vídeo (`.jpg`, `.png` ou `.webp`, sem diferenciar maiúsculas) vira a capa dele e não conta como vídeo. Para o vídeo 8, basta subir `VÍDEO DE ESTUDO - APLICAÇÃO DE IA PRA CRIAÇÃO DE LOGO 3D.jpg`. Só aparece no build com a chave (a lista de exemplo do dev não tem imagens).
  - Verificado (CDP): 0 iframes no HTML e na página antes do clique; o clique abre a janela e o vídeo toca (1, 3, 8 e 9; 1440 e 375 px); "Fechar" fecha, tira o iframe e devolve o foco ao card; V2 "07" vindo do topo leva ao card 07. `npm test`: 54/54. Limitação: com o foco dentro do player do Drive, o Esc vai para o Drive e não fecha a janela (use "Fechar" ou clique fora).
