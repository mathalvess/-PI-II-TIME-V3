/*
 * Autor: Eduardo Campos Ferreira Filho
 * Model Comentario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { RowDataPacket, ResultSetHeader } from "mysql2";
import Banco from "./Banco";

export default class Comentario {

    async listar(id_demanda: number): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT c.id_comentario, c.texto, c.data_hora, u.nome FROM comentario c JOIN usuario u ON u.id_usuario = c.id_usuario WHERE c.id_demanda = ? ORDER BY c.data_hora;";
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(SQL, [id_demanda]);
        return linhas;
    }

    async criar(id_demanda: number, id_usuario: number, texto: string): Promise<boolean> {
        const conexao = new Banco().getConexao();
        const SQL = "INSERT INTO comentario (id_demanda, id_usuario, texto, data_hora) VALUES (?, ?, ?, NOW());";
        const [resultado] = await conexao.promise().execute<ResultSetHeader>(SQL, [id_demanda, id_usuario, texto]);
        return resultado.affectedRows > 0;
    }
}
