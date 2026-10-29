/*
 * Autor: Pedro Henrique Bassetto Ruiz
 * Middleware Feriado - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Roda antes do cadastro e da edicao de demanda. Se o prazo de finalizacao
 * cair em feriado nacional, responde com erro e impede salvar (escopo 2.2.5).
 */

import { Request, Response, NextFunction } from "express";
import { buscarFeriadoNacional } from "../util/feriados";

export default class FeriadoMiddleware {

    // Confere se o prazo informado e feriado nacional.
    async validar_PrazoFeriado(request: Request, response: Response, next: NextFunction) {
        // O prazo vem dentro de "demanda": { "demanda": { "prazo": "2026-12-25" } }.
        const prazo: string | undefined = request.body?.demanda?.prazo;

        // O prazo e opcional: se nao veio, nao tem o que conferir.
        if (!prazo) {
            next();
            return;
        }

        try {
            // Pergunta para a BrasilAPI se a data e feriado.
            const nomeFeriado = await buscarFeriadoNacional(prazo);

            if (nomeFeriado) {
                // E feriado: bloqueia o cadastro/edicao com uma mensagem clara.
                const objResposta = {
                    cod: 1,
                    status: false,
                    msg: `O prazo nao pode ser em feriado nacional (${nomeFeriado})`,
                };
                // 400 = requisicao invalida.
                response.status(400).send(objResposta);
            } else {
                next(); // Nao e feriado: segue para o proximo passo.
            }
        } catch (erro) {
            // A API externa nao respondeu (sem internet ou fora do ar).
            // Como a regra e obrigatoria, nao salva sem conseguir conferir.
            const objResposta = {
                cod: 1,
                status: false,
                msg: "Nao foi possivel verificar feriados agora. Tente novamente em instantes.",
            };
            // 503 = servico indisponivel.
            response.status(503).send(objResposta);
        }
    }
}