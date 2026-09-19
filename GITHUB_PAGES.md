# Equilíbrio — GitHub Pages + Render

## Estrutura
- `docs/` = frontend que será publicado pelo GitHub Pages.
- `backend/` = API Node/Express que será publicada no Render.
- `database/` = apoio/local; em produção use PostgreSQL.

## Publicar frontend no GitHub Pages
1. Crie um repositório no GitHub e envie o conteúdo desta pasta.
2. Em Settings > Pages, escolha Deploy from a branch.
3. Escolha a branch `main` e a pasta `/docs`.
4. Salve e aguarde o GitHub gerar o endereço.

## Ligar o frontend ao backend
Depois de publicar o backend no Render, abra `docs/js/config.js` e altere:
`window.EQUILIBRIO_API_URL = 'https://SEU-BACKEND.onrender.com';`
Depois faça commit/push dessa alteração.

O GitHub Pages não executa Node.js. Por isso o frontend fica no GitHub Pages e a API fica no Render.
