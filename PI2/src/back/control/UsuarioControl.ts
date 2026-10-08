/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Control Usuario - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response } from "express";
import Usuario from "../model/Usuario";

export default class UsuarioControl {

    // Lista os usuarios (so id, nome e perfil).
    async usuario_read_all_control(request: Request, response: Response) {
        const usuario = new Usuario();
        const resultado = await usuario.readAll();

        const objResposta = {
            cod: 1,
            status: true,
            msg: "Executado com sucesso",
            usuarios: resultado,
        };
        response.status(200).send(objResposta);
    }
}
