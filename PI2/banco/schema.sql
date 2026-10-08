-- Autor: Lucas Marassi Cipriano Pereira
-- Script do banco de dados - Sistema de Acompanhamento de Demandas
-- Projeto Integrador 2 (MySQL)
--
-- Como executar (na raiz do projeto):
--   mysql -u root -p < banco/schema.sql
--
-- Para recriar o banco do zero, apague o antigo antes:
--   DROP DATABASE sad_demandas;
--
-- Regras do documento de visao:
--  - Nao existe exclusao fisica: o sistema nunca usa DELETE, so troca o
--    status da demanda para Cancelada.
--  - Toda demanda nasce com status Aberta e pertence a um projeto.
--  - O responsavel pode ficar em branco (NULL).
--  - Projetos e usuarios podem ser inseridos direto no banco.

-- Cria o banco de dados e passa a usa-lo
CREATE DATABASE sad_demandas;
USE sad_demandas;

-- Usuario: quem faz login. A senha e guardada com MD5, nunca como texto puro.
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    perfil VARCHAR(30) NOT NULL   -- Administrador, Lider de Projeto ou Membro da Equipe
);

-- Projeto: cada projeto tem varias demandas
CREATE TABLE projeto (
    id_projeto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255)
);

-- Quais usuarios participam de cada projeto
CREATE TABLE projeto_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_projeto INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_projeto) REFERENCES projeto (id_projeto),
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

-- Demanda: a principal tabela do sistema
CREATE TABLE demanda (
    id_demanda INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    descricao TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL,         -- Tarefa, Defeito, Melhoria ou Documentacao
    prioridade VARCHAR(10) NOT NULL,   -- Critica, Alta, Media ou Baixa
    status VARCHAR(20) NOT NULL,       -- Aberta, Em andamento, Em revisao, Concluida ou Cancelada
    id_projeto INT NOT NULL,
    id_responsavel INT,                -- pode ficar vazio (NULL)
    data_criacao DATETIME NOT NULL,
    data_atualizacao DATETIME NOT NULL,
    prazo DATE,
    FOREIGN KEY (id_projeto) REFERENCES projeto (id_projeto),
    FOREIGN KEY (id_responsavel) REFERENCES usuario (id_usuario)
);

-- Comentario: ligado a uma demanda e a um usuario, com data e hora
CREATE TABLE comentario (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_demanda INT NOT NULL,
    id_usuario INT NOT NULL,
    texto TEXT NOT NULL,
    data_hora DATETIME NOT NULL,
    FOREIGN KEY (id_demanda) REFERENCES demanda (id_demanda),
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

-- Historico: uma linha para cada alteracao feita em uma demanda (nunca e apagado)
CREATE TABLE historico (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_demanda INT NOT NULL,
    id_usuario INT NOT NULL,
    campo VARCHAR(30) NOT NULL,        -- ex.: status, prioridade, responsavel, prazo
    valor_anterior VARCHAR(255),
    valor_novo VARCHAR(255),
    data_hora DATETIME NOT NULL,
    FOREIGN KEY (id_demanda) REFERENCES demanda (id_demanda),
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

-- ---------------------------------------------------------------------------
-- DADOS DE EXEMPLO (somente para desenvolvimento)
-- Todos os usuarios usam a senha de teste Senha@123.
-- A funcao MD5() do MySQL embaralha a senha antes de gravar.
-- ---------------------------------------------------------------------------
INSERT INTO usuario (nome, email, senha, perfil) VALUES
('Lucas Marassi', 'lucas@sad.com', MD5('Senha@123'), 'Administrador'),
('Ana Ribeiro',   'ana@sad.com',   MD5('Senha@123'), 'Lider de Projeto'),
('Joao Almeida',  'joao@sad.com',  MD5('Senha@123'), 'Membro da Equipe'),
('Maria Souza',   'maria@sad.com', MD5('Senha@123'), 'Membro da Equipe');

INSERT INTO projeto (nome, descricao) VALUES
('Portal do Cliente', 'Portal web de atendimento ao cliente'),
('ERP Interno',       'Sistema interno de gestao'),
('Aplicativo Mobile', 'Aplicativo para celular');

INSERT INTO projeto_usuario (id_projeto, id_usuario) VALUES
(1, 2), (1, 3),
(2, 2), (2, 4),
(3, 2), (3, 3), (3, 4);

INSERT INTO demanda (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, data_criacao, data_atualizacao, prazo) VALUES
('Falha no login apos expiracao do token', 'O usuario e deslogado sem aviso quando o token expira.',
 'Defeito', 'Critica', 'Aberta', 1, NULL, NOW(), NOW(), '2026-09-10'),
('Implementar filtro por responsavel', 'Acrescentar o filtro por responsavel na listagem.',
 'Tarefa', 'Alta', 'Em andamento', 1, 3, NOW(), NOW(), '2026-09-19'),
('Atualizar manual de instalacao', 'Revisar o passo a passo de instalacao.',
 'Documentacao', 'Media', 'Em revisao', 3, 3, NOW(), NOW(), '2026-09-13');

INSERT INTO comentario (id_demanda, id_usuario, texto, data_hora) VALUES
(2, 2, 'Sugiro usar o mesmo select ja usado no filtro de prioridade.', NOW());

INSERT INTO historico (id_demanda, id_usuario, campo, valor_anterior, valor_novo, data_hora) VALUES
(1, 1, 'status', NULL, 'Aberta', NOW()),
(2, 1, 'status', NULL, 'Aberta', NOW()),
(2, 3, 'status', 'Aberta', 'Em andamento', NOW()),
(3, 1, 'status', NULL, 'Aberta', NOW()),
(3, 3, 'status', 'Aberta', 'Em andamento', NOW()),
(3, 3, 'status', 'Em andamento', 'Em revisao', NOW());
