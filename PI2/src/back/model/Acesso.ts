/*
 * Autor: Eduardo Campos Ferreira Filho
 * Model Acesso - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { RowDataPacket } from "mysql2";
import Banco from "./Banco";

export default class Acesso {

    async buscarUsuario(id_usuario: number): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT id_usuario, nome, perfil FROM usuario WHERE id_usuario = ?;";
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(SQL, [id_usuario]);
        return linhas;
    }

    async buscarProjetosDoUsuario(id_usuario: number): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT id_projeto FROM projeto_usuario WHERE id_usuario = ?;";
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(SQL, [id_usuario]);
        return linhas;
    }
}
