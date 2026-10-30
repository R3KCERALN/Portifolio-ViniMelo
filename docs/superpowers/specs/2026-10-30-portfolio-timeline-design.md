# Portfólio Vinicius Melo — design

Data: 2026-10-30
Status: revisado, aguardando aprovação final

## Intenção

Site de portfólio profissional do Vinicius Melo, editor de vídeo e filmmaker. Página única em que rolar a página é como avançar numa timeline de edição do Premiere: a agulha (playhead) anda, o timecode muda e cada seção do site é um clipe na timeline.

O site existe para fechar trabalhos. Quem chega precisa ver em poucos segundos quem ele é, ver os vídeos dele, entender quanto custa e falar com ele no WhatsApp.

O site também precisa se manter sozinho. O Vinicius não vai mexer em código: ele só joga os melhores trabalhos numa pasta do Google Drive, e o site mostra os 10 mais recentes.

## Objetivos

- Apresentar o Vinicius de forma profissional (foto + texto).
- Mostrar sempre os 10 vídeos mais recentes da pasta do Drive, sem intervenção manual.
- Explicar o processo criativo dele (timelapse + texto + foto da timeline).
- Deixar preços e pacotes claros, e levar o visitante para o WhatsApp.
- Mostrar as empresas para as quais ele já trabalhou.
- Ter cara de interface de edição profissional, não de template.

## Não-objetivos

- Painel administrativo, CMS ou login.
- Formulário de contato (o contato é só pelo WhatsApp).
- Pagamento on-line.
- Blog ou outras páginas.
- Outros idiomas além do português.

## Anti-objetivos (seria fracasso mesmo funcionando)

- Visual genérico de template ou "site gerado por IA": gradientes roxos, cards de vidro, efeitos chamativos sem motivo.
- Botão de WhatsApp verde "pulando" na tela.
- Publicar o site com o portfólio vazio ou quebrado porque o Drive falhou.
- Som tocando sozinho.
- Timeline que atrapalha a leitura ou a navegação no celular.

## Stack (já instalada no repositório)

Astro 7 (site estático) com ilhas React, Tailwind 4, shadcn/ui (base Radix, preset Nova), Motion para animação e Vidstack para o player. Node ≥ 22. O projeto já compila (`npm run build`).

Hospedagem: Vercel, no subdomínio gratuito (ex.: `vinimelo.vercel.app`) até comprarem domínio. Repositório: `github.com/R3KCERALN/Portifolio-ViniMelo`.

## Layout geral — decidido

Escolhido entre três propostas: "monitor em cima, timeline fixa embaixo" (opção A).

- **Monitor:** a área principal da tela, fundo preto, onde o conteúdo de cada seção aparece grande. A página rola normalmente; o "monitor" é a metáfora visual, não uma caixa com rolagem própria.
- **Timeline fixa no rodapé**, sempre visível, imitando o painel do Premiere:
  - régua de tempo no topo;
  - trilha **V2** com 10 clipes pequenos, um para cada vídeo do portfólio;
  - trilha **V1** com os clipes Abertura, Processo, Contrate e Trabalhou com;
  - trilha **A1** com uma forma de onda de áudio decorativa;
  - **agulha azul** que anda da esquerda para a direita conforme a rolagem;
  - **timecode** no formato `00:00:00:00`, em azul, acompanhando a rolagem.
- Clicar num clipe leva para a seção (ou para o vídeo) correspondente.
- No portfólio, a agulha indica em qual dos 10 vídeos o visitante está.
- Tema escuro inspirado na interface do Premiere: cinzas de painel (`#1d1d1d`, `#232323`, `#262626`), divisórias quase pretas, o azul da agulha como cor de destaque e clipes em tons pastel (lilás, azul, verde, rosa, amarelo), como nos mockups.
- **Celular:** a timeline vira uma faixa mais fina, só com os clipes e a agulha (sem rótulos de trilha nem régua detalhada).

