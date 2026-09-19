# Equilíbrio — versão mobile/PWA

Esta é a versão mobile do Equilíbrio, usando o mesmo backend local e o banco em arquivo JSON da versão de notebook.

## Rodar

1. Abra esta pasta no VS Code.
2. No terminal, rode `npm.cmd install`.
3. Rode `npm.cmd start`.
4. Abra `http://localhost:3000`.

## Usar no celular

Para abrir no celular pela mesma rede Wi‑Fi, o computador precisa permitir conexões locais e o servidor deve escutar na rede. Depois, no navegador do celular, abra o IP local do computador na porta 3000, por exemplo `http://192.168.0.10:3000`.

A interface foi pensada para telas pequenas, tem navegação inferior e pode ser instalada como PWA quando o navegador oferecer a opção.

## Dados

Os dados continuam no arquivo `database/equilibrio-db.json`. Faça backup desse arquivo antes de testes importantes.
