/*
 * Autor: Eduardo Campos Ferreira Filho
 * Model Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { RowDataPacket } from "mysql2";
import Banco from "./Banco";

// Aqui e a parte do login que realmente conversa com o banco.
export default class Login {

    // Procura alguem com esse e-mail e essa senha. Se nao achar, volta lista vazia.
    async buscarUsuario(email: string, senha: string): Promise<RowDataPacket[]> {
        // Pega a conexao com o MySQL (quem sabe fazer isso e o Banco.ts).
        const conexao = new Banco().getConexao();
        // O SHA2 embaralha a senha digitada pra comparar com a que ta guardada.
        // Os ? sao preenchidos depois, assim ninguem consegue mandar comando pelo campo de texto.
        // E nem pede a coluna senha, ela nao precisa sair do banco.
        const SQL = "SELECT id_usuario, nome, perfil FROM usuario WHERE email = ? AND senha = SHA2(?, 256);";
        // Manda a pergunta e espera. O e-mail entra no primeiro ? e a senha no segundo.
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(SQL, [email, senha]);
        return linhas;
    }
}