Mockups de referência: `.superpowers/brainstorm/24503-1793339355/content/timeline-a-fluxo.html` (fora do git).

## Seções, em ordem

### 1. Abertura

Foto do Vinicius e o texto abaixo. Nome exibido: **Vinicius Melo**. Subtítulo: editor de vídeo e filmmaker.

Foto: `~/Downloads/Retrato Masculino em Estúdio Aconchegante.png` (1121×1403, fundo escuro).

Texto aprovado:

> Sou Vinicius Melo, editor de vídeo e filmmaker. Busco soluções rápidas e eficientes e entrego dentro do prazo.
>
> Quem trabalha comigo tem um editor que escuta bem, segue o briefing à risca e presta atenção aos detalhes. Sou comunicativo e bem-humorado, e meu trabalho é transformar a sua ideia em conteúdo.

### 2. Portfólio (10 vídeos rotativos)

**Fonte:** pasta pública do Google Drive
`https://drive.google.com/drive/folders/1ZyPhsGCoH-G2pOJFK9ihSGrPJfaHmxx2`
(ID `1ZyPhsGCoH-G2pOJFK9ihSGrPJfaHmxx2`). Hoje ela tem 11 vídeos.

**Regras:**
- O site mostra os **10 vídeos mais recentes**, do mais novo para o mais antigo. "Mais recente" = data em que o arquivo foi colocado no Drive (`createdTime`).
- O **nome do arquivo, sem a extensão**, é a descrição do vídeo. Exemplo: `CRIATIVO PARA VENDA DE CONSULTORIA DE MUSCULAÇÃO - FOCO EM GLÚTEOS.mp4` → "CRIATIVO PARA VENDA DE CONSULTORIA DE MUSCULAÇÃO - FOCO EM GLÚTEOS". Há arquivo sem extensão na pasta ("CRIATIVO SOBRE CORREÇÃO DE EXERCÍCIOS NA ACADEMIA - FOCO EM VENDA DE CONSULTORIA", ID `1KbaeNxea5RbxEreUxYpZU5yXYdYKARi5`); o tratamento precisa aceitar os dois casos.
- Considerar só arquivos de vídeo, ignorando subpastas e itens na lixeira. Filtro: `mimeType` começando com `video/` **ou** presença de `videoMediaMetadata`. Verificado: o arquivo sem extensão é um MP4 de verdade (cabeçalho `ftyp isom`), o Drive o lista como vídeo e o download direto responde `video/mp4`.
- No fim da seção, link "ver mais trabalhos" que abre a pasta do Drive.
- Nenhum vídeo toca sozinho nem carrega antes de o visitante dar play.

**Atualização:** uma vez por dia. Um vídeo novo pode levar até um dia para aparecer (aceito pelo cliente). A lista é buscada **durante o build** pela API do Google Drive v3 (`files.list`, ordenada por `createdTime desc`), com uma chave de API (`GOOGLE_DRIVE_API_KEY`, restrita à Drive API) guardada como variável de ambiente na Vercel. A chave **não** vai para o navegador. Um agendamento do GitHub Actions dispara um Deploy Hook da Vercel todo dia de madrugada (horário de Brasília).

**Falha do Drive:** se a busca falhar ou vier vazia, o build deve falhar. A Vercel mantém no ar a última versão boa. Nunca publicar o portfólio vazio.

**Reprodução (testado em 30/10/2026):**
- Vídeos públicos de até 100 MB tocam direto por `https://drive.usercontent.google.com/download?id=<ID>&export=download`: responde `video/mp4`, aceita requisição parcial (206) e libera CORS. Esses tocam no player Vidstack do site.
- Acima de 100 MB o Google devolve uma página HTML de "verificação de vírus" no lugar do vídeo. Hoje isso acontece com "VÍDEO INSTITUCIONAL - COMEMORAÇÃO DE 10 ANOS SEA TELECOM.mp4". Para esses, usar o player do próprio Drive em iframe: `https://drive.google.com/file/d/<ID>/preview`. O tamanho vem do campo `size` da API.
- Os arquivos testados têm o índice do MP4 (`moov`) no fim do arquivo, o que deixa o início da reprodução um pouco mais lento. Funciona; não é bloqueante.
- Risco conhecido: o Google pode limitar temporariamente um arquivo com muito tráfego. Aceito por enquanto; a alternativa (copiar para um serviço de vídeo pago) fica para depois.

