/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Model Demanda - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Mesmo padrao do projeto de Aluno/Curso: classe com atributos privados,
 * getters e setters e metodos assincronos (create, readAll, readByID...),
 * agora usando SQL simples (INSERT, SELECT e UPDATE) no banco MySQL
 * (script em banco/schema.sql).
 */

// Tipos do driver: RowDataPacket = uma linha de resultado de SELECT;
// ResultSetHeader = o resumo que o MySQL devolve depois de INSERT/UPDATE.
import { RowDataPacket, ResultSetHeader } from "mysql2";
import Banco from "./Banco";

// "export const" deixa a constante disponivel para outros arquivos importarem.
// "string[]" quer dizer "lista de textos" (em Java seria List<String>).
// Valores permitidos pelo documento de escopo (iguais aos ENUM do banco).
export const TIPOS: string[] = ["Tarefa", "Defeito", "Melhoria", "Documentacao"];
export const PRIORIDADES: string[] = ["Critica", "Alta", "Media", "Baixa"];

// "Record<string, string[]>" e um objeto em que a chave e um texto e o valor
// e uma lista de textos (parecido com o array associativo do PHP).
// Aqui: cada status aponta para a lista dos status para os quais ele pode ir.
// Nao existe Em andamento -> Concluida direto, nem Em andamento -> Aberta.
// O cancelamento vale para qualquer status, desde que a demanda ainda nao
// esteja concluida (item 2.2.4 do documento de visao).
export const TRANSICOES: Record<string, string[]> = {
    "Aberta": ["Em andamento", "Cancelada"],
    "Em andamento": ["Em revisao", "Cancelada"],
    "Em revisao": ["Em andamento", "Concluida", "Cancelada"],
    "Concluida": [],
    "Cancelada": [],
};

// "export default class" exporta a classe como a principal do arquivo.
export default class Demanda {
    // Em TypeScript o tipo vem DEPOIS do nome (": tipo"), ao contrario do Java.
    // "number | null" quer dizer "um numero OU nulo" (o ID so existe depois de criar).
    private _id: number | null = null;
    private _titulo: string = "";
    private _descricao: string = "";
    private _tipo: string = "";
    private _prioridade: string = "";
    private _status: string = "Aberta"; // toda demanda comeca como Aberta
    private _id_projeto: number | null = null;
    // O responsavel pode ficar em branco (demanda nao atribuida).
    private _id_responsavel: number | null = null;
    // O prazo e guardado como texto no formato AAAA-MM-DD.
    private _prazo: string | null = null;

    // Cria uma nova demanda no banco.
    // "async" faz o metodo devolver uma Promise; "await" espera o banco responder.
    async create(): Promise<boolean> {
        // Pega o pool de conexoes com o banco.
        const conexao = new Banco().getConexao();

        // Os "?" sao preenchidos pelos valores da lista abaixo, na mesma ordem.
        // Isso evita SQL Injection (o valor nunca e colado direto no texto do SQL).
        // 'Aberta' e fixo (toda demanda nasce Aberta) e NOW() e a data e hora de agora.
        const SQL = "INSERT INTO demanda (titulo, descricao, tipo, prioridade, status, id_projeto, id_responsavel, data_criacao, data_atualizacao, prazo) VALUES (?, ?, ?, ?, 'Aberta', ?, ?, NOW(), NOW(), ?);";

        try {
            // "const [result]" pega so o primeiro item do que o execute() devolve.
            const [result] = await conexao.promise().execute<ResultSetHeader>(SQL, [
                this._titulo,
                this._descricao,
                this._tipo,
                this._prioridade,
                this._id_projeto,
                this._id_responsavel,
                this._prazo,
            ]);
            // Guarda o ID que o banco gerou (AUTO_INCREMENT).
            this._id = result.insertId;
            // affectedRows = quantas linhas foram gravadas; maior que 0 = deu certo.
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao criar a demanda:', error); // Mostra o erro no terminal.
            return false; // Devolve false para o control avisar que deu erro.
        }
    }

