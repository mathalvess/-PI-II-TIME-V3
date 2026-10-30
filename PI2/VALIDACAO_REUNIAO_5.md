# Reunião 5 — integração e validação

## O que foi integrado
- Validação de feriados nacionais no servidor pela BrasilAPI, tanto na criação quanto na edição.
- Cache das datas por ano durante 12 horas para reduzir chamadas externas.
- Se a API estiver indisponível, o servidor bloqueia a gravação do prazo e retorna HTTP 503 (não aceita um prazo sem validação).
- Histórico automático na criação, edição e mudança de status; consulta protegida por autenticação e acesso ao projeto.
- Valores anterior/novo do histórico usam `TEXT` no schema para não truncar descrições longas.

## Instalação
1. Configure o MySQL e as variáveis de ambiente conforme `src/back/model/Banco.ts`.
2. Execute o schema em `banco/schema.sql` em um banco de desenvolvimento vazio.
3. Dentro desta pasta `PI2`, execute `npm install`.
4. Execute `npm run build` e depois `npm run dev`.

## Testes manuais necessários
- Criar demanda com prazo em feriado nacional: deve retornar HTTP 400.
- Editar demanda e definir prazo em feriado nacional: deve retornar HTTP 400.
- Repetir criação/edição com data não feriado: deve permitir, se os demais dados e permissões forem válidos.
- Desligar acesso à BrasilAPI e enviar prazo: deve retornar HTTP 503, sem salvar.
- Alterar status permitido e proibido com perfis diferentes; verificar histórico em `SELECT * FROM historico ORDER BY data_hora DESC;`.
- Cancelar demanda e confirmar que a linha permanece na tabela `demanda` com status `Cancelada`.

## Limite desta validação
A compilação e os testes integrados dependem das dependências Node, de um MySQL configurado e de acesso à BrasilAPI. Não foram simulados como se tivessem sido executados. O schema foi ajustado, mas se o banco já existir, aplique também:
`ALTER TABLE historico MODIFY valor_anterior TEXT, MODIFY valor_novo TEXT;`
