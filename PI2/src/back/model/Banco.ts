/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Classe Banco - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Mesmo papel da classe Banco do projeto anterior: entrega a conexao com o
 * MySQL para os models. A diferenca e que aqui usamos um "pool" (um grupo de
 * conexoes reaproveitadas), em vez de abrir uma conexao nova a cada consulta.
 */

// Importa o driver do MySQL (pacote mysql2).
import mysql from "mysql2";
// Le o arquivo ".env" da raiz do projeto e coloca os valores dele em process.env.
// Assim o usuario e a senha do MySQL ficam fora do codigo (o .env nao vai para o GitHub).
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export default class Banco {
    // "static" = existe um unico pool para o sistema todo, compartilhado por todos os objetos.
    // "mysql.Pool | null" = ou e um pool, ou ainda nao foi criado (nulo).
    private static pool: mysql.Pool | null = null;

    // Devolve o pool de conexoes (cria na primeira vez que for pedido).
    getConexao(): mysql.Pool {
        if (Banco.pool === null) {
            Banco.pool = mysql.createPool({
                // "process.env.X" le uma variavel de ambiente; "??" usa o valor padrao se ela nao existir.
                // Os valores vem do arquivo .env (cada pessoa do grupo tem o seu, com a propria senha).
                host: process.env.DB_HOST ?? "127.0.0.1",
                port: Number(process.env.DB_PORTA ?? 3306),
                user: process.env.DB_USUARIO ?? "root",
                password: process.env.DB_SENHA ?? "",
                database: process.env.DB_BANCO ?? "sad_demandas",
                connectionLimit: 10,
                // Faz as colunas de data voltarem como texto (2026-09-19) e nao como objeto Date.
                dateStrings: true,
            });
        }
        return Banco.pool;
    }
}
