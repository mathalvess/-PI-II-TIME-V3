import { Request, Response } from "express";
import Historico from "../model/Historico";

export default class HistoricoControl {
    async listar_control(request: Request, response: Response) {
        const id_demanda = Number(request.params.id);
        const historico = await new Historico().listar(id_demanda);
        response.status(200).send({
            cod: 1,
            status: true,
            msg: "Historico carregado com sucesso",
            historico
        });
    }
}