    // Edita os dados de uma demanda que ja existe (o status tem metodo proprio: updateStatus).
    async update(): Promise<boolean> {
        const conexao = new Banco().getConexao();
        // Troca todos os campos editaveis e a data da ultima atualizacao.
        // O WHERE garante que so a demanda com esse id e alterada (sem ele, mudaria todas!).
        const SQL = 'UPDATE demanda SET titulo = ?, descricao = ?, tipo = ?, prioridade = ?, id_projeto = ?, id_responsavel = ?, prazo = ?, data_atualizacao = NOW() WHERE id_demanda = ?;';
        try {
            const [result] = await conexao.promise().execute<ResultSetHeader>(SQL, [
                this._titulo,
                this._descricao,
                this._tipo,
                this._prioridade,
                this._id_projeto,
                this._id_responsavel,
                this._prazo,
                this._id,
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao atualizar a demanda:', error);
            return false;
        }
    }

    // Lista todas as demandas. Se o banco falhar, o erro sobe e o Express responde 500.
    async readAll(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT * FROM demanda ORDER BY id_demanda DESC;'; // SELECT * traz todas as colunas
        // O SELECT devolve uma lista de linhas; "rows" e essa lista.
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // Busca uma demanda pelo ID (devolve uma lista, como no projeto de Curso:
    // com 1 item se achou, vazia se nao achou).
    async readByID(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT * FROM demanda WHERE id_demanda = ?;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL, [this._id]);
        return rows;
    }

    // Atualiza o status de uma demanda e a data da ultima atualizacao.
    async updateStatus(): Promise<boolean> {
        const conexao = new Banco().getConexao();
        const SQL = 'UPDATE demanda SET status = ?, data_atualizacao = NOW() WHERE id_demanda = ?;';
        try {
            const [result] = await conexao.promise().execute<ResultSetHeader>(SQL, [
                this._status,
                this._id,
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao atualizar o status da demanda:', error);
            return false;
        }
    }

    // ---- Consultas do dashboard (item 2.4 do documento de visao) ----

    // Conta quantas demandas existem em cada status. GROUP BY agrupa as linhas
    // que tem o mesmo valor e COUNT(*) conta quantas linhas tem cada grupo.
    async contarPorStatus(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT status, COUNT(*) AS qtd FROM demanda GROUP BY status;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // Conta quantas demandas existem em cada prioridade.
    async contarPorPrioridade(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT prioridade, COUNT(*) AS qtd FROM demanda GROUP BY prioridade;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // Conta quantas demandas existem em cada tipo.
    async contarPorTipo(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT tipo, COUNT(*) AS qtd FROM demanda GROUP BY tipo;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // Demandas criticas que ainda estao em aberto (nem concluidas, nem canceladas).
    // "<>" quer dizer "diferente de".
    async readCriticasEmAberto(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT * FROM demanda WHERE prioridade = 'Critica' AND status <> 'Concluida' AND status <> 'Cancelada' ORDER BY prazo;";
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // As 5 demandas em aberto com o prazo mais proximo (so as que tem prazo definido).
    // "LIMIT 5" devolve no maximo 5 linhas.
    async readProximasDoPrazo(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT * FROM demanda WHERE prazo IS NOT NULL AND status <> 'Concluida' AND status <> 'Cancelada' ORDER BY prazo;";
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // Confere se o projeto informado existe no banco (usado no middleware).
    async isId_projeto(): Promise<boolean> {
        const conexao = new Banco().getConexao();
        // COUNT(*) conta quantas linhas atendem a condicao; "AS qtd" da um nome a coluna.
        const SQL = 'SELECT COUNT(*) AS qtd FROM projeto WHERE id_projeto = ?;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL, [this._id_projeto]);
        return rows[0].qtd > 0;
    }

    // Confere se o responsavel informado existe como usuario no banco.
    async isId_responsavel(): Promise<boolean> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT COUNT(*) AS qtd FROM usuario WHERE id_usuario = ?;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL, [this._id_responsavel]);
        return rows[0].qtd > 0;
    }

    // Getters e Setters.
    // "get" e "set" funcionam como propriedade: demanda.titulo = "x" chama o set,
    // e demanda.titulo chama o get (diferente do Java, que usa getTitulo()).
    get id(): number | null { return this._id; }
    set id(id: number | null) { this._id = id; }

    get titulo(): string { return this._titulo; }
    set titulo(titulo: string) { this._titulo = titulo; }

    get descricao(): string { return this._descricao; }
    set descricao(descricao: string) { this._descricao = descricao; }

    get tipo(): string { return this._tipo; }
    set tipo(tipo: string) { this._tipo = tipo; }

    get prioridade(): string { return this._prioridade; }
    set prioridade(prioridade: string) { this._prioridade = prioridade; }

    get status(): string { return this._status; }
    set status(status: string) { this._status = status; }

    get id_projeto(): number | null { return this._id_projeto; }
    set id_projeto(id_projeto: number | null) { this._id_projeto = id_projeto; }

    get id_responsavel(): number | null { return this._id_responsavel; }
    set id_responsavel(id_responsavel: number | null) { this._id_responsavel = id_responsavel; }

    get prazo(): string | null { return this._prazo; }
    set prazo(prazo: string | null) { this._prazo = prazo; }
}