### 3. Processo criativo

- Vídeo timelapse dele editando: `~/Downloads/WhatsApp Video 2026-10-30 at 02.07.18.mp4` (vertical 478×850, 51 s, 11 MB). Hospedado no próprio site, não no Drive. Sem autoplay com som.
- Foto da timeline (tela de edição): `~/Downloads/WhatsApp Image 2026-10-30 at 02.07.19.jpeg`.
- Texto aprovado:

> Meu processo é dividido em etapas. Começo analisando todo o material bruto. Depois monto o vídeo em blocos, que variam conforme a duração, a locução, a captação e o assunto do vídeo.
>
> Cada bloco passa pelas mesmas etapas:
> 1. Corte do material bruto
> 2. Tratamento de áudio
> 3. Ajuste de imagem
> 4. Texto na tela e legendas, quando necessário
> 5. Efeitos e pós-processamento
>
> Minhas referências de edição são o Th Produck e o Logan, do canal Matemática em Evidência.

- Sugestão aceita sem objeção: as 5 etapas aparecem como trilhas de uma timeline que acendem uma a uma conforme a rolagem.

### 4. Contrate o Vinicius

Abre com o texto aprovado:

> Você manda o material bruto e a ideia, e eu devolvo o vídeo pronto para postar, dentro do prazo e do jeito que foi pedido no briefing. Já editei para empresas como Nokia, SEA Telecom e Skyfit, de criativos para tráfego a vídeos institucionais.

Em seguida:

**Vídeo avulso.** O preço depende da duração, de onde o vídeo será postado (Reels, Shorts, vídeo longo para YouTube, criativo para tráfego) e da quantidade de informação e efeitos. Só os níveis Básico e Intermediário têm preço fixo, e só para Reels/TikTok de até 1 minuto.

| Nível | O que é | Preço |
|---|---|---|
| Básico | Reels/TikTok de até 1 min, edição única | R$ 40 |
| Intermediário | Reels/TikTok de até 1 min com mais efeitos e pós-processamento | R$ 60 |
| Complexo | Reels/TikTok com edição, efeitos e pós-processamento mais pesados; after movies (sem limite de 1 min) | Sob consulta, negociado conforme a ideia do vídeo |
| Outros formatos | Shorts, vídeo longo para YouTube, criativo para tráfego, vídeos acima de 1 min | Sob consulta |

**Pacotes:**

| Pacote | Conteúdo | Preço | Equivale a | Prazo de uso |
|---|---|---|---|---|
| Premium | 4 vídeos básicos | R$ 128 | R$ 32 por vídeo, 20% de desconto (de R$ 160) | 15 dias |
| VIP | 4 básicos + 4 intermediários | R$ 280 | 30% de desconto (de R$ 400) | 30 dias |

- O VIP aparece em destaque, como a opção mais vantajosa.
- Os cards mostram o desconto e o preço por vídeo.

**Contrato personalizado:** quantidade de vídeos, níveis de edição e período da parceria são negociados direto com ele. Texto aprovado do card:

> Precisa de uma rotina de vídeos com outro formato ou volume? A gente define junto a quantidade, os níveis de edição e o período da parceria.

**Nota fiscal:** a seção informa que ele emite nota fiscal de serviço quando o cliente quiser. Texto, logo abaixo dos cards, visível sem precisar abrir nada:

> Emito nota fiscal de serviço, caso você precise.

Cada card (avulso, pacotes, personalizado) tem um botão "Conversar" que abre o WhatsApp com mensagem pronta citando a opção, por exemplo: "Oi, Vinicius! Tenho interesse no Pacote VIP."

