/*
 * Autor: Eduardo Campos Ferreira Filho
 * Model Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { RowDataPacket } from "mysql2";
import Banco from "./Banco";

export default class Login {

    async buscarUsuario(email: string, senha: string): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const SQL = "SELECT id_usuario, nome, perfil FROM usuario WHERE email = ? AND senha = MD5(?);";
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(SQL, [email, senha]);
        return linhas;
    }
}
