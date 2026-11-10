/*
 * Autor: Eduardo Campos Ferreira Filho
 * Middleware Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response, NextFunction } from "express";

// O seguranca do login: ve se o pedido veio completo antes de incomodar o banco.
// Se a senha ta certa ou nao, quem responde e o banco, nao aqui.
export default class LoginMiddleware {

    validar_DadosLogin(request: Request, response: Response, next: NextFunction) {
        // Se mandarem o pedido vazio, usa um {} pra nao quebrar o servidor.
        const dados = request.body || {};
        const email = dados.email;
        const senha = dados.senha;
        // Mesma regra do login.js: texto, @, texto, ponto e pelo menos 2 letras.
        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        // Se continuar vazio la embaixo, ta tudo certo.
        let msg = "";

        // Olha um de cada vez e fica no primeiro problema que achar.
        if (!email) {
            msg = "Informe o e-mail";
        } else if (!formatoEmail.test(email)) {
            msg = "E-mail invalido";
        } else if (!senha) {
            msg = "Informe a senha";
        }

        // Deu problema: responde 400 e o pedido para aqui. Se nao, o next() deixa seguir.
        if (msg !== "") {
            response.status(400).send({ cod: 1, status: false, msg: msg });
        } else {
            next();
        }
    }
}
