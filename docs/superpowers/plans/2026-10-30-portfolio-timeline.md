# Portfólio Vinicius Melo — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site de página única do Vinicius Melo em que a rolagem imita a timeline do Premiere, com portfólio de 10 vídeos lido do Google Drive no build e republicado todo dia.

**Architecture:** Astro estático. A lógica pura (Drive, timecode, preços, links de WhatsApp) fica em `src/lib` e `src/data`, testada com Vitest. As seções são componentes `.astro`, sem JS. Só a timeline, o player e a animação das etapas são ilhas React. O build busca os vídeos na Drive API v3 e falha se não conseguir. Um GitHub Action chama o Deploy Hook da Vercel uma vez por dia.

**Tech Stack:** Astro 7.4, React 19, Tailwind 4, shadcn/ui 4.23 (radix-nova), Motion 14.8, @vidstack/react 1.15.7, Vitest 5.0.5, Node ≥ 22.

**Orquestração:** a ordem de execução, o modelo/esforço de cada tarefa, as skills e o protocolo com a sessão revisora estão em `docs/superpowers/orchestration.md` e valem sobre as sugestões de modelo dentro de cada tarefa.

**Spec:** `docs/superpowers/specs/2026-10-30-portfolio-timeline-design.md`. Leia antes de qualquer tarefa: os textos aprovados estão lá e devem ser copiados literalmente.

## Global Constraints

- Idioma `pt-BR`; todos os textos visíveis em português, copiados da spec sem reescrever.
- Tema sempre escuro: `<html lang="pt-BR" class="dark">`. Painéis `#1d1d1d` / `#232323` / `#262626`, divisórias `#111`, destaque (agulha e timecode) `#4da3ff`. Clipes: lilás `#a98bd6`, azul `#6fa8dc`, verde `#7cc48a`, rosa `#e8a0bf`, amarelo `#e6c26e`, áudio `#3f8f6b`.
- Nada de som automático. Os vídeos do portfólio não carregam antes do play.
- Respeitar `prefers-reduced-motion`: sem rolagem suave nem animações de entrada.
- WhatsApp: `https://wa.me/5591987491993`. Botão fixo **não verde**: fundo `#262626`, contorno `#3a3a3a`, texto cinza claro, ícone só em traço, rótulo "Conversar".
- A chave `GOOGLE_DRIVE_API_KEY` só é lida no build (frontmatter Astro / `src/lib`) e nunca usa o prefixo `PUBLIC_`.
- Pasta do Drive: ID `1ZyPhsGCoH-G2pOJFK9ihSGrPJfaHmxx2`, URL pública `https://drive.google.com/drive/folders/1ZyPhsGCoH-G2pOJFK9ihSGrPJfaHmxx2`.
- ~~Limite de reprodução direta: 100 MB~~ **Revogado em 2026-10-30:** o Drive responde 403 a qualquer vídeo embutido por outro site (`Sec-Fetch-Dest: video`, inclusive com CORS), e o Chrome bloqueia a resposta (`ERR_BLOCKED_BY_ORB`). Todos os vídeos usam o player do Drive (`/file/d/<ID>/preview`) em iframe com `loading="lazy"`, com a capa por baixo. Decisão do Allan.
- Sem dependências novas além de `vitest` e dos componentes shadcn `card` e `badge`.
- Visual sem cara de template: nada de gradientes decorativos, glassmorphism ou brilhos. A interface de edição é a estética.
- Commits pequenos, mensagem em inglês no padrão `feat:` / `chore:` / `test:`, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A pasta tem menos de 10 vídeos** (ex.: 3): o site mostra os 3, e a trilha V2 tem 3 clipes. Com zero vídeos, o build falha. → testes na Task 2.
2. **Vídeo sem tamanho informado** (atalho, arquivo convertido) ou com mais de 100 MB: cai no iframe do Drive, nunca num `<video>` quebrado. → testes na Task 2.
3. **Nomes de arquivo irregulares:** sem extensão, `.MP4` maiúsculo, `.mov`, espaço antes da extensão (`VÍDEO TREND .mp4`) e pontos no meio (`SAPATILHAS.COM`). Só a extensão de vídeo final sai, e o espaço sobrando é aparado. → testes na Task 2.
4. **Build de produção sem chave ou com chave inválida:** falha com mensagem clara e nunca publica a lista de exemplo (fixture). → testes na Task 2.
5. **Celular a 375 px:** a timeline e o botão "Conversar" não cobrem texto, preços nem controles do player, e a página não rola na horizontal. → verificação manual nas Tasks 5 e 10.

---

### Task 1: Base de testes, dados do site e link do WhatsApp

*Modelo sugerido: Sonnet 5.5, esforço médio.*

**Files:**
- Create: `vitest.config.ts`, `src/data/site.ts`, `src/lib/whatsapp.ts`, `src/lib/whatsapp.test.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`
- Modify: `package.json` (script `"test": "vitest run"`, devDependency `vitest@5.0.5`)

**Interfaces:**
- Produces:
  - `site` (em `src/data/site.ts`): `{ name: 'Vinicius Melo', role: 'Editor de vídeo e filmmaker', whatsappNumber: '5591987491993', driveFolderId: string, driveFolderUrl: string, heroText: string[], processIntro: string, processSteps: string[], processReferences: string, hireIntro: string, customContractText: string, invoiceNote: 'Emito nota fiscal de serviço, caso você precise.', credit: { label: 'Portfólio desenvolvido por @giovanni1.ia', href: 'https://instagram.com/giovanni1.ia' } }`. Os textos são os parágrafos aprovados da spec, um item por parágrafo.
  - `whatsappUrl(message?: string): string`
  - `formatBRL(value: number): string`

- [x] **Step 0: Commitar o que já existe** (scaffold Astro + spec + este plano) — feito pela sessão orquestradora

```bash
git add -A && git commit -m "chore: scaffold Astro project with design spec and plan"
```

- [x] **Step 1: Instalar o Vitest e criar a configuração**

`npm install -D vitest@5.0.5`. Em `vitest.config.ts`, use `getViteConfig` de `astro/config`, com `test: { include: ['src/**/*.test.ts'] }`.

- [x] **Step 2: Escrever os testes que falham**

```ts
// src/lib/whatsapp.test.ts
expect(whatsappUrl()).toBe('https://wa.me/5591987491993');
expect(whatsappUrl('Oi, Vinicius! Tenho interesse no Pacote VIP.'))
  .toBe('https://wa.me/5591987491993?text=Oi%2C%20Vinicius!%20Tenho%20interesse%20no%20Pacote%20VIP.');
// src/lib/format.test.ts
expect(formatBRL(40)).toBe('R$ 40');
expect(formatBRL(128)).toBe('R$ 128');
expect(formatBRL(32.5)).toBe('R$ 32,50');
```

- [x] **Step 3: Rodar e ver falhar.** `npm test`. Esperado: FAIL, módulos inexistentes.
- [x] **Step 4: Implementar** `whatsappUrl` com `encodeURIComponent`, lendo `site.whatsappNumber`, e `formatBRL` com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 2 })`. Criar `src/data/site.ts` com os textos literais da spec.
- [x] **Step 5: Rodar e ver passar.** `npm test`. Esperado: PASS.
- [x] **Step 6: Commit** `feat: add site content data and WhatsApp link helper`

---

### Task 2: Leitura dos vídeos do Google Drive

*Modelo sugerido: Sonnet 5.5, esforço alto (integração externa e regra que pode derrubar o portfólio).*

**Files:**
- Create: `src/lib/drive.ts`, `src/lib/drive.test.ts`, `src/lib/drive.fixture.ts`, `.env.example`

**Interfaces:**
- Consumes: `site.driveFolderId` (Task 1)
- Produces:

```ts
export const DIRECT_PLAY_MAX_BYTES = 100 * 1024 * 1024;
export interface DriveFile { id: string; name: string; mimeType: string; size?: string; createdTime: string; thumbnailLink?: string; videoMediaMetadata?: { width?: number; height?: number; durationMillis?: string } }
export type Playback = { kind: 'direct'; src: string } | { kind: 'iframe'; src: string };
export interface PortfolioVideo { id: string; title: string; createdTime: string; playback: Playback; posterUrl: string | null; aspectRatio: number }
export function titleFromFileName(name: string): string;
export function isVideoFile(file: DriveFile): boolean;
export function toPortfolioVideo(file: DriveFile): PortfolioVideo;
export function fetchLatestVideos(opts: { apiKey: string | undefined; folderId: string; limit?: number; fetchImpl?: typeof fetch }): Promise<PortfolioVideo[]>;
export function loadPortfolio(opts: { apiKey: string | undefined; isDev: boolean; folderId: string; fetchImpl?: typeof fetch }): Promise<PortfolioVideo[]>;
```

Regras:
- `direct.src` é `https://drive.usercontent.google.com/download?id=<id>&export=download`.
- `iframe.src` é `https://drive.google.com/file/d/<id>/preview`.
- `posterUrl` é o `thumbnailLink` com o sufixo `=s<n>` trocado por `=s1280`, ou `null` quando não houver thumbnail.
- `aspectRatio` é `width / height` vindo de `videoMediaMetadata`, com `9 / 16` como padrão.
- `fetchLatestVideos` faz um GET em `https://www.googleapis.com/drive/v3/files`, ordenado por `createdTime desc`, com `pageSize=100` e os parâmetros:
  - `q="'<folderId>' in parents and trashed=false"`
  - `fields=files(id,name,mimeType,size,createdTime,thumbnailLink,videoMediaMetadata(width,height,durationMillis))`
  - `key=<apiKey>`

  Depois filtra com `isVideoFile` e corta em `limit` (padrão 10).
- `loadPortfolio` usa a fixture somente quando `isDev && !apiKey`, com o mesmo filtro, a mesma ordenação e o mesmo limite de 10. Em qualquer outro caso chama `fetchLatestVideos`.
- `drive.fixture.ts` exporta `driveFixture: DriveFile[]` com os 11 arquivos atuais. Os IDs e nomes estão na listagem da pasta. O `size` em bytes é aproximado (35, 36, 31, 58, 37, 67, 75, 8, 150, 27 e 26 MB, nessa ordem de ID), e o ID `114nyOK0aEC8-hUNSxxZNLxwUyIP8VUm_` fica acima de 100 MB. O `createdTime` deve ser decrescente na ordem da listagem.
- `.env.example` contém `GOOGLE_DRIVE_API_KEY=`.

- [x] **Step 1: Escrever os testes que falham** em `src/lib/drive.test.ts`

```ts
// titleFromFileName
expect(titleFromFileName('CRIATIVO PARA VENDA DE CONSULTORIA DE MUSCULAÇÃO - FOCO EM GLÚTEOS.mp4')).toBe('CRIATIVO PARA VENDA DE CONSULTORIA DE MUSCULAÇÃO - FOCO EM GLÚTEOS');
expect(titleFromFileName('VÍDEO TREND .mp4')).toBe('VÍDEO TREND');
expect(titleFromFileName('CRIATIVO SOBRE CORREÇÃO DE EXERCÍCIOS NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA')).toBe('CRIATIVO SOBRE CORREÇÃO DE EXERCÍCIOS NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA');
expect(titleFromFileName('PROMO SAPATILHAS.COM.MP4')).toBe('PROMO SAPATILHAS.COM');
expect(titleFromFileName('making of.mov')).toBe('making of');
// isVideoFile
expect(isVideoFile({ ...base, mimeType: 'video/mp4' })).toBe(true);
expect(isVideoFile({ ...base, mimeType: 'application/octet-stream', videoMediaMetadata: { width: 1080 } })).toBe(true);
expect(isVideoFile({ ...base, mimeType: 'application/vnd.google-apps.folder' })).toBe(false);
expect(isVideoFile({ ...base, mimeType: 'image/png' })).toBe(false);
// toPortfolioVideo
expect(toPortfolioVideo({ ...base, id: 'A', size: String(99 * 1024 * 1024) }).playback).toEqual({ kind: 'direct', src: 'https://drive.usercontent.google.com/download?id=A&export=download' });
expect(toPortfolioVideo({ ...base, id: 'B', size: String(101 * 1024 * 1024) }).playback).toEqual({ kind: 'iframe', src: 'https://drive.google.com/file/d/B/preview' });
expect(toPortfolioVideo({ ...base, id: 'C', size: undefined }).playback.kind).toBe('iframe');
expect(toPortfolioVideo({ ...base, thumbnailLink: 'https://lh3.googleusercontent.com/x=s220' }).posterUrl).toBe('https://lh3.googleusercontent.com/x=s1280');
expect(toPortfolioVideo({ ...base, videoMediaMetadata: { width: 1920, height: 1080 } }).aspectRatio).toBeCloseTo(16 / 9);
expect(toPortfolioVideo({ ...base }).aspectRatio).toBeCloseTo(9 / 16);
// fetchLatestVideos (fetchImpl falso)
// 12 vídeos + 1 pasta → retorna 10, na ordem recebida, sem a pasta
// 3 vídeos → retorna 3
// 0 vídeos → rejeita com /nenhum vídeo/i
// resposta 403 → rejeita com /Drive API respondeu 403/
// apiKey undefined → rejeita com /GOOGLE_DRIVE_API_KEY/
// a URL chamada contém orderBy=createdTime%20desc e o folderId codificado
// loadPortfolio
// { isDev: true, apiKey: undefined } → resolve com 10 vídeos da fixture, sem chamar fetchImpl
// { isDev: false, apiKey: undefined } → rejeita com /GOOGLE_DRIVE_API_KEY/
// { isDev: true, apiKey: 'k' } → chama fetchImpl
```

- [x] **Step 2: Rodar e ver falhar.** `npm test -- src/lib/drive.test.ts`. Esperado: FAIL.
- [x] **Step 3: Implementar `src/lib/drive.ts` e `src/lib/drive.fixture.ts`** conforme as regras acima. Em `titleFromFileName`, remova só a extensão final que estiver em `/\.(mp4|mov|m4v|webm|mkv|avi)$/i` e depois apare os espaços.
- [x] **Step 4: Rodar e ver passar.** `npm test`. Esperado: PASS.
- [x] **Step 5: Commit** `feat: load latest portfolio videos from Google Drive`

---

### Task 3: Matemática da timeline

*Modelo sugerido: Sonnet 5.5, esforço médio.*

**Files:**
- Create: `src/lib/timeline.ts`, `src/lib/timeline.test.ts`

**Interfaces:**
- Produces:

```ts
export const TIMELINE_TOTAL_SECONDS = 60; // a página inteira "dura" 1 minuto, como um Reels
export const TIMELINE_FPS = 30;
export function scrollProgress(scrollY: number, viewportHeight: number, docHeight: number): number; // (scrollY + viewportHeight/2) / docHeight, limitado a [0,1]
export function progressToTimecode(progress: number, totalSeconds?: number, fps?: number): string; // "HH:MM:SS:FF"
export interface ClipBox { id: string; left: number; width: number } // percentuais 0–100
export function computeClips(sections: { id: string; top: number; height: number }[], docHeight: number): ClipBox[];
```

- [x] **Step 1: Escrever os testes que falham**

```ts
expect(progressToTimecode(0)).toBe('00:00:00:00');
expect(progressToTimecode(0.5)).toBe('00:00:30:00');
expect(progressToTimecode(1)).toBe('00:01:00:00');
expect(progressToTimecode(0.1234)).toBe('00:00:07:12');
expect(progressToTimecode(-1)).toBe('00:00:00:00');
expect(progressToTimecode(2)).toBe('00:01:00:00');
expect(scrollProgress(0, 800, 8000)).toBeCloseTo(0.05);
expect(scrollProgress(7200, 800, 8000)).toBe(1);
expect(scrollProgress(0, 800, 0)).toBe(0);
expect(computeClips([{ id: 'abertura', top: 0, height: 1000 }, { id: 'portfolio', top: 1000, height: 3000 }], 4000))
  .toEqual([{ id: 'abertura', left: 0, width: 25 }, { id: 'portfolio', left: 25, width: 75 }]);
expect(computeClips([], 4000)).toEqual([]);
```

- [x] **Step 2: Rodar e ver falhar.** `npm test -- src/lib/timeline.test.ts`
- [x] **Step 3: Implementar.** Para os frames, use `Math.floor` sobre o total de frames.
- [x] **Step 4: Rodar e ver passar.** `npm test`
- [x] **Step 5: Commit** `feat: add timeline progress and timecode math`

---

### Task 4: Layout, tema, abertura, botão do WhatsApp e rodapé

*Modelo sugerido: Sonnet 5.5, esforço médio.*

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/sections/Hero.astro`, `src/components/WhatsAppButton.astro`, `src/components/sections/Footer.astro`, `src/assets/vinicius.png`
- Modify: `src/styles/global.css` (tokens `.dark` com a paleta das Global Constraints; variável `--timeline-h`), `src/pages/index.astro`

**Interfaces:**
- Consumes: `site`, `whatsappUrl` (Task 1)
- Produces:
  - `BaseLayout` com props `{ title: string; description: string }`, que renderiza `<html lang="pt-BR" class="dark">`, `<slot />`, `<WhatsAppButton />` e um `<slot name="timeline" />`.
  - IDs de seção usados pelas tarefas seguintes: `abertura`, `portfolio`, `processo`, `contrate`, `trabalhou-com`.
  - Variável CSS `--timeline-h`, com `120px` a partir de `md` e `56px` abaixo. O `body` recebe `padding-bottom: var(--timeline-h)`.

- [x] **Step 1: Copiar a foto** de `~/Downloads/Retrato Masculino em Estúdio Aconchegante.png` para `src/assets/vinicius.png`.
- [x] **Step 2: Ajustar os tokens** de `.dark` em `global.css`:
  - `--background` em `#000` (o "monitor");
  - `--card` em `#1d1d1d`;
  - `--border` em `#262626`;
  - `--primary` em `#4da3ff`.

  Os demais tokens seguem a mesma família de cinzas. Fonte do timecode: `ui-monospace, Menlo, monospace`.
- [x] **Step 3: Montar `BaseLayout`** com o título "Vinicius Melo — Editor de vídeo e filmmaker". A meta description sai do primeiro parágrafo de `heroText`, e a `og:image` é a foto, gerada com `getImage` em 1200 px.
- [x] **Step 4: Montar `Hero.astro`** (`id="abertura"`, altura mínima de uma tela). Leva a foto via `<Image>` do Astro com largura de até 640 px, `loading="eager"` e alt "Vinicius Melo", mais nome, função e os dois parágrafos de `heroText`.
- [x] **Step 5: Montar `WhatsAppButton.astro`**:
  - âncora para `whatsappUrl()`, com `target="_blank"` e `rel="noopener"`;
  - fixa à direita, em `bottom: calc(var(--timeline-h) + 12px)`;
  - pílula conforme as Global Constraints, ícone SVG do balão do WhatsApp só em traço;
  - texto "Conversar" e `aria-label="Conversar com o Vinicius no WhatsApp"`.
- [x] **Step 6: Montar `Footer.astro`** com `site.credit` (link para o Instagram), discreto, em texto cinza.
- [x] **Step 7: Verificar.**
  - `npm run build`: esperado `1 page(s) built` sem erros.
  - `npm test`: esperado PASS.
  - `astro dev --background`: abrir em 1440 px e 375 px. Esperado: fundo preto, foto e texto legíveis, pílula cinza "Conversar" no canto e sem rolagem horizontal.
- [x] **Step 8: Commit** `feat: add base layout, hero, WhatsApp button and footer`

---

### Task 5: Timeline fixa (ilha React)

*Modelo sugerido: Sonnet 5.5, esforço alto (interação central do site, desktop e celular).*

**Files:**
- Create: `src/components/timeline/Timeline.tsx`, `src/components/timeline/useScrollProgress.ts`
- Modify: `src/pages/index.astro` (renderizar `<Timeline client:load clips={...} />` no slot `timeline`)

**Interfaces:**
- Consumes: `scrollProgress`, `progressToTimecode`, `computeClips` (Task 3); IDs de seção (Task 4)
- Produces: `Timeline` com props `{ clips: { id: string; label: string; track: 'V1' | 'V2'; color: string }[] }`. Cada `id` é o `id` de um elemento da página. V1: `abertura` (lilás), `processo` (verde), `contrate` (rosa), `trabalhou-com` (amarelo). V2: `video-1` … `video-N` (azul, rótulo `1`…`N`). A trilha A1 tem um único clipe decorativo, que ocupa toda a largura.

- [x] **Step 1: Implementar `useScrollProgress()`**, que devolve `{ progress, clips }`. Ele mede `getBoundingClientRect().top + scrollY` e `offsetHeight` de cada `id` ao montar, no `resize` e via `ResizeObserver` em `document.body`. O progresso é atualizado num `scroll` passivo, com `requestAnimationFrame`.
- [x] **Step 2: Implementar `Timeline.tsx`**:
  - barra `position: fixed` no rodapé, com altura `var(--timeline-h)`, z-index acima do conteúdo e abaixo do botão do WhatsApp;
  - régua e rótulos V2/V1/A1 visíveis só a partir de `md`;
  - clipes posicionados por `left`/`width` em %, cada um um `<button>` com `aria-label="Ir para <label>"`, que chama `document.getElementById(id).scrollIntoView({ behavior })`, onde `behavior` é `'auto'` se `matchMedia('(prefers-reduced-motion: reduce)')` e `'smooth'` nos outros casos;
  - agulha azul (`#4da3ff`) com a cabeça em forma de escudo, posicionada em `progress * 100%`;
  - timecode `progressToTimecode(progress)` em azul, fonte mono, com `aria-hidden`.

  Visual de referência: `.superpowers/brainstorm/24503-1793339355/content/timeline-a-fluxo.html`.
- [x] **Step 3: Verificar** com `astro dev --background`:
  - em 1440 px, rolar do topo ao fim: a agulha vai de cerca de 0% a 100% e fica sobre o clipe da seção visível, e o timecode vai de `00:00:0x` até `00:01:00:00`;
  - clicar em "Contrate" leva à seção;
  - Tab percorre os clipes;
  - em 375 px, a faixa fina mostra só clipes e agulha, sem cobrir texto, sem rolagem horizontal e com a pílula acima da faixa.
- [x] **Step 4: Commit** `feat: add fixed Premiere-style scroll timeline`

---

### Task 6: Seção Portfólio

*Modelo sugerido: Sonnet 5.5, esforço alto.*

**Files:**
- Create: `src/components/sections/Portfolio.astro`, `src/components/portfolio/VideoPlayer.tsx`
- Modify: `src/pages/index.astro` (busca dos vídeos no frontmatter e clipes V2), `astro.config.mjs` (`image.domains: ['lh3.googleusercontent.com']`)

**Interfaces:**
- Consumes: `loadPortfolio`, `PortfolioVideo` (Task 2); `site.driveFolderUrl` (Task 1); props de `Timeline` (Task 5)
- Produces: elementos `id="video-1"` … `id="video-N"` dentro de `<section id="portfolio">`.

- [x] **Step 1: Buscar os vídeos no frontmatter de `index.astro`:** `const videos = await loadPortfolio({ apiKey: import.meta.env.GOOGLE_DRIVE_API_KEY, isDev: import.meta.env.DEV, folderId: site.driveFolderId })`. Se der erro, o build quebra, e é isso que queremos (spec: "nunca publicar o portfólio vazio").
- [x] **Step 2: Gerar os pôsteres.** Para cada vídeo com `posterUrl`, `getImage({ src: posterUrl, inferSize: true, width: 960, format: 'webp' })`. O resultado vai para o `dist` no build. Se `getImage` falhar para um pôster, use `null` e siga em frente. Um pôster faltando não derruba o build.
- [x] **Step 3: Implementar `VideoPlayer.tsx`**, com props `{ video: PortfolioVideo; poster: string | null }`:
  - `direct`: Vidstack `<MediaPlayer src={{ src, type: 'video/mp4' }} load="play" posterLoad="visible" playsInline title={video.title} aspectRatio={...}>` com `<MediaProvider />`, `<Poster />` e `<DefaultVideoLayout icons={defaultLayoutIcons} />`. Importe `@vidstack/react/player/styles/default/theme.css` e `layouts/video.css`, e troque a cor de destaque do tema por `#4da3ff`.
  - `iframe`: mostra o pôster com um botão de play e só cria o `<iframe src={playback.src} allow="autoplay; fullscreen" allowfullscreen loading="lazy">` depois do clique.
- [x] **Step 4: Montar `Portfolio.astro`.** Cada vídeo fica num bloco `id="video-<n>"` com o player (`client:visible`) e o título, e os vídeos verticais (`aspectRatio < 1`) ficam com largura contida. No fim vem o link "Ver mais trabalhos", com `href={site.driveFolderUrl}` e `target="_blank"`.
- [x] **Step 5: Passar os clipes V2 para `Timeline`.** São `videos.length` clipes, com rótulo = posição.
- [x] **Step 6: Verificar.**
  - Sem chave, no `astro dev`, aparecem os 10 vídeos da fixture. O vídeo da SEA Telecom acima de 100 MB usa o iframe, e os outros tocam no player do site ao clicar.
  - A aba Network não mostra download de MP4 antes do play.
  - Com a chave no `.env`, `npm run build` passa e `dist/index.html` contém 10 blocos `id="video-`.
  - Sem chave, `npm run build` falha com mensagem citando `GOOGLE_DRIVE_API_KEY`.
- [x] **Step 7: Commit** `feat: add rotating Drive portfolio section`

---

### Task 7: Seção Processo criativo

*Modelo sugerido: Sonnet 5.5, esforço médio.*

**Files:**
- Create: `src/components/sections/Process.astro`, `src/components/process/ProcessSteps.tsx`, `public/media/processo-timelapse.mp4`, `src/assets/processo-timeline.jpg`

**Interfaces:**
- Consumes: `site.processIntro`, `site.processSteps`, `site.processReferences` (Task 1)

- [x] **Step 1: Copiar os arquivos.** O vídeo vem de `~/Downloads/WhatsApp Video 2026-10-30 at 02.07.18.mp4` e a foto de `~/Downloads/WhatsApp Image 2026-10-30 at 02.07.19.jpeg`.
- [x] **Step 2: Implementar `ProcessSteps.tsx`.** As 5 etapas viram 5 trilhas horizontais rotuladas, uma por etapa, em cores de clipe diferentes. Cada clipe "acende" (opacidade e largura) ao entrar na tela, com `motion` `whileInView` e `viewport={{ once: true, amount: 0.6 }}`, dentro de `<MotionConfig reducedMotion="user">`. A lista também existe como `<ol>` acessível, sem depender da animação.
- [x] **Step 3: Montar `Process.astro`** (`id="processo"`):
  - texto de introdução;
  - `<ProcessSteps client:visible />`;
  - linha de referências;
  - timelapse em `<video controls playsinline preload="metadata" src="/media/processo-timelapse.mp4">`, vertical, sem autoplay;
  - foto da timeline via `<Image>`, com alt "Timeline de edição de um vídeo do Vinicius".
- [x] **Step 4: Verificar** com `npm run build` e no navegador: as etapas acendem ao rolar, aparecem estáticas com reduced motion (DevTools → Rendering → emulate) e o vídeo só toca com clique.
- [x] **Step 5: Commit** `feat: add creative process section`

---

### Task 8: Seção Contrate (preços e pacotes)

*Modelo sugerido: Sonnet 5.5, esforço médio.*

**Files:**
- Create: `src/data/pricing.ts`, `src/data/pricing.test.ts`, `src/components/sections/Hire.astro`
- Add (shadcn): `npx shadcn@4.23.0 add card badge` → `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`

**Interfaces:**
- Consumes: `formatBRL`, `whatsappUrl`, `site.hireIntro`, `site.customContractText`, `site.invoiceNote` (Task 1)
- Produces:

```ts
export interface Tier { id: 'basico' | 'intermediario' | 'complexo' | 'outros'; name: string; description: string; price: number | null; whatsappMessage: string }
export interface Pack { id: 'premium' | 'vip'; name: string; items: { tierId: 'basico' | 'intermediario'; quantity: number }[]; price: number; validityDays: number; highlighted: boolean; whatsappMessage: string }
export const tiers: Tier[]; export const packs: Pack[];
export function packFullPrice(pack: Pack): number;      // soma dos avulsos
export function packDiscountPercent(pack: Pack): number; // arredondado
export function packPricePerVideo(pack: Pack): number;
```

Valores e textos da tabela da spec:
- Básico: R$ 40.
- Intermediário: R$ 60.
- Complexo e Outros formatos: `price: null`, exibidos como "Sob consulta".
- Premium: 4 básicos, R$ 128, 15 dias.
- VIP: 4 básicos + 4 intermediários, R$ 280, 30 dias, `highlighted: true`.

Mensagens no formato `Oi, Vinicius! Tenho interesse em <alvo>.`, com os alvos:
- "um vídeo Básico"
- "um vídeo Intermediário"
- "um vídeo Complexo"
- "outro formato de vídeo"
- "no Pacote Premium"
- "no Pacote VIP"
- "um contrato personalizado"

Os alvos dos pacotes começam com "no" ("Tenho interesse no Pacote VIP"), e o card personalizado usa a forma completa.

- [x] **Step 1: Escrever os testes que falham**

```ts
const premium = packs.find(p => p.id === 'premium')!; const vip = packs.find(p => p.id === 'vip')!;
expect(packFullPrice(premium)).toBe(160); expect(packDiscountPercent(premium)).toBe(20); expect(packPricePerVideo(premium)).toBe(32);
expect(packFullPrice(vip)).toBe(400); expect(packDiscountPercent(vip)).toBe(30); expect(premium.validityDays).toBe(15); expect(vip.validityDays).toBe(30);
expect(tiers.find(t => t.id === 'complexo')!.price).toBeNull();
expect(packs.filter(p => p.highlighted).map(p => p.id)).toEqual(['vip']);
```

- [x] **Step 2: Rodar e ver falhar.** `npm test -- src/data/pricing.test.ts`
- [x] **Step 3: Implementar `pricing.ts`.**
- [x] **Step 4: Rodar e ver passar.** `npm test`
- [x] **Step 5: Montar `Hire.astro`** (`id="contrate"`) com:
  - título "Contrate o Vinicius" e o texto `hireIntro`;
  - parágrafo explicando que o preço do avulso depende de duração, plataforma e quantidade de efeitos;
  - cards dos avulsos;
  - cards dos pacotes, com preço, "R$ 32 por vídeo", "20% de desconto" (calculados pelas funções) e "Válido por 15 dias". O VIP leva o badge "Mais vantajoso" e contorno azul;
  - card de contrato personalizado com `customContractText`;
  - logo abaixo dos cards, sempre visível, a linha `invoiceNote` com um ícone de documento só em traço (`FileText` do lucide-react).

  Cada card tem um botão "Conversar" que leva a `whatsappUrl(card.whatsappMessage)`, com o mesmo estilo de pílula do botão fixo.
- [x] **Step 6: Verificar.** `npm run build`, e `dist/index.html` contém "Emito nota fiscal de serviço, caso você precise.". No navegador em 375 px, os cards empilham sem rolagem horizontal e os botões abrem o WhatsApp com a mensagem certa.
- [x] **Step 7: Commit** `feat: add pricing and packages section`

---

### Task 9: Seção Trabalhou com (logos)

*Modelo sugerido: Sonnet 5.5, esforço médio.*

**Files:**
- Create: `src/data/clients.ts`, `src/data/clients.test.ts`, `src/components/sections/Clients.astro`, `src/assets/logos/*.png|jpeg` (14 arquivos)

**Interfaces:**
- Produces: `clients: { name: string; logo: ImageMetadata; treatment?: 'circle' | 'brighten' }[]`, `people: { handle: string; url: string }[]` (vazio)

- [x] **Step 1: Copiar as 14 logos** de `~/Downloads` para `src/assets/logos/`, renomeando para slug ASCII:
  - `acai-boca-roxa.png`
  - `coopenorte.png`
  - `eletromoveis.png`
  - `fazz.jpeg`
  - `gg-eletronicos.png`
  - `leo-sousa.png`
  - `mae-de-sagui.png`
  - `nokia.png`
  - `ramos-sst.png`
  - `sapatilhas-com.png`
  - `sea-telecom.png`
  - `skyfit.png`
  - `yeda-carvalho.png`
  - `pro-cardiaco.png`
- [x] **Step 2: Escrever o teste que falha.** Verifica que `clients.length === 14`, que os nomes são únicos, que só `Fazz` tem `treatment: 'circle'`, que só `Yêda Carvalho` e `Clínica Pró-Cardíaco` têm `'brighten'` e que `people` é `[]`.
- [x] **Step 3: Rodar e ver falhar,** depois implementar `clients.ts` com os nomes:
  - Açaí Boca Roxa
  - Coopenorte
  - Eletromóveis
  - Fazz
  - GG Eletrônicos
  - Léo Sousa
  - Mãe de Sagui
  - Nokia
  - Ramos SST
  - Sapatilhas.com
  - SEA Telecom
  - Skyfit
  - Yêda Carvalho
  - Clínica Pró-Cardíaco
- [x] **Step 4: Rodar e ver passar.** `npm test`
- [x] **Step 5: Montar `Clients.astro`** (`id="trabalhou-com"`, título "Trabalhou com"):
  - grade de logos em cores originais no fundo escuro, cada uma via `<Image width={240} format="webp" alt={name}>`, com altura visual uniforme (~56 px) e `object-contain`;
  - `circle`: `rounded-full`;
  - `brighten`: `filter: brightness(1.8)`, ajustado no olho até a logo ficar legível sem estourar;
  - a lista `people` aparece abaixo das logos só se tiver itens, sem espaço reservado nem "em breve".
