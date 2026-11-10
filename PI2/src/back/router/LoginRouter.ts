/*
 * Autor: Eduardo Campos Ferreira Filho
 * Router Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import express from "express";
import LoginControl from "../control/LoginControl";
import LoginMiddleware from "../middleware/LoginMiddleware";

// Esse aqui so define o caminho do login: qual endereco existe e por onde o pedido passa.
export default class LoginRouter {
    private _router: express.Router;
    private _loginControl: LoginControl;
    private _loginMiddleware: LoginMiddleware;

    // Roda uma vez so, quando o app.ts faz new LoginRouter(). Ja deixa tudo pronto pra usar.
    constructor() {
        this._router = express.Router();
        this._loginControl = new LoginControl();
        this._loginMiddleware = new LoginMiddleware();
    }

    // No app.ts isso aqui ta pendurado em /login, entao o "/" de baixo vira POST /login.
    criarRotasLogin() {
        // Primeiro o middleware olha se veio e-mail e senha. Se tiver ok, vai pro control.
        this._router.post("/",
            this._loginMiddleware.validar_DadosLogin,
            this._loginControl.login_control
        );
        return this._router;
    }
}
