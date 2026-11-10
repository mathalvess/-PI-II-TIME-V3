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

// Admin pode tudo, lider pode nos projetos dele. Membro sempre da false aqui.
function podeGerenciar(usuario: UsuarioComPerfil, id_projeto: number): boolean {
    const perfil = perfilNoProjeto(usuario, id_projeto);
    if (perfil === "Administrador" || perfil === "Lider de Projeto") {
        return true;
    }
    return false;
}

// Recebe uma lista (demandas ou projetos) e devolve so o que essa pessoa pode ver.
export function filtrarPorProjeto(usuario: UsuarioComPerfil, linhas: RowDataPacket[]): RowDataPacket[] {
    const visiveis: RowDataPacket[] = [];
    for (const linha of linhas) {
        // perfilNoProjeto e a funcao do Matheus: diz o que a pessoa e naquele projeto.
        if (perfilNoProjeto(usuario, linha.id_projeto) !== "SEM_VINCULO") {
            visiveis.push(linha);
        }
    }
    return visiveis;
}

// Usada no dashboard. E tipo contar com tracinho no papel: se o valor ja ta na
// lista soma 1, se nao anota ele com 1. O campo e status, prioridade ou tipo.
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

// Aqui ficam as regras de quem pode fazer o que (item 2.1 do documento).
export default class AcessoMiddleware {

    // Roda antes de tudo: descobre quem ta pedindo pelo numero que a tela manda.
    async identificar_Usuario(request: Request, response: Response, next: NextFunction) {
        const id_usuario = Number(request.headers["id-usuario"]);

        // Sem numero nao tem como saber quem e, entao manda fazer login.
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

        // Pega os projetos da pessoa e guarda so os numeros, tipo [2, 3].
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

        // O response.locals acompanha o pedido ate o fim, entao as proximas etapas sabem quem e.
        response.locals.usuario = usuario;
        next();
    }

    // Barra quem tenta abrir demanda de projeto que nao e dele, mesmo digitando o endereco na mao.
    async pode_VerDemanda(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const demanda = new Demanda();
        demanda.id = Number(request.params.id);
        const resultado = await demanda.readByID();

        // Demanda nao existe: deixa seguir que a proxima etapa responde isso.
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

    // So admin ou lider do projeto criam demanda. Membro leva 403.
    pode_CriarDemanda(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const id_projeto = Number(request.body.demanda.id_projeto);

        if (podeGerenciar(usuario, id_projeto)) {
            next();
        } else {
            response.status(403).send({ cod: 1, status: false, msg: "Seu perfil nao pode criar demandas neste projeto" });
        }
    }

    // Olha o projeto atual e o novo, pra lider nao jogar demanda num projeto que nao e dele.
    async pode_EditarDemanda(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const demanda = new Demanda();
        demanda.id = Number(request.params.id);
        const resultado = await demanda.readByID();

        // Demanda nao existe: deixa seguir que a proxima etapa responde isso.
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

    // Admin e lider passam direto. O membro tem que cumprir as regras la de baixo.
    async pode_MudarStatus(request: Request, response: Response, next: NextFunction) {
        const usuario = response.locals.usuario;
        const novoStatus = request.body.demanda.status;
        const demanda = new Demanda();
        demanda.id = Number(request.params.id);
        const resultado = await demanda.readByID();

        // Demanda nao existe: deixa seguir que a proxima etapa responde isso.
        if (resultado.length === 0) {
            next();
            return;
        }

        const atual = resultado[0];

        if (podeGerenciar(usuario, atual.id_projeto)) {
            next();
            return;
        }

        // Regra do membro (2.1.3): ser do projeto, ser o responsavel e a mudanca ser uma das duas abaixo.
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
