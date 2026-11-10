/*
 * Autor: Pedro Henrique Bassetto Ruiz
 * Control Feriado - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Responde se uma data e feriado nacional. A tela de cadastro usa esta
 * rota para avisar o usuario assim que ele escolhe o prazo, antes de salvar.
 * A consulta a BrasilAPI (com cache) fica em util/feriados.ts.
 */

import { Request, Response } from "express";
import { ehFeriadoNacional } from "../util/feriados";

export default class FeriadoControl {

    // GET /feriado/2026-12-25 -> { feriado: true }
    async feriado_verificar_control(request: Request, response: Response) {
        // A data vem na URL no formato AAAA-MM-DD (o mesmo do campo de prazo).
        const data = String(request.params.data);

        // Confere o formato antes de chamar a API externa.
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            response.status(400).send({ cod: 1, status: false, msg: "Data invalida. Use AAAA-MM-DD." });
            return;
        }

        try {
            const feriado = await ehFeriadoNacional(data);
            response.status(200).send({ cod: 1, status: true, msg: "Executado com sucesso", data: data, feriado: feriado });
        } catch (erro) {
            // Data que nao existe (ex.: 2026-02-30) ou BrasilAPI fora do ar.
            const mensagem = erro instanceof Error ? erro.message : "Erro ao consultar feriados";
            if (mensagem.startsWith("Data inv")) {
                response.status(400).send({ cod: 1, status: false, msg: mensagem });
            } else {
                console.error("Falha ao consultar feriado:", erro);
                response.status(503).send({ cod: 1, status: false, msg: "Nao foi possivel consultar os feriados agora." });
            }
        }
    }
}