/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Model Projeto - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Por enquanto so le os projetos (o documento permite cadastra-los direto no
 * banco). A lista serve para preencher o select de projeto no cadastro de
 * demanda e para mostrar o nome do projeto na listagem.
 */

import { RowDataPacket } from "mysql2";
import Banco from "./Banco";

export default class Projeto {
    private _id: number | null = null;
    private _nome: string = "";
    private _descricao: string = "";

    // Lista todos os projetos, em ordem alfabetica.
    async readAll(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT id_projeto, nome, descricao FROM projeto ORDER BY nome;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // Getters e Setters
    get id(): number | null { return this._id; }
    set id(id: number | null) { this._id = id; }

    get nome(): string { return this._nome; }
    set nome(nome: string) { this._nome = nome; }

    get descricao(): string { return this._descricao; }
    set descricao(descricao: string) { this._descricao = descricao; }
}
