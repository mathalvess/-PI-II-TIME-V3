/*
 * Autor: Pedro Henrique Bassetto Ruiz
 * Router Feriado - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Rota de consulta: GET /feriado/2026-12-25 responde se a data e feriado nacional.
 * Serve para testar a integracao com a BrasilAPI pelo navegador e,
 * futuramente, para a tela de cadastro avisar antes de enviar.
 */

import express, { Request, Response } from "express";
import { buscarFeriadoNacional } from "../util/feriados";

export default class FeriadoRouter {
    private _router: express.Router;

    constructor() {
        this._router = express.Router();
    }

    criarRotasFeriado() {
        // GET /feriado/:data -> ":data" e a data no formato AAAA-MM-DD.
        this._router.get("/:data", async (request: Request, response: Response) => {
            const data = String(request.params.data);

            // Confere o formato antes de chamar a API externa.
            if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                response.status(400).send({ cod: 1, status: false, msg: "Data invalida (use o formato AAAA-MM-DD)" });
                return;
            }

            try {
                const nomeFeriado = await buscarFeriadoNacional(data);
                // "feriado" e true ou false; "nome" so vem quando e feriado.
                response.send({ data: data, feriado: nomeFeriado !== null, nome: nomeFeriado });
            } catch (erro) {
                response.status(503).send({ cod: 1, status: false, msg: "Nao foi possivel consultar a BrasilAPI agora" });
            }
        });

        return this._router;
    }
}