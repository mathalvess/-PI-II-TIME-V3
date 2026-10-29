/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Router Demanda - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

// "express" (sem chaves) e o proprio framework; aqui usamos o express.Router.
import express from "express";
import DemandaControl from "../control/DemandaControl";
import DemandaMiddleware from "../middleware/DemandaMiddleware";
import AcessoMiddleware from "../middleware/AcessoMiddleware";

// Classe que define as rotas relacionadas ao recurso "Demanda".
export default class DemandaRouter {
    // Em TypeScript os atributos precisam ser declarados com tipo antes de usar
    // (em JavaScript puro, voce so escreveria this._router = ... no construtor).
    private _router: express.Router;
    private _demandaControl: DemandaControl;
    private _demandaMiddleware: DemandaMiddleware;
    private _acessoMiddleware: AcessoMiddleware;

    // O construtor roda quando se faz "new DemandaRouter()".
    // Cria o roteador, o control e o middleware.
    constructor() {
        this._router = express.Router();
        this._demandaControl = new DemandaControl();
        this._demandaMiddleware = new DemandaMiddleware();
        this._acessoMiddleware = new AcessoMiddleware();
    }

    // Cria e configura as rotas de demanda.
    criarRotasDemanda() {
        // GET /demanda -> lista todas as demandas.
        this._router.get("/",
            this._demandaControl.demanda_read_all_control
        );

        // GET /demanda/dashboard -> totais e listas do dashboard.
        // Precisa ficar ANTES da rota "/:id", senao o Express entenderia "dashboard" como um id.
        this._router.get("/dashboard",
            this._demandaControl.demanda_dashboard_control
        );

        // GET /demanda/5 -> busca a demanda de id 5 (":id" e o pedaco variavel da URL).
        this._router.get("/:id",
            this._acessoMiddleware.pode_VerDemanda,
            this._demandaControl.demanda_read_by_id_control
        );

        // POST /demanda -> cria uma demanda.
        // Ordem de execucao: primeiro os middlewares validam (dados, projeto existe,
        // responsavel existe), e so depois o control cria.
        this._router.post("/",
            this._demandaMiddleware.validar_DadosDemanda,
            this._acessoMiddleware.pode_CriarDemanda,
            this._demandaMiddleware.existe_Id_projeto,
            this._demandaMiddleware.existe_Id_responsavel,
            this._demandaControl.demanda_create_control
        );

        // PUT /demanda/5 -> edita os dados da demanda 5 (menos o status, que tem rota propria).
        // Ordem: a demanda existe? -> dados validos? -> projeto existe? -> responsavel existe? -> edita.
        this._router.put("/:id",
            this._demandaMiddleware.existe_Demanda,
            this._demandaMiddleware.validar_DadosDemanda,
            this._acessoMiddleware.pode_EditarDemanda,
            this._demandaMiddleware.existe_Id_projeto,
            this._demandaMiddleware.existe_Id_responsavel,
            this._demandaControl.demanda_update_control
        );

        // PATCH /demanda/5/status -> muda so o status (PATCH = alteracao parcial).
        // Primeiro o middleware valida a transicao, depois o control atualiza.
        // Nao existe DELETE: o escopo proibe apagar, so cancelar.
        this._router.patch("/:id/status",
            this._demandaMiddleware.validar_TransicaoStatus,
            this._acessoMiddleware.pode_MudarStatus,
            this._demandaControl.demanda_status_control
        );

        // Devolve o roteador pronto para o app.ts usar.
        return this._router;
    }
}
