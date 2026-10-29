/*
 * Autor: Eduardo Campos Ferreira Filho
 * Middleware Comentario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response, NextFunction } from "express";

export default class ComentarioMiddleware {

    validar_Texto(request: Request, response: Response, next: NextFunction) {
        const dados = request.body || {};
        const texto = dados.texto;

        let msg = "";

        if (!texto || texto.trim() === "") {
            msg = "Escreva o comentario";
        } else if (texto.length > 1000) {
            msg = "O comentario deve ter no maximo 1000 caracteres";
        }

        if (msg !== "") {
            response.status(400).send({ cod: 1, status: false, msg: msg });
        } else {
            next();
        }
    }
}
