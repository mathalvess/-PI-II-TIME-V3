/*
 * Autor: Eduardo Campos Ferreira Filho
 * Middleware Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response, NextFunction } from "express";

export default class LoginMiddleware {

    validar_DadosLogin(request: Request, response: Response, next: NextFunction) {
        const dados = request.body || {};
        const email = dados.email;
        const senha = dados.senha;
        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        let msg = "";

        if (!email) {
            msg = "Informe o e-mail";
        } else if (!formatoEmail.test(email)) {
            msg = "E-mail invalido";
        } else if (!senha) {
            msg = "Informe a senha";
        }

        if (msg !== "") {
            response.status(400).send({ cod: 1, status: false, msg: msg });
        } else {
            next();
        }
    }
}
