/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Control Projeto - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response } from "express";
import Projeto from "../model/Projeto";
import { filtrarPorProjeto } from "../middleware/AcessoMiddleware";

export default class ProjetoControl {

    // Lista todos os projetos.
    async projeto_read_all_control(request: Request, response: Response) {
        const projeto = new Projeto();
        const resultado = await projeto.readAll();

        const objResposta = {
            cod: 1,
            status: true,
            msg: "Executado com sucesso",
            // So os projetos que o usuario logado pode ver.
            projetos: filtrarPorProjeto(response.locals.usuario, resultado),
        };
        response.status(200).send(objResposta);
    }
}
