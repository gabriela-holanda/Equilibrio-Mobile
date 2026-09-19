# Colocar o Equilíbrio online

O projeto agora aceita PostgreSQL quando `DATABASE_URL` existe e continua usando JSON local quando ela não existe.

## Opção recomendada para demonstração
1. Crie uma conta em um provedor PostgreSQL (por exemplo Neon ou Supabase).
2. Crie um banco PostgreSQL gratuito.
3. Copie a connection string (`DATABASE_URL`).
4. Suba esta pasta para um repositório GitHub.
5. No Render, crie `New > Web Service` e conecte o repositório.
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Em Environment Variables, crie:
   - `DATABASE_URL` = sua connection string PostgreSQL
   - `JWT_SECRET` = uma senha/chave longa criada por você
9. Faça o deploy.
10. O Render fornecerá um endereço `*.onrender.com` para compartilhar com sua dupla.

Importante: não coloque a senha do banco nem JWT_SECRET dentro do GitHub. Use as Environment Variables do Render.
