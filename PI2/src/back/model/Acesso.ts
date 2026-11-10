/*
 * Autor: Eduardo Campos Ferreira Filho
 * Model Acesso - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { RowDataPacket } from "mysql2";
import Banco from "./Banco";

// Busca no banco os dados que a gente precisa pra saber o que cada um pode fazer.
export default class Acesso {

    // Dado o numero do usuario, descobre o nome e o perfil dele.
    async buscarUsuario(id_usuario: number): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT id_usuario, nome, perfil FROM usuario WHERE id_usuario = ?;";
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(SQL, [id_usuario]);
        return linhas;
    }

    // Ve na tabela projeto_usuario de quais projetos essa pessoa participa.
    async buscarProjetosDoUsuario(id_usuario: number): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT id_projeto FROM projeto_usuario WHERE id_usuario = ?;";
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(SQL, [id_usuario]);
        return linhas;
    }
}
