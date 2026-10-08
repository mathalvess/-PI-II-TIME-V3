/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Model Usuario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Por enquanto so le a lista de usuarios (para escolher o responsavel de uma
 * demanda). O login e as permissoes por perfil entram numa proxima etapa.
 */

import { RowDataPacket } from "mysql2";
import Banco from "./Banco";

export default class Usuario {
    private _id: number | null = null;
    private _nome: string = "";
    private _perfil: string = "";

    // Lista os usuarios. De proposito NAO traz a coluna senha, nem o email.
    async readAll(): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = 'SELECT id_usuario, nome, perfil FROM usuario ORDER BY nome;';
        const [rows] = await conexao.promise().execute<RowDataPacket[]>(SQL);
        return rows;
    }

    // Getters e Setters
    get id(): number | null { return this._id; }
    set id(id: number | null) { this._id = id; }

    get nome(): string { return this._nome; }
    set nome(nome: string) { this._nome = nome; }

    get perfil(): string { return this._perfil; }
    set perfil(perfil: string) { this._perfil = perfil; }
}
