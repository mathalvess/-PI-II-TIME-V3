/*
 * Autor: Eduardo Campos Ferreira Filho
 * Control Comentario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response } from "express";
import Comentario from "../model/Comentario";

export default class ComentarioControl {

    async comentario_listar_control(request: Request, response: Response) {
        const id_demanda = Number(request.params.id);

        const comentario = new Comentario();
        const lista = await comentario.listar(id_demanda);

        response.status(200).send({ cod: 1, status: true, msg: "Executado com sucesso", comentarios: lista });
    }

    async comentario_criar_control(request: Request, response: Response) {
        const id_demanda = Number(request.params.id);
        const id_usuario = response.locals.usuario.id_usuario;
        const texto = request.body.texto.trim();

        const comentario = new Comentario();
        const gravou = await comentario.criar(id_demanda, id_usuario, texto);

        if (gravou) {
            response.status(201).send({ cod: 1, status: true, msg: "Comentario registrado" });
        } else {
            response.status(500).send({ cod: 1, status: false, msg: "Erro ao registrar o comentario" });
        }
    }
}
