/*
 * Autor: Eduardo Campos Ferreira Filho
 * Middleware Acesso - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 */

import { Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import Acesso from "../model/Acesso";
import Demanda from "../model/Demanda";
import { perfilNoProjeto, UsuarioComPerfil } from "../util/validarperfil";

function podeGerenciar(usuario: UsuarioComPerfil, id_projeto: number): boolean {
    const perfil = perfilNoProjeto(usuario, id_projeto);
    if (perfil === "Administrador" || perfil === "Lider de Projeto") {
        return true;
    }
    return false;
}

export function filtrarPorProjeto(usuario: UsuarioComPerfil, linhas: RowDataPacket[]): RowDataPacket[] {
    const visiveis: RowDataPacket[] = [];
    for (const linha of linhas) {
        if (perfilNoProjeto(usuario, linha.id_projeto) !== "SEM_VINCULO") {
            visiveis.push(linha);
        }
    }
    return visiveis;
}

export function contarPor(linhas: RowDataPacket[], campo: string): any[] {
    const contagem: any[] = [];
    for (const linha of linhas) {
        let achou = false;
        for (const item of contagem) {
            if (item[campo] === linha[campo]) {
                item.qtd = item.qtd + 1;
                achou = true;
            }
        }
        if (!achou) {
            const novo: any = {};
            novo[campo] = linha[campo];
            novo.qtd = 1;
            contagem.push(novo);
        }
    }
    return contagem;
}

export default class AcessoMiddleware {

    async identificar_Usuario(request: Request, response: Response, next: NextFunction) {
        const id_usuario = Number(request.headers["id-usuario"]);

        if (!id_usuario) {
            response.status(401).send({ cod: 1, status: false, msg: "Faca login para continuar" });
            return;
        }

        const acesso = new Acesso();
        const usuarios = await acesso.buscarUsuario(id_usuario);

        if (usuarios.length === 0) {
            response.status(401).send({ cod: 1, status: false, msg: "Usuario nao encontrado. Faca login novamente" });
            return;
        }

        const projetos = await acesso.buscarProjetosDoUsuario(id_usuario);
        const projetosVinculados: number[] = [];
        for (const linha of projetos) {
            projetosVinculados.push(linha.id_projeto);
        }

        const usuario: UsuarioComPerfil = {
            id_usuario: usuarios[0].id_usuario,
            perfil: usuarios[0].perfil,
            projetosVinculados: projetosVinculados
        };

        response.locals.usuario = usuario;
        next();
    }

    async pode_VerDemanda(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const demanda = new Demanda();
        demanda.id = Number(request.params.id);
        const resultado = await demanda.readByID();

        if (resultado.length === 0) {
            next();
            return;
        }

        if (perfilNoProjeto(usuario, resultado[0].id_projeto) === "SEM_VINCULO") {
            response.status(403).send({ cod: 1, status: false, msg: "Voce nao tem acesso a esta demanda" });
            return;
        }

        next();
    }

    pode_CriarDemanda(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const id_projeto = Number(request.body.demanda.id_projeto);

        if (podeGerenciar(usuario, id_projeto)) {
            next();
        } else {
            response.status(403).send({ cod: 1, status: false, msg: "Seu perfil nao pode criar demandas neste projeto" });
        }
    }

    async pode_EditarDemanda(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const demanda = new Demanda();
        demanda.id = Number(request.params.id);
        const resultado = await demanda.readByID();

        if (resultado.length === 0) {
            next();
            return;
        }

        const projetoAtual = resultado[0].id_projeto;
        const projetoNovo = Number(request.body.demanda.id_projeto);

        if (podeGerenciar(usuario, projetoAtual) && podeGerenciar(usuario, projetoNovo)) {
            next();
        } else {
            response.status(403).send({ cod: 1, status: false, msg: "Seu perfil nao pode editar esta demanda" });
        }
    }

    async pode_MudarStatus(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const novoStatus = request.body.demanda.status;
        const demanda = new Demanda();
        demanda.id = Number(request.params.id);
        const resultado = await demanda.readByID();

        if (resultado.length === 0) {
            next();
            return;
        }

        const atual = resultado[0];

        if (podeGerenciar(usuario, atual.id_projeto)) {
            next();
            return;
        }

        const ehMembro = perfilNoProjeto(usuario, atual.id_projeto) === "Membro da Equipe";
        const ehResponsavel = atual.id_responsavel === usuario.id_usuario;
        let mudancaPermitida = false;

        if (atual.status === "Aberta" && novoStatus === "Em andamento") {
            mudancaPermitida = true;
        }
        if (atual.status === "Em andamento" && novoStatus === "Em revisao") {
            mudancaPermitida = true;
        }

        if (ehMembro && ehResponsavel && mudancaPermitida) {
            next();
        } else {
            response.status(403).send({ cod: 1, status: false, msg: "Seu perfil nao pode fazer esta mudanca de status" });
        }
    }
}
