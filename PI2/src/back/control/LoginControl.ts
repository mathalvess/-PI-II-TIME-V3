/*
 * Autor: Eduardo Campos Ferreira Filho
 * Control Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response } from "express";
import Login from "../model/Login";

// Quem decide a resposta do login. So chega aqui se o middleware deixou passar.
export default class LoginControl {

    async login_control(request: Request, response: Response) {
        const email = request.body.email;
        const senha = request.body.senha;

        // Pede pro model procurar a pessoa no banco.
        const login = new Login();
        const resultado = await login.buscarUsuario(email, senha);

        // Nao achou ninguem. A mensagem e igual pra e-mail e senha errados de proposito,
        // senao daria pra descobrir quais e-mails existem no sistema.
        if (resultado.length === 0) {
            response.status(401).send({ cod: 1, status: false, msg: "E-mail ou senha incorretos" });
        } else {
            // Achou: devolve id, nome e perfil, pra tela saber quem entrou.
            response.status(200).send({ cod: 1, status: true, msg: "Login realizado com sucesso", usuario: resultado[0] });
        }
    }
}
