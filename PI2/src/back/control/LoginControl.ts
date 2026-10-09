/*
 * Autor: Eduardo Campos Ferreira Filho
 * Control Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response } from "express";
import Login from "../model/Login";

export default class LoginControl {

    async login_control(request: Request, response: Response) {
        const email = request.body.email;
        const senha = request.body.senha;

        const login = new Login();
        const resultado = await login.buscarUsuario(email, senha);

        if (resultado.length === 0) {
            response.status(401).send({ cod: 1, status: false, msg: "E-mail ou senha incorretos" });
        } else {
            response.status(200).send({ cod: 1, status: true, msg: "Login realizado com sucesso", usuario: resultado[0] });
        }
    }
}
