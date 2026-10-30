import express from "express";
import HistoricoControl from "../control/HistoricoControl";
import DemandaMiddleware from "../middleware/DemandaMiddleware";
import AcessoMiddleware from "../middleware/AcessoMiddleware";

export default class HistoricoRouter {
    private _router: express.Router;
    private _historicoControl: HistoricoControl;
    private _demandaMiddleware: DemandaMiddleware;
    private _acessoMiddleware: AcessoMiddleware;

    constructor() {
        this._router = express.Router();
        this._historicoControl = new HistoricoControl();
        this._demandaMiddleware = new DemandaMiddleware();
        this._acessoMiddleware = new AcessoMiddleware();
    }

    criarRotasHistorico() {
        this._router.get(
            "/:id",
            this._demandaMiddleware.existe_Demanda,
            this._acessoMiddleware.pode_VerDemanda,
            this._historicoControl.listar_control
        );
        return this._router;
    }
}
