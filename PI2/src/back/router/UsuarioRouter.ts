/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Router Usuario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import express from "express";
import UsuarioControl from "../control/UsuarioControl";

export default class UsuarioRouter {
    private _router: express.Router;
    private _usuarioControl: UsuarioControl;

    constructor() {
        this._router = express.Router();
        this._usuarioControl = new UsuarioControl();
    }

    // GET /usuario -> lista os usuarios. (O login, POST /usuario/login, vem depois.)
    criarRotasUsuario() {
        this._router.get("/",
            this._usuarioControl.usuario_read_all_control
        );
        return this._router;
    }
}
