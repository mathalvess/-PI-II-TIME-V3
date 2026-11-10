/*
 * Autor: Pedro Henrique Bassetto Ruiz
 * Router Feriado - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import express from "express";
import FeriadoControl from "../control/FeriadoControl";

// Rota de consulta de feriado nacional, usada pela tela de cadastro de demanda.
export default class FeriadoRouter {
    private _router: express.Router;
    private _feriadoControl: FeriadoControl;

    // Cria o roteador e o control.
    constructor() {
        this._router = express.Router();
        this._feriadoControl = new FeriadoControl();
    }

    criarRotasFeriado() {
        // GET /feriado/2026-12-25 -> diz se a data e feriado nacional.
        this._router.get("/:data",
            this._feriadoControl.feriado_verificar_control
        );

        // Devolve o roteador pronto para o app.ts usar.
        return this._router;
    }
}