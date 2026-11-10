/*
 * Autor: Eduardo Campos Ferreira Filho
 * Middleware Comentario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response, NextFunction } from "express";

// Nao deixa passar comentario vazio nem gigante.
export default class ComentarioMiddleware {

    validar_Texto(request: Request, response: Response, next: NextFunction) {
        // Se mandarem o pedido vazio, usa um {} pra nao quebrar o servidor.
        const dados = request.body || {};
        const texto = dados.texto;

        let msg = "";

        // O trim e pra pegar tambem quem manda so espaco.
        if (!texto || texto.trim() === "") {
            msg = "Escreva o comentario";
        } else if (texto.length > 1000) {
            msg = "O comentario deve ter no maximo 1000 caracteres";
        }

        // Deu problema: responde 400 e para aqui. Se nao, segue pro control.
        if (msg !== "") {
            response.status(400).send({ cod: 1, status: false, msg: msg });
        } else {
            next();
        }
    }
}