- [x] **Step 6: Verificar.** No navegador, as 14 logos aparecem legíveis, a Fazz sem cantos cinza, e o `dist` contém só versões webp leves (< 40 KB cada).
- [x] **Step 7: Commit** `feat: add client logos section`

---

### Task 10: Publicação diária e revisão final

*Modelo sugerido: Sonnet 5.5, esforço médio. Os passos na Vercel e no Google Cloud são feitos pelo Allan.*

**Files:**
- Create: `.github/workflows/daily-rebuild.yml`
- Modify: `README.md` (seção "Publicação" com o passo a passo)

- [x] **Step 1: Criar o workflow** com:
  - `on: schedule: - cron: '0 6 * * *'` (03:00 em Brasília) e `workflow_dispatch`;
  - um job com o passo `curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_URL"`, onde `VERCEL_DEPLOY_HOOK_URL: ${{ secrets.VERCEL_DEPLOY_HOOK_URL }}`;
  - `permissions: {}`.
- [x] **Step 2: Escrever no README** o passo a passo, em português:
  1. criar a chave no Google Cloud (ativar a Drive API, criar a chave de API e restringi-la à Drive API);
  2. importar o repositório na Vercel (preset Astro detectado automaticamente) e cadastrar `GOOGLE_DRIVE_API_KEY` em Production e Preview;
  3. criar o Deploy Hook na Vercel, na branch `main`;
  4. salvar a URL do hook como secret `VERCEL_DEPLOY_HOOK_URL` no GitHub;
  5. rodar o workflow manualmente uma vez para testar;
  6. orientar o Vinicius a exportar os vídeos com menos de 100 MB.
- [x] **Step 3: Revisão final no navegador**, com `npm run build && npm run preview`:
  - em 1440 px e 375 px, percorrer a página inteira;
  - nenhuma rolagem horizontal; pílula e timeline sem cobrir conteúdo;
  - Tab passa por clipes, players e botões com foco visível;
  - reduced motion desliga a rolagem suave e as animações;
  - nenhum som toca sozinho;
  - o crédito do rodapé abre o Instagram.
- [x] **Step 4: Testes e build.** `npm test` e `npm run build`. Esperado: PASS e build completo.
- [x] **Step 5: Commit** `chore: add daily rebuild workflow and deploy guide`

**Risco conhecido:** o GitHub desativa workflows agendados em repositórios **públicos** sem atividade por 60 dias. O repositório hoje é privado. Se virar público, alguém precisa reativar o workflow, ou ele pode ser trocado por um Vercel Cron.

---

### Task 11: Redesign visual (ilha de edição)

*Modelo: Sonnet 5.5, esforço alto. Pedida pelo Allan em 2026-10-30, depois das Tasks 1–10: "ainda está simples o site". Direção aprovada na sessão orquestradora. Muda só a aparência: dados, textos, ids das seções, lógica do Drive, do player e da timeline ficam como estão.*

**Referência obrigatória:** leia `~/.claude/skills/frontend-design/SKILL.md` (pedido pelo Allan com `/frontend-design`) e use `ui-ux-pro-max` antes de montar cada seção. Os textos aprovados continuam literais. Os rótulos novos passam pelo `no-ai-slop`.

**Files:**
- Modify: `package.json` (adicionar `@fontsource-variable/archivo`, remover `@fontsource-variable/geist`). Esta tarefa autoriza essa troca, que é exceção à regra de dependências das Global Constraints.
- Modify: `src/styles/global.css`, `src/layouts/BaseLayout.astro`
- Modify: `src/components/sections/{Hero,Portfolio,Process,Hire,Clients,Footer}.astro`, `src/components/process/ProcessSteps.tsx`, `src/components/portfolio/VideoPlayer.tsx` (só a moldura)
- Não mexa em: `src/lib/*`, `src/data/*` (exceto se um rótulo novo precisar de campo), `Timeline.tsx` (exceto fonte e cores dos tokens), testes existentes.

**Tokens** (substituem o tema escuro atual em `global.css`):

| Token | Valor | Uso |
|---|---|---|
| painel | `#1d1d1d` | fundo da página (sai o `#000` atual) |
| trilha | `#232323` / `#262626` | superfícies, linhas de tabela, células de logo |
| divisória | `#111` | fios entre trilhas, linhas e células |
| monitor | `#000` | só dentro de players, timelapse e moldura da foto |
| texto | `#e6e6e6`; secundário `#9a9a9a` | contraste ≥ 4.5:1 sobre `#1d1d1d` e `#262626` |
| agulha | `#4da3ff` | único destaque: links, foco, agulha, contorno do VIP |
| cor da seção | a cor do clipe V1/V2 da seção (Global Constraints) | um marcador quadrado de 10 px antes de cada `h2` e a cor do número dos vídeos. Nunca em parágrafo nem em fundo grande |

Decisão da orquestradora: manter o azul `#4da3ff` e os cinzas já usados na timeline, em vez de `#2d8ceb`/`#2a2a2a`, para a página e a timeline serem da mesma família.

**Tipografia:** Archivo variável com eixo de largura (`@fontsource-variable/archivo/wdth.css`; eixos `wdth` 62–125, `wght` 100–900).
- Títulos (`h1`, `h2`, números dos vídeos, preços): `font-stretch: 62%–75%`, peso 800–900, entrelinha 0.9–1.0, letras um pouco juntas. Nada de caixa alta forçada por CSS (escreva com a caixa do texto).
- Texto corrido: largura 100%, peso 400, 16–18 px, entrelinha 1.6, no máximo `65ch`.
- Timecode e preços: `font-variant-numeric: tabular-nums`. Tirar o `ui-monospace` do timecode da timeline.
- Escala: `h1` `clamp(4.5rem, 14vw, 12rem)`, `h2` `clamp(2.5rem, 6vw, 4.5rem)`, `h3` 1.25rem.

**Layout por seção** (alinhamento à esquerda em tudo; largura máxima da página 80rem com margem lateral de 16 px no celular):

