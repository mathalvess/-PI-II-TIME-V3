# PI-II-TIME V3

## Projeto Integrador II

### Integrantes

* Matheus Augusto Alves - 26011776
* Luis Felipe Viotto Martins - 26006047
* Lucas Marassi Cipriano Pererira - 260066147
* Pedro Henrique Bassetto Ruiz - 26001779
* Eduardo Campos Ferreira Filho - 26002602
### Curso

Engenharia de Software

### Componente Curricular

Projeto Integrador II

### Semestre/Ano

2º semestre de 2026

### Professora Orientadora

Fernando Silveira
---

## Sobre o Projeto

Repositório destinado ao desenvolvimento e acompanhamento das atividades do Projeto Integrador II.

As atividades serão organizadas e acompanhadas por meio do GitHub Projects, permitindo o controle das tarefas e do desenvolvimento do projeto ao longo do semestre.

---

## Como rodar o projeto

### Requisitos
- Node.js LTS (confira com `node -v`)
- MySQL 8

### 1. Banco de dados
Entre na pasta `PI2` e crie o banco com os dados de exemplo:
```bash
cd PI2
mysql -u root -p < banco/schema.sql
```

### 2. Configuração
Ainda na pasta `PI2`, copie o modelo de configuração e coloque a senha do seu MySQL em `DB_SENHA`:
```bash
cp .env.example .env
```
(No Windows: `copy .env.example .env`)

### 3. Instalar e iniciar
Ainda na pasta `PI2`:
```bash
npm install
npm run dev
```

### 4. Acessar
Abra http://localhost:3000 e entre com `lucas@sad.com` e a senha `Senha@123` (usuário de teste criado pelo `schema.sql`).

A validação de feriados nacionais consulta a BrasilAPI, então o computador precisa estar com internet.