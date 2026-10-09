/*
 * Autor: Eduardo Campos Ferreira Filho
 * Router Login - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import express from "express";
import LoginControl from "../control/LoginControl";
import LoginMiddleware from "../middleware/LoginMiddleware";

export default class LoginRouter {
    private _router: express.Router;
    private _loginControl: LoginControl;
    private _loginMiddleware: LoginMiddleware;

    constructor() {
        this._router = express.Router();
        this._loginControl = new LoginControl();
        this._loginMiddleware = new LoginMiddleware();
    }

    criarRotasLogin() {
        this._router.post("/",
            this._loginMiddleware.validar_DadosLogin,
            this._loginControl.login_control
        );
        return this._router;
    }
}
