/*
 * Autor: Eduardo Campos Ferreira Filho
 * Router Comentario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import express from "express";
import ComentarioControl from "../control/ComentarioControl";
import ComentarioMiddleware from "../middleware/ComentarioMiddleware";
import DemandaMiddleware from "../middleware/DemandaMiddleware";
import AcessoMiddleware from "../middleware/AcessoMiddleware";

// Os dois enderecos dos comentarios: um pra ler e um pra escrever.
export default class ComentarioRouter {
    private _router: express.Router;
    private _comentarioControl: ComentarioControl;
    private _comentarioMiddleware: ComentarioMiddleware;
    private _demandaMiddleware: DemandaMiddleware;
    private _acessoMiddleware: AcessoMiddleware;

    // Deixa pronto tudo que as rotas vao usar.
    constructor() {
        this._router = express.Router();
        this._comentarioControl = new ComentarioControl();
        this._comentarioMiddleware = new ComentarioMiddleware();
        this._demandaMiddleware = new DemandaMiddleware();
        this._acessoMiddleware = new AcessoMiddleware();
    }

    criarRotasComentario() {
        // GET /comentario/2 -> lista os comentarios da demanda 2.
        // So chega na lista se a demanda existir e a pessoa puder ver ela.
        this._router.get("/:id",
            this._demandaMiddleware.existe_Demanda,
            this._acessoMiddleware.pode_VerDemanda,
            this._comentarioControl.comentario_listar_control
        );

        // POST /comentario/2 -> grava um comentario novo na demanda 2.
        // Mesma checagem de cima, e ainda confere se o texto ta ok.
        this._router.post("/:id",
            this._demandaMiddleware.existe_Demanda,
            this._acessoMiddleware.pode_VerDemanda,
            this._comentarioMiddleware.validar_Texto,
            this._comentarioControl.comentario_criar_control
        );

        return this._router;
    }
}
