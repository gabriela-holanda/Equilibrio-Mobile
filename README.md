# Banco do Equilíbrio

O projeto usa um **banco local em arquivo** para facilitar a execução no Windows sem Docker ou PostgreSQL.

- Arquivo: `equilibrio-db.json`
- Ele é criado automaticamente na primeira execução.
- Os usuários e dados ficam persistidos nele.
- Para fazer backup, basta copiar esse arquivo.
- Não apague o arquivo enquanto o servidor estiver rodando.
