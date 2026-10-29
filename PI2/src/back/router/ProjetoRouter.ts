/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Router Projeto - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import express from "express";
import ProjetoControl from "../control/ProjetoControl";

export default class ProjetoRouter {
    private _router: express.Router;
    private _projetoControl: ProjetoControl;

    constructor() {
        this._router = express.Router();
        this._projetoControl = new ProjetoControl();
    }

    // GET /projeto -> lista todos os projetos.
    criarRotasProjeto() {
        this._router.get("/",
            this._projetoControl.projeto_read_all_control
        );
        return this._router;
    }
}
