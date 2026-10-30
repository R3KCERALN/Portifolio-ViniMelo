# Portifolio-ViniMelo

Portfólio de Vinicius Melo, editor de vídeo e filmmaker. É uma página única em que a rolagem anda numa timeline no estilo do Premiere. Os 10 vídeos mais recentes vêm de uma pasta pública do Google Drive.

Feito com Astro, React, Tailwind e Vidstack.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm test         # testes
npm run build    # build de produção
```

Sem `GOOGLE_DRIVE_API_KEY`, o `npm run dev` mostra uma lista de exemplo (`src/lib/drive.fixture.ts`). O `npm run build` sem a chave falha de propósito, para nunca publicar o portfólio vazio.

Para testar com os vídeos reais, copie `.env.example` para `.env` e preencha a chave.

## Publicação

O site fica na Vercel. Um agendamento do GitHub Actions reconstrói o site todo dia às 03:00 (Brasília) e o portfólio puxa os vídeos novos. Um vídeo colocado no Drive pode levar até um dia para aparecer.

1. **Chave do Google.** No Google Cloud, crie um projeto, ative a Drive API, crie uma chave de API e restrinja essa chave à Drive API.
2. **Vercel.** Importe o repositório (o preset Astro é detectado sozinho) e cadastre `GOOGLE_DRIVE_API_KEY` em Production e Preview.
3. **Deploy Hook.** Na Vercel, em Settings, Git, Deploy Hooks, crie um hook na branch `main` e copie a URL.
4. **Secret no GitHub.** No repositório, em Settings, Secrets and variables, Actions, crie o secret `VERCEL_DEPLOY_HOOK_URL` com a URL do hook.
5. **Teste.** Em Actions, rode "Daily rebuild" uma vez à mão e confirme que a Vercel iniciou um deploy.
6. **Vídeos do Vinicius.** Basta subir na pasta do Drive, sem limite de tamanho. Os vídeos tocam no player do Drive (o Google não deixa outro site tocar o arquivo direto), com a capa e o botão do site até o clique.

Se o Drive falhar na hora do build, o build quebra e a Vercel mantém no ar a última versão boa.

### Atenção

O GitHub desativa workflows agendados em repositórios públicos sem atividade por 60 dias. Hoje o repositório é privado. Se ele virar público, reative o workflow quando isso acontecer ou troque o agendamento por um Vercel Cron.

Para ativar a imagem de compartilhamento (`og:image`), defina `site` em `astro.config.mjs` com o endereço final do site. Sem isso, o caminho da imagem sai relativo.