Todos os preços, nomes e prazos ficam num único arquivo de dados, fácil de editar.

### 5. Trabalhou com

A seção se chama **"Trabalhou com"** e sempre aparece. Por enquanto mostra só as logos das empresas; os @ de pessoas entram em atualizações futuras, na mesma seção.

- **Logos** das empresas, em cores originais, direto no fundo escuro (escolhido entre três propostas). 14 arquivos em `~/Downloads`:
  `LOGO AÇAÍ BOCA ROXA.PNG`, `LOGO COOPENORTE.png`, `LOGO ELETROMÓVEIS.PNG`, `LOGO FAZZ.jpeg`, `LOGO GG ELETRÔNICOS.PNG`, `LOGO Leonardo Sousa (Léo Sousa).png`, `LOGO MÃE DE SAGUI.PNG`, `LOGO NOKIA.png`, `LOGO RAMOS SST.PNG`, `LOGO SAPATILHAS.COM.PNG`, `LOGO SEA TELECOM.PNG`, `LOGO SKYFIT.PNG`, `LOGO YEDA CARVALHO.PNG`, `PRÓ-CARDÍACO LOGO.PNG`.
  - Fazz é JPEG sem transparência, com cantos cinza: recortar em círculo.
  - Yêda Carvalho e Pró-Cardíaco são escuras e somem no preto: aplicar um leve clareamento só nelas.
  - As imagens são grandes (até 4962 px); otimizar para web.
- **@ de pessoas:** ainda não há nenhum, e nada de espaço vazio ou "em breve" no lugar. Deixar a lista pronta no arquivo de dados (vazia por enquanto) para que adicionar um @ depois seja só incluir uma linha, sem mexer no layout.

### 6. Rodapé

"Portfólio desenvolvido por @giovanni1.ia", com link para `https://instagram.com/giovanni1.ia`.

## Botão do WhatsApp — decidido

- Sempre visível, fixo no canto inferior direito, **logo acima da timeline**, sem cobrir os clipes.
- **Não é verde.** Pílula discreta no estilo dos botões de painel do Premiere: fundo `#262626`, contorno fino `#3a3a3a`, texto cinza claro, ícone do WhatsApp só em traço.
- Texto: **"Conversar"**.
- Link: `https://wa.me/5591987491993` (número 91 9 8749-1993).

## Decisões minhas (o Allan pode revisar)

- Hospedagem na Vercel e agendamento diário pelo GitHub Actions.
- Site só em português; `lang="pt-BR"`.
- A trilha A1 é só visual; nenhum som automático.
- Link do rodapé para o Instagram `giovanni1.ia`.
- Tratamento da Fazz (círculo) e clareamento de Yêda Carvalho e Pró-Cardíaco.

## Fica a critério de quem construir

- Tipografia e escala exata, desde que siga o clima de interface de edição profissional.
- Como a posição da rolagem vira timecode (duração total simbólica).
- Animações de entrada de cada seção (com Motion), respeitando `prefers-reduced-motion`.
- Miniaturas (pôsteres) dos vídeos: como obter a partir do Drive.
- Layout interno de cada seção dentro do "monitor".
- SEO básico: título, descrição e imagem de compartilhamento (a foto dele).
- Acessibilidade: clipes da timeline navegáveis por teclado, textos alternativos nas logos com o nome da empresa.

## Pré-requisitos de publicação (o Allan faz, com passo a passo)

1. Criar uma chave de API no Google Cloud com a Drive API ativada, restrita a essa API.
2. Criar o projeto na Vercel ligado ao repositório e configurar `GOOGLE_DRIVE_API_KEY`.
3. Criar o Deploy Hook na Vercel e guardar a URL como segredo no GitHub para o agendamento diário.
4. Orientar o Vinicius a manter os vídeos com menos de 100 MB para que todos usem o player do site.
