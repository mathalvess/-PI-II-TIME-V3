-- Testes SQL da Reuniao 5
-- Execute DEPOIS de criar o banco com banco/schema.sql.
-- Os INSERTs/UPDATEs ficam dentro de uma transacao e sao desfeitos no final.
-- Requer os dados de exemplo do schema: usuario id=1 e projeto id=1.

USE sad_demandas;

START TRANSACTION;

SET @usuario_teste = 1;
SET @projeto_teste = 1;

-- 1) Confirma que os registros-base existem.
SELECT
  (SELECT COUNT(*) FROM usuario WHERE id_usuario = @usuario_teste) AS usuario_existe,
  (SELECT COUNT(*) FROM projeto WHERE id_projeto = @projeto_teste) AS projeto_existe;

-- 2) CREATE: insere demanda de teste; o status inicial deve ser Aberta.
INSERT INTO demanda
  (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel,
   data_criacao, data_atualizacao, prazo)
VALUES
  ('[TESTE SQL] Demanda temporaria', 'Registro criado pelo roteiro de testes.',
   'Tarefa', 'Media', 'Aberta', @projeto_teste, NULL, NOW(), NOW(), NULL);

SET @demanda_teste = LAST_INSERT_ID();

SELECT
  id_demanda,
  titulo,
  status,
  id_responsavel,
  (status = 'Aberta' AND id_responsavel IS NULL) AS create_ok
FROM demanda
WHERE id_demanda = @demanda_teste;

-- 3) Historico: registra uma alteracao de status.
INSERT INTO historico
  (id_demanda, id_usuario, campo, valor_anterior, valor_novo, data_hora)
VALUES
  (@demanda_teste, @usuario_teste, 'status', 'Aberta', 'Em andamento', NOW());

-- 4) UPDATE: altera o status e verifica o historico correspondente.
UPDATE demanda
SET status = 'Em andamento', data_atualizacao = NOW()
WHERE id_demanda = @demanda_teste;

SELECT
  d.id_demanda,
  d.status,
  h.campo,
  h.valor_anterior,
  h.valor_novo,
  (d.status = 'Em andamento'
   AND h.valor_anterior = 'Aberta'
   AND h.valor_novo = 'Em andamento') AS update_e_historico_ok
FROM demanda d
JOIN historico h ON h.id_demanda = d.id_demanda
WHERE d.id_demanda = @demanda_teste
ORDER BY h.id_historico DESC
LIMIT 1;

-- 5) Cancelamento logico: altera o status, sem apagar a demanda.
INSERT INTO historico
  (id_demanda, id_usuario, campo, valor_anterior, valor_novo, data_hora)
VALUES
  (@demanda_teste, @usuario_teste, 'status', 'Em andamento', 'Cancelada', NOW());

UPDATE demanda
SET status = 'Cancelada', data_atualizacao = NOW()
WHERE id_demanda = @demanda_teste;

SELECT
  id_demanda,
  status,
  (status = 'Cancelada') AS cancelamento_ok,
  (SELECT COUNT(*) FROM demanda x
   WHERE x.id_demanda = @demanda_teste) AS demanda_ainda_existe,
  (SELECT COUNT(*) FROM historico h
   WHERE h.id_demanda = @demanda_teste) AS quantidade_historicos
FROM demanda
WHERE id_demanda = @demanda_teste;

-- 6) Integridade referencial: deve retornar zero em todas as colunas.
SELECT
  (SELECT COUNT(*) FROM demanda d
   LEFT JOIN projeto p ON p.id_projeto = d.id_projeto
   WHERE p.id_projeto IS NULL) AS demandas_sem_projeto,
  (SELECT COUNT(*) FROM demanda d
   LEFT JOIN usuario u ON u.id_usuario = d.id_responsavel
   WHERE d.id_responsavel IS NOT NULL AND u.id_usuario IS NULL) AS responsaveis_invalidos,
  (SELECT COUNT(*) FROM historico h
   LEFT JOIN demanda d ON d.id_demanda = h.id_demanda
   WHERE d.id_demanda IS NULL) AS historicos_sem_demanda,
  (SELECT COUNT(*) FROM historico h
   LEFT JOIN usuario u ON u.id_usuario = h.id_usuario
   WHERE u.id_usuario IS NULL) AS historicos_sem_usuario;

-- 7) O campo TEXT deve aceitar valores maiores que 255 caracteres.
INSERT INTO historico
  (id_demanda, id_usuario, campo, valor_anterior, valor_novo, data_hora)
VALUES
  (@demanda_teste, @usuario_teste, 'descricao',
   REPEAT('A', 300), REPEAT('B', 300), NOW());

SELECT
  CHAR_LENGTH(valor_anterior) AS tamanho_anterior,
  CHAR_LENGTH(valor_novo) AS tamanho_novo,
  (CHAR_LENGTH(valor_anterior) = 300
   AND CHAR_LENGTH(valor_novo) = 300) AS text_maior_255_ok
FROM historico
WHERE id_demanda = @demanda_teste
ORDER BY id_historico DESC
LIMIT 1;

-- Desfaz todos os registros de teste: o banco fica como estava.
ROLLBACK;
