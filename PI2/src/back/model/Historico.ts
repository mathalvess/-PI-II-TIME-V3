/* Historico automatico das alteracoes de demandas. */
import { RowDataPacket, ResultSetHeader } from "mysql2";
import Banco from "./Banco";

export default class Historico {
    async listar(id_demanda: number): Promise<RowDataPacket[]> {
        const conexao = new Banco().getConexao();
        const sql = `SELECT h.id_historico, h.id_demanda, h.campo, h.valor_anterior,
                            h.valor_novo, h.data_hora, u.nome
                     FROM historico h
                     JOIN usuario u ON u.id_usuario = h.id_usuario
                     WHERE h.id_demanda = ?
                     ORDER BY h.data_hora DESC, h.id_historico DESC;`;
        const [linhas] = await conexao.promise().execute<RowDataPacket[]>(sql, [id_demanda]);
        return linhas;
    }

    async registrar(
        id_demanda: number,
        id_usuario: number,
        campo: string,
        valor_anterior: string | null,
        valor_novo: string | null
    ): Promise<boolean> {
        const conexao = new Banco().getConexao();
        const sql = `INSERT INTO historico
                     (id_demanda, id_usuario, campo, valor_anterior, valor_novo, data_hora)
                     VALUES (?, ?, ?, ?, ?, NOW());`;
        const [resultado] = await conexao.promise().execute<ResultSetHeader>(sql, [
            id_demanda, id_usuario, campo, valor_anterior, valor_novo
        ]);
        return resultado.affectedRows > 0;
    }
}