1. **Abertura (o elemento memorável; o resto da página fica quieto).** Desktop: grade de 12 colunas. A foto ocupa as colunas 7–12, numa moldura `#000`, com duas linhas finas de área segura (retângulos internos a 5% e 10%, `1px` branco a 15% de opacidade, `aria-hidden`). O `h1` "Vinicius / Melo" (quebra entre nome e sobrenome) começa na coluna 1 e passa por cima da borda esquerda da foto (`position: relative; z-index`). Abaixo vêm a função, em `#9a9a9a`, e os dois parágrafos. Celular: o título vem antes da foto, com a foto em largura total logo abaixo e o título sobrepondo a borda superior dela em ~1/3 da altura da linha. A seção mantém `min-h-screen` só no desktop.
   - **Animação única da página:** ao carregar, o `h1` aparece com um wipe da esquerda para a direita (`clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, 500 ms, `cubic-bezier(.2,.7,.2,1)`). Em seguida a foto entra num corte seco (opacidade 0→1 em 1 frame, 120 ms depois). Só CSS, dentro de `@media (prefers-reduced-motion: no-preference)`. Sem fade-and-slide em outras seções.
2. **Portfólio.** Desktop (≥1024 px): duas colunas. A esquerda (4/12) é `sticky top-8` e tem o `h2` e o link "Ver mais trabalhos". A direita (8/12) traz a lista de vídeos. Cada vídeo é uma linha: o número (1–10) grande, condensado, na cor azul do clipe V2; ao lado, o player (`#000`, sem `rounded-lg`, raio de 2 px como clipe) e, abaixo, o nome do arquivo em `#9a9a9a`. Vídeos verticais com no máximo 22rem de largura, horizontais com a largura toda da coluna. Celular: uma coluna, número acima do player, link "Ver mais trabalhos" no fim. Os ids `video-N` continuam no `article`.
3. **Processo.** Desktop: duas colunas. Esquerda: `h2`, os dois parágrafos, `ProcessSteps` e as referências. Direita: o timelapse numa moldura `#000` e o print da timeline atrás dele, deslocado ~10% para baixo e para a direita, parcialmente coberto. O vídeo fica sempre inteiro visível e clicável. `ProcessSteps` usa os mesmos tokens da timeline fixa (rótulos `#262626`, trilhas `#232323`, fios `#111`, fonte Archivo, sem mono). Celular: empilhado (texto, etapas, vídeo, print).
4. **Contrate.** Sai o kit de cards shadcn (`Card`, `Badge` deixam de ser usados nesta seção).
   - "Vídeo avulso": uma tabela de preços em linhas (`<ul>` ou `<table>` semântica). Desktop: nome (condensado) | descrição | preço à direita, em `tabular-nums` | "Conversar". Fios `#111` entre as linhas e fundo `#232323`. Celular: cada linha empilha nome+preço na primeira linha, depois a descrição e o botão. "Sob consulta" e a `priceNote` do Complexo continuam.
   - "Pacotes": dois blocos lado a lado (empilhados no celular), com fundo `#262626` e raio de 2 px. O preço vai grande e condensado; por vídeo, desconto, preço cheio riscado e validade vêm em linhas separadas, sem juntar com `·`. O VIP tem contorno de 2 px `#4da3ff` e o selo "Mais vantajoso" como texto pequeno no canto (sem pílula).
   - "Contrato personalizado": uma linha da mesma família visual da tabela, com o texto aprovado e "Conversar".
   - Nota fiscal: logo abaixo, com ícone, sempre visível (sem mudança de texto).
5. **Trabalhou com.** Grade de células coladas, com `gap: 1px` sobre fundo `#111` e cada célula `#232323`, altura de 112 px (desktop) / 88 px (celular), logo centralizada com os limites e tratamentos atuais (círculo da Fazz, `brighten` da Yêda e do Pró-Cardíaco: reconfira no fundo `#232323`). 5 colunas no desktop, 3 no tablet e 2 no celular. As células vazias da última linha ficam no mesmo cinza, sem buraco.
6. **Rodapé:** crédito à esquerda, `#9a9a9a`, com o mesmo alinhamento da página. Sem mudança de texto.

**Pílula "Conversar" e `ChatLink`:** sem mudança de cor (Global Constraints). Só a fonte passa a ser Archivo.

**Evite** (lista do frontend-design): rótulo em caixa alta acima de cada título, `·` juntando metadados, `→` em links, sombra cinza igual em tudo, um raio só para tudo, palavra destacada em cor dentro do título, gradiente.

- [x] **Step 1: Fonte e tokens.** Instale `@fontsource-variable/archivo`, remova a Geist e reescreva os tokens do `.dark` em `global.css` conforme a tabela. `npm test` e `npm run build` (sem chave falha de propósito; use o dev para olhar).
- [x] **Step 2: Abertura** (layout + animação única). Confira em 1440 px e 375 px.
- [x] **Step 3: Portfólio** (coluna fixa + lista numerada). Confira se os clipes V2 da timeline continuam alinhados aos vídeos e se nenhum MP4 é baixado antes do play.
- [x] **Step 4: Processo.**
- [x] **Step 5: Contrate** (tabela + pacotes). Confira as 7 mensagens de WhatsApp no HTML gerado (devem ser as mesmas de antes).
- [x] **Step 6: Trabalhou com e rodapé.**
- [x] **Step 7: Verificação final** em 1440 px, 1024 px e 375 px (capturas para o progress.md): sem rolagem horizontal; pílula e timeline sem cobrir preços, botões ou controles do player; foco visível em todos os elementos com Tab; contraste ≥ 4.5:1 no texto; com `prefers-reduced-motion: reduce`, nenhuma animação de entrada; a agulha e os clipes ainda batem com as seções; `npm test` passando.
- [x] **Step 8: Commits** por etapa (`feat: redesign hero`, `feat: redesign portfolio section`…) ou um só `feat: editing-suite visual redesign`. Depois, a linha em `progress.md`.

---

### Task 12: Redesign pelas referências do Allan

*Modelo: Sonnet 5.5, esforço alto. Pedido do Allan em 2026-11-02: "modificar o design sem perder a ideia, siga exatamente as referências". Substitui a parte visual da Task 11. A ideia continua: página com timeline do Premiere fixa embaixo, agulha, timecode, trilhas V2/V1/A1, seções na mesma ordem e com os mesmos ids.*

**Referências (fonte da verdade visual):** `docs/superpowers/references/01-redesign-abertura.png`, `02-redesign-portfolio.png`, `03-redesign-processo-contratacao.png`. Abra as três antes de cada passo e compare com capturas suas do mesmo tamanho (1586 px de largura; a 03 é 1086 px). Onde esta tarefa não fala, a imagem manda. Onde a imagem não mostra (celular, seção de logos, rodapé), use as mesmas cores, fontes e fios.

**Decisões do Allan (2026-11-02):**
1. **Textos:** os textos curtos das referências entram como títulos e subtítulos. Os textos aprovados da spec continuam no site logo abaixo, menores. Exceção: quando o texto da referência diz a mesma coisa que o aprovado, fica só o da referência (vale só para a nota fiscal).
2. **Portfólio:** título, categoria e detalhe vêm do nome do arquivo no Drive (ver passo 3).
3. **WhatsApp:** a pílula flutuante "Conversar" sai. O contato fica no botão "Vamos conversar" do menu fixo e nos botões de cada preço. Esta tarefa revoga a regra da pílula nas Global Constraints.
4. **Timeline:** o play rola a página sozinho e arrastar a agulha leva a página até aquele ponto (ver passo 7).

**Ruling da orquestradora:** as referências usam caixa alta espaçada em mono, "·" entre metadados e "↗" nos botões. Isso contraria a lista "Evite" da Task 11, mas o pedido do Allan vale mais. Siga as imagens.

**Tokens** (medidos nos pixels das referências; substituem os da Task 11):

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#121211` | página |
| `--panel` | `#181819` | fundo da timeline e das trilhas |
| `--rule` | `#2f2e2c` | fios de tabela, trilhas, abas e células |
| `--rule-strong` | `#4f4f4f` | fio abaixo do menu e acima da faixa de clientes |
| `--cream` | `#faf1e8` | títulos, contornos dos botões, cantoneiras das molduras |
| `--text` | `#ece6dd` | subtítulos e texto |
| `--muted` | `#c9c7c6` | metadados, rótulos e textos aprovados menores |
| `--lilac` | `#c59fe6` | abertura: eyebrow, botão "Ver portfólio", clipe V1 |
| `--blue` | `#8bb5ed` | portfólio: eyebrow, aba ativa, sublinhado do menu, clipes V2 e V1 |
| `--green` | `#92d59b` | processo: eyebrow e clipe V1 |
| `--pink` | `#f1a9ca` (botão VIP `#fda8cf`) | contrate: eyebrow, contorno VIP, clipe V1 |
| `--yellow` | `#e8c683` | clientes: eyebrow e clipe V1 |
| áudio | fundo `#579069`, barras `#8bca9e` | trilha A1 |
| agulha | `#68a3e7`; timecode `#88c4f2` | agulha da timeline e das etapas |
| etapas V1–V5 | `#c391ec`, `#84b6f1`, `#99dea5`, `#f7ce84`, `#fda3cf` | mini timeline do processo |

Texto escuro sobre clipes e botões preenchidos: `--bg`. Raios: clipes 3 px, botões 3 px, caixas dos pacotes 6 px, mídias do portfólio 0.

**Fontes:**
- **Títulos:** Archivo (já instalada) em largura normal (`wdth` 100), peso 900, `letter-spacing: -0.04em`, entrelinha 0.9, cor `--cream`. Todo título termina com ponto, como nas referências ("Vinicius Melo.", "Portfólio.", "Processo criativo.", "Contrate o Vinicius.", "Trabalhou com.").
- **Texto:** Archivo 400/500.
- **Mono:** IBM Plex Mono 400/500 (`@fontsource/ibm-plex-mono`, dependência autorizada por esta tarefa). Vale para eyebrows (caixa alta, `letter-spacing: 0.18em`), números "01", contador do carrossel, timecodes, "ARRASTE PARA EXPLORAR" e a faixa de clientes.
- **Tamanhos a 1586 px:**
  - `h1` ~150 px (`clamp(3.5rem, 9.5vw, 9.5rem)`);
  - `h2` ~80 px (`clamp(2.75rem, 5.2vw, 5.25rem)`);
  - subtítulo da abertura ~44 px;
  - subtítulo das seções ~22 px;
  - eyebrow ~17 px.
- **Largura da página:** máx. `90rem`, com margem lateral de 5% (16 px no celular).

**Arquivos:**
- Create: `src/components/SiteHeader.astro`, `src/lib/videoName.ts` + `src/lib/videoName.test.ts`, `src/components/portfolio/PortfolioCarousel.tsx`, `src/components/process/TimelapseDialog.astro`
- Modify: `src/lib/timeline.ts` + testes, `Timeline.tsx`, `useScrollProgress.ts`, `index.astro`, `BaseLayout.astro`, `global.css`, todas as seções, `ProcessSteps.tsx`, `ChatLink.astro`, `src/data/pricing.ts` (campo `shortDescription`), `src/data/site.ts` (textos novos abaixo)
- Delete: `src/components/WhatsAppButton.astro`

**Textos novos** (copie literalmente em `site.ts` e não passe no no-ai-slop, porque vieram das referências):
- `heroEyebrow`: "Editor de vídeo & filmmaker"
- `heroTagline`: "Sua ideia, no próximo frame."
- `heroLead`: "Edição com ritmo, atenção aos detalhes e respeito ao seu briefing."
- `portfolioEyebrow`: "02 / Trabalhos selecionados"
- `portfolioTagline`: "Edição que dá ritmo à sua ideia."
- `processEyebrow`: "03 / Nos bastidores"
- `processTagline`: "Do material bruto ao último detalhe."
- `timelapseLabel`: "Um olhar sobre a minha edição"
- `hireEyebrow`: "04 / Vamos criar juntos"
- `hireTagline`: "Você traz o material e a ideia. Eu entrego o vídeo pronto para postar."
- `customContractLead`: "Precisa de outro volume ou formato?" (negrito) + " Vamos montar seu contrato."
- `invoiceNote`: "Emissão de nota fiscal disponível." (substitui o aprovado, pela decisão 1)
- `clientsEyebrow`: "05 / Clientes"
- Rótulos da interface: "Portfólio", "Processo", "Contato", "Vamos conversar", "Ver portfólio", "Ver todos os trabalhos", "Todos", "Vídeos avulsos", "Pacotes", "Mais vantajoso", "Conversar", "Arraste para explorar". O eyebrow "01 / Abertura" fica na moldura da foto.
- Etapas (rótulos dos clipes, da referência 03): "Corte do material bruto", "Tratamento de áudio", "Ajuste de imagem", "Texto e legendas", "Efeitos e pós-produção".
- Descrições curtas dos preços (`shortDescription`): Básico "Reels ou TikTok de até 1 min"; Intermediário "Até 1 min, com mais efeitos"; Complexo "Efeitos, pós-produção e after movies"; Outros formatos "YouTube, Shorts e vídeos acima de 1 min".

Os eyebrows ficam escritos em caixa normal no `site.ts`. A caixa alta vem do CSS (`text-transform: uppercase`), para o leitor de tela não soletrar.

- [ ] **Step 1: Tokens, fontes e menu.**
  - Instale `@fontsource/ibm-plex-mono` e reescreva os tokens.
  - Crie o `SiteHeader.astro`, fixo no topo, com fundo `--bg` e o fio `--rule-strong` embaixo:
    - à esquerda, "VM." (Archivo 900, link para `#abertura`);
    - à direita, os links "Portfólio" (`#portfolio`), "Processo" (`#processo`) e "Contato" (`#contrate`) e o botão contornado em `--cream` "Vamos conversar ↗" (`whatsappUrl()`, nova aba).
  - O link da seção visível fica sublinhado com 2 px na cor da seção (IntersectionObserver num `<script>` do Astro).
  - Abaixo de 768 px ficam só o "VM." e o botão.
  - Remova o `WhatsAppButton` e o `--pill-gutter`.
  - As seções ganham `scroll-margin-top` igual à altura do menu.
- [ ] **Step 2: Abertura** (referência 01).
  - **Coluna esquerda:**
    - eyebrow lilás;
    - `h1` "Vinicius" / "Melo." em duas linhas;
    - `heroTagline` (Archivo 500, `--text`);
    - `heroLead` (`--text`, ~22 px);
    - os botões "Ver portfólio ↗" (fundo `--lilac`, texto `--bg`, para `#portfolio`) e "Vamos conversar" (contorno `--cream`, WhatsApp).
  - **Coluna direita:** a foto numa moldura com quatro cantoneiras em L (`--cream`, 2 px, ~22 px de braço), "01 / ABERTURA" em mono no canto superior direito e o timecode ao vivo em mono no canto inferior direito (`<span data-timecode>`, ver passo 7).
  - **Embaixo:** um fio `--rule-strong` e a faixa "NOKIA", "SEA TELECOM" e "SKYFIT" em mono `--muted`, com espaço entre os nomes, sem "·".
  - **Abaixo da faixa** (decisão 1): os dois parágrafos aprovados (`site.heroText`) em duas colunas no desktop (uma no celular), `--muted`, 17–18 px, máx. 60ch cada.
  - A animação de entrada da Task 11 (wipe do título e corte seco da foto) continua.
- [ ] **Step 3: Nome do vídeo** (TDD). Em `src/lib/videoName.ts`:
  - `parseVideoName(fileTitle: string): { title: string; category: VideoCategory | null; detail: string | null }`;
  - `type VideoCategory = 'criativo' | 'institucional' | 'motion-ia'`.
  - **Padrão:** `Título - Categoria - Detalhe`, separado por " - " (espaço, hífen, espaço; o detalhe é opcional).
  - **Categorias:** só contam se o trecho do meio for uma delas, sem diferenciar maiúsculas e acentos: Criativo/Criativos → `criativo`; Institucional/Institucionais → `institucional`; "Motion & IA"/"Motion e IA" → `motion-ia`. Se não bater, o nome inteiro vira o título, sem categoria. Isso é de propósito: os nomes atuais já têm " - " no meio ("… NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA").
  - **Testes:**
    - `parseVideoName('Efeito clone - Criativo - Consultoria fitness')` → `{ title: 'Efeito clone', category: 'criativo', detail: 'Consultoria fitness' }`;
    - `'SEA Telecom 10 anos - Institucional - Filme de aniversário'` → `institucional`;
    - `'Logo 3D - motion e ia'` → `motion-ia` com `detail: null`;
    - `'CRIATIVO INFORMATIVO SOBRE ESTAGNAÇÃO NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA'` → título igual à entrada, `category: null`;
    - `'VÍDEO TREND'` → título igual à entrada.
  - **Também:** `categoryLabel(c)` → "Criativo"/"Institucional"/"Motion & IA" (metadado do card) e `categoryTabLabel(c)` → "Criativos"/"Institucionais"/"Motion & IA" (aba).
  - O título do arquivo continua vindo de `titleFromFileName`, sem mudança.
- [ ] **Step 4: Portfólio** (referência 02, `PortfolioCarousel.tsx` com `client:visible`). Recebe os vídeos já com `parseVideoName` aplicado e os pôsteres.
  - **Topo:**
    - à esquerda, eyebrow azul, `h2` "Portfólio." e `portfolioTagline`;
    - à direita, alinhado à base do título, o botão contornado "Ver todos os trabalhos ↗" (pasta do Drive).
  - **Abas:** linha entre dois fios `--rule`. "Todos" mais uma aba por categoria presente, na ordem Criativos, Institucionais, Motion & IA. A aba ativa fica em `--blue` com sublinhado de 2 px. Se nenhum vídeo tiver categoria, as abas não aparecem. Filtrar mostra só os vídeos daquela categoria e volta o carrossel ao início.
  - **Carrossel:** faixa horizontal com `scroll-snap-type: x mandatory`, sem barra de rolagem visível e altura de mídia fixa (~360 px no desktop, ~420 px no celular). A largura de cada card sai da proporção do vídeo: vertical estreito, horizontal largo, como na referência. São ~3 cards visíveis a 1440 px e 1 card mais uma ponta do próximo no celular.
  - **Card:**
    - a mídia, com o número "01"… em mono no canto superior esquerdo;
    - abaixo, o título em Archivo 700 (~28 px, `--cream`) e a linha "Categoria · Detalhe" (`--muted`). Sem categoria, nada; sem detalhe, só a categoria.
    - **Mídia:** o iframe do player do Drive (`embedUrl`, `loading="lazy"`) por cima do pôster, como hoje, para tocar com um clique.
    - **Diferença aceita em relação à referência:** o botão de play do canto inferior direito não é desenhado. O próprio Drive mostra o play dele no centro, e um segundo botão por cima do iframe bloquearia o clique ou exigiria dois cliques.
  - **Navegação:** setas "←" e "→" (botões contornados com `aria-label` "Vídeos anteriores"/"Próximos vídeos") e o contador "01 — 03 / 10" em mono, com o primeiro e o último card visíveis e o total do filtro. As setas avançam um card. Setas do teclado funcionam com o foco na faixa.
  - Os ids `video-N` ficam em cada card.
- [ ] **Step 5: Processo** (referência 03, topo).
  - **Coluna esquerda:**
    - eyebrow verde, `h2` "Processo" / "criativo." e `processTagline`;
    - a mini timeline: régua 00:00 · 00:15 · 00:30 · 00:45 · 01:00 com "00:00:00:00" azul em mono; trilhas V5 a V1 de cima para baixo, separadas por fios `--rule`; clipes em escada, "01 Corte do material bruto" em V1 até "05 Efeitos e pós-produção" em V5, com as cores da tabela, texto `--bg` em 600 e o número em 700; a agulha `#68a3e7` vertical com a cabeça no alto.
    - A animação de entrada das etapas continua, com reduced motion respeitado.
  - **Coluna direita:**
    - a foto `processo-timeline.jpg` numa moldura com cantoneiras, recortada em 4:3 (`object-fit: cover; object-position: 50% 47%`, mostra o notebook com a timeline);
    - abaixo, o botão-link (play num círculo contornado + `timelapseLabel`), que abre o `TimelapseDialog`: um `<dialog>` nativo com o timelapse vertical (`/media/processo-timelapse.mp4`, `controls`, `playsinline`, começa a tocar ao abrir, para ao fechar), botão "Fechar", Esc fecha e o foco volta ao botão.
  - **Embaixo das duas colunas** (decisão 1): `site.processIntro` (só o primeiro parágrafo; o "Cada bloco passa pelas mesmas etapas:" sai porque as etapas já estão acima) e `site.processReferences`, em `--muted`, máx. 65ch.
- [ ] **Step 6: Contrate** (referência 03, embaixo).
  - **Topo:** eyebrow rosa, `h2` "Contrate o Vinicius." em uma linha no desktop e `hireTagline`. Logo abaixo vem `site.hireIntro`, menor, em `--muted` (decisão 1).
  - **"Vídeos avulsos":** tabela em linhas entre fios `--rule`. Colunas: nome (Archivo 700, ~22 px), "|" fino, `shortDescription` (com a `description` aprovada numa segunda linha menor `--muted` abaixo, decisão 1), "|", preço (700, `tabular-nums`, "Sob consulta" quando não tem) e um botão quadrado contornado "→" para o WhatsApp da linha (`aria-label` "Conversar sobre o Básico" etc.). A `priceNote` do Complexo sai embaixo do preço, pequena. Abaixo da tabela vai o parágrafo aprovado "O preço depende da duração…", em `--muted`. No celular cada linha empilha: nome + preço, descrições, botão.
  - **"Pacotes":** duas caixas lado a lado (empilhadas no celular), com contorno de 1.5 px e raio de 6 px:
    - Premium: contorno `--cream`, botão contornado "Conversar ↗";
    - VIP: contorno `--pink`, eyebrow "Mais vantajoso" rosa em mono, botão preenchido `#fda8cf` com texto `--bg` "Conversar ↗".
    - Conteúdo de cada caixa: nome (700), conteúdo do pacote, preço grande (Archivo 900), "R$ 32 por vídeo · 20% de desconto", "Válido por 15 dias". O preço cheio riscado sai, como na referência.
  - **Fim da seção:** a linha "**Precisa de outro volume ou formato?** Vamos montar seu contrato." como link para o WhatsApp do contrato personalizado. Abaixo, `site.customContractText` pequeno e `invoiceNote` pequeno.
- [ ] **Step 7: Timeline** (as três referências, embaixo). Desktop, de cima para baixo:
  - **Linha de controle** (~44 px, fio `--rule` entre as linhas): botão play/pause no centro (triângulo `--cream`; `aria-label` "Reproduzir a página"/"Pausar", `aria-pressed`) e "ARRASTE PARA EXPLORAR" à direita, em mono `--muted`.
  - **Régua** (~32 px): timecode azul mono na coluna de rótulos (130 px) e as marcas 00:00 até 01:00.
  - **V2, V1 e A1** (~44 px cada): rótulos "V2/V1/A1" em `--muted`; clipes com texto `--bg` em 700.
    - **V1:** Abertura (lilás), **Portfólio (azul, novo clipe da seção `portfolio`)**, Processo (verde), Contrate (rosa) e Clientes (amarelo, seção `trabalhou-com`).
    - **V2:** "01"…"10", que dividem o trecho do clipe Portfólio (ver `subdivideClip`). O clique rola até o portfólio e leva o carrossel ao card N (evento `CustomEvent('portfolio:show', { detail: N })` escutado pelo carrossel).
    - **A1:** a forma de onda. Corrija o aviso de hidratação arredondando `y` e `height` a 3 casas.
  - **Celular** (~72 px): só V2 e V1 finas, com o play à esquerda na coluna de rótulos. Sem régua e sem o texto "arraste".
  - **TDD em `timeline.ts`:**
    - `progressToScrollY(progress, viewportHeight, docHeight): number` é o inverso de `scrollProgress`: `s = (p·D − 0.5·vh) / (1 + 0.5·vh / M)`, com `M = D − vh`, limitado a [0, M]. Teste de ida e volta: para `p` em 0.1, 0.5, 0.9 com `(vh, D) = (800, 8000)`, vale `scrollProgress(progressToScrollY(p)) ≈ p`; `progressToScrollY(0)` = 0 e `progressToScrollY(1)` = M.
    - `subdivideClip(parent: ClipBox, count: number, gapPercent = 0.15): ClipBox[]`: `count` caixas iguais dentro de `parent`, com folga entre elas, ids `video-1…N`. Testes: `count` 0 → []; a soma das larguras mais as folgas é igual a `parent.width`; a primeira começa em `parent.left`.
  - **Play:** rola a página em tempo real, para o timecode andar 1 s por segundo. A página inteira dura `TIMELINE_TOTAL_SECONDS` (60 s). Use `requestAnimationFrame` com `progressToScrollY`. Pausa no clique, em `wheel`, `touchstart`, `keydown` e no fim da página. Com reduced motion, em vez de rolar suave, pula de seção V1 em seção V1 a cada 4 s, com `behavior: 'auto'`.
  - **Arrastar:** `pointerdown` na régua ou numa trilha, fora de um clipe, e depois `pointermove` com `setPointerCapture`. A posição horizontal vira progresso, e o progresso vira `window.scrollTo(0, progressToScrollY(...))`, sem suavizar. A agulha tem `role="slider"`, `tabIndex=0`, `aria-valuemin=0`, `aria-valuemax=60`, `aria-valuenow` em segundos e `aria-valuetext` com o timecode. Setas valem ±1 s, PageUp e PageDown ±5 s, Home e End vão ao início e ao fim.
  - **Timecode ao vivo:** a cada quadro, a timeline escreve o timecode em todo `[data-timecode]` da página.
- [ ] **Step 8: Trabalhou com e rodapé** (fora das referências, com o mesmo sistema).
  - **Trabalhou com:** eyebrow amarelo `clientsEyebrow`, `h2` "Trabalhou com." e as 14 logos numa grade com fios `--rule` (sem fundo nas células), tratamentos atuais (círculo da Fazz e brilho da Yêda e do Pró-Cardíaco), conferidos no `#121211`.
  - **Rodapé:** fio `--rule-strong`, "VM." à esquerda e o crédito à direita, em `--muted`.
- [ ] **Step 9: Verificação.**
  - **Lado a lado com as referências:** capturas a 1586 px (01 e 02) e 1086 px (03), salvas em `docs/superpowers/screenshots/task-12/`. Diferenças aceitáveis: a foto real no lugar das imagens inventadas da referência, as capas reais dos vídeos e o play do Drive no lugar do botão desenhado.
  - **Telas de 1440, 1024 e 375 px:**
    - sem rolagem horizontal;
    - menu e timeline sem cobrir conteúdo;
    - foco visível em tudo;
    - contraste ≥ 4.5:1;
    - reduced motion: sem animação de entrada e play em saltos;
    - o play anda 1 s por segundo e pausa ao rolar com a roda;
    - arrastar a agulha leva ao ponto certo;
    - o clique no V2 "07" mostra o card 07;
    - as abas filtram (teste com nomes no padrão forçados só no teste).
  - **Comandos:** `npm test` passando e `npm run build` falhando só pela falta da chave.
- [ ] **Step 10: Commits** por passo (`feat: ...`, `test: ...`). Depois, a linha em `progress.md` e a lista de nomes sugeridos para o Vinicius renomear no Drive (formato `Título - Categoria - Detalhe`).
