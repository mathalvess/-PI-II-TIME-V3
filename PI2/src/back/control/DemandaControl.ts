/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Control Demanda - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Recebe a requisicao ja validada pelo middleware, usa o model e
 * devolve a resposta no formato { cod, status, msg }.
 */

// Tipos do Express: dizem o que sao "request" e "response" (so para o TypeScript conferir).
import { Request, Response } from "express";
// Importa a classe Demanda do model.
import Demanda from "../model/Demanda";
import Historico from "../model/Historico";
import { filtrarPorProjeto, contarPor } from "../middleware/AcessoMiddleware";

// Funcoes auxiliares do historico. Ficam FORA da classe de proposito: o Express chama os
// metodos do control "soltos" (sem o objeto), entao dentro deles o "this" fica vazio e
// "this.registrarHistorico(...)" quebrava com "Erro interno do servidor".
function normalizarHistorico(valor: unknown): string | null {
    if (valor === null || valor === undefined || valor === "") return null;
    if (valor instanceof Date) return valor.toISOString().slice(0, 10);
    return String(valor);
}

async function registrarHistorico(idDemanda: number, idUsuario: number, campo: string, anterior: unknown, novo: unknown) {
    await new Historico().registrar(idDemanda, idUsuario, campo, normalizarHistorico(anterior), normalizarHistorico(novo));
}

// Como o middleware ja validou, aqui o control so monta o objeto e chama o model.
export default class DemandaControl {

    // Cria uma nova demanda.
    async demanda_create_control(request: Request, response: Response) {
        // Cria um objeto novo da classe Demanda (igual ao "new" do Java e do PHP).
        const demanda = new Demanda();
        // Copia os dados do corpo da requisicao para o objeto, usando os setters.
        demanda.titulo = request.body.demanda.titulo;
        demanda.descricao = request.body.demanda.descricao;
        demanda.tipo = request.body.demanda.tipo;
        demanda.prioridade = request.body.demanda.prioridade;
        demanda.id_projeto = Number(request.body.demanda.id_projeto);
        // "?? null": se o responsavel nao veio, guarda null (demanda nao atribuida).
        demanda.id_responsavel = request.body.demanda.id_responsavel
            ? Number(request.body.demanda.id_responsavel)
            : null;
        // Mesma ideia para o prazo, que e opcional.
        demanda.prazo = request.body.demanda.prazo ?? null;

        // Chama o model para gravar no banco e espera o resultado (true ou false).
        const isCreated = await demanda.create();

        // Se gravou, busca a demanda de novo no banco para devolver completa
        // (com o id, o status Aberta e as datas).
        const resultado = isCreated ? await demanda.readByID() : [];
        if (isCreated && resultado[0]) {
            const criado = resultado[0];
            const idUsuario = Number(response.locals.usuario.id_usuario);
            const idDemanda = Number(criado.id_demanda);
            await registrarHistorico(idDemanda, idUsuario, "demanda", null, "Criada");
            await registrarHistorico(idDemanda, idUsuario, "status", null, criado.status ?? "Aberta");
            const camposIniciais: Array<[string, unknown]> = [["titulo", criado.titulo], ["descricao", criado.descricao], ["tipo", criado.tipo], ["prioridade", criado.prioridade], ["projeto", criado.id_projeto], ["responsavel", criado.id_responsavel], ["prazo", criado.prazo]];
            for (const [campo, valor] of camposIniciais) await registrarHistorico(idDemanda, idUsuario, campo, null, valor);
        }

        // Monta a resposta no padrao do projeto.
        const objResposta = {
            cod: 1,
            status: isCreated,
            // Operador ternario: "condicao ? valor_se_true : valor_se_false".
            msg: isCreated ? "Demanda criada com sucesso" : "Erro ao criar a Demanda",
            demanda: isCreated ? resultado[0] : null,
        };
        // 201 = criado com sucesso; 500 = erro no servidor/banco.
        response.status(isCreated ? 201 : 500).send(objResposta);
    }

    // Edita os dados de uma demanda (os dados ja foram validados no middleware).
    async demanda_update_control(request: Request, response: Response) {
        const demanda = new Demanda();
        // O ID vem da URL (/demanda/5) e os novos dados vem no corpo da requisicao.
        demanda.id = Number(request.params.id);
        demanda.titulo = request.body.demanda.titulo;
        demanda.descricao = request.body.demanda.descricao;
        demanda.tipo = request.body.demanda.tipo;
        demanda.prioridade = request.body.demanda.prioridade;
        demanda.id_projeto = Number(request.body.demanda.id_projeto);
        demanda.id_responsavel = request.body.demanda.id_responsavel
            ? Number(request.body.demanda.id_responsavel)
            : null;
        demanda.prazo = request.body.demanda.prazo ?? null;

        const consultaAnterior = new Demanda();
        consultaAnterior.id = demanda.id;
        const dadosAnteriores = await consultaAnterior.readByID();
        const isUpdated = await demanda.update();
        const resultado = isUpdated ? await demanda.readByID() : [];
        if (isUpdated && dadosAnteriores[0] && resultado[0]) {
            const antes = dadosAnteriores[0];
            const depois = resultado[0];
            const idUsuario = Number(response.locals.usuario.id_usuario);
            const campos: Array<{ nome: string; coluna: string }> = [{ nome: "titulo", coluna: "titulo" }, { nome: "descricao", coluna: "descricao" }, { nome: "tipo", coluna: "tipo" }, { nome: "prioridade", coluna: "prioridade" }, { nome: "projeto", coluna: "id_projeto" }, { nome: "responsavel", coluna: "id_responsavel" }, { nome: "prazo", coluna: "prazo" }];
            for (const campo of campos) {
                const valorAnterior = normalizarHistorico(antes[campo.coluna]);
                const valorNovo = normalizarHistorico(depois[campo.coluna]);
                if (valorAnterior !== valorNovo) await registrarHistorico(Number(demanda.id), idUsuario, campo.nome, valorAnterior, valorNovo);
            }
        }

        const objResposta = {
            cod: 1,
            status: isUpdated,
            msg: isUpdated ? "Demanda atualizada com sucesso" : "Erro ao atualizar a Demanda",
            demanda: isUpdated ? resultado[0] : null,
        };
        response.status(isUpdated ? 200 : 500).send(objResposta);
    }

    // Lista todas as demandas.
    async demanda_read_all_control(request: Request, response: Response) {
        const demanda = new Demanda();
        // Pede ao model todas as demandas.
        const resultado = await demanda.readAll();

        const objResposta = {
            cod: 1,
            status: true,
            msg: "Executado com sucesso",
            // So as demandas dos projetos que o usuario logado pode ver.
            demandas: filtrarPorProjeto(response.locals.usuario, resultado),
        };
        // 200 = tudo certo.
        response.status(200).send(objResposta);
    }

    // Devolve os dados do dashboard: totais por status, prioridade e tipo,
    // as demandas criticas em aberto e as proximas do prazo.
    async demanda_dashboard_control(request: Request, response: Response) {
        const demanda = new Demanda();
        const usuario = response.locals.usuario;

        // So entram nas contas as demandas dos projetos que o usuario logado pode ver.
        const visiveis = filtrarPorProjeto(usuario, await demanda.readAll());
        const proximas = filtrarPorProjeto(usuario, await demanda.readProximasDoPrazo());

        const objResposta = {
            cod: 1,
            status: true,
            msg: "Executado com sucesso",
            total: visiveis.length,
            por_status: contarPor(visiveis, "status"),
            por_prioridade: contarPor(visiveis, "prioridade"),
            por_tipo: contarPor(visiveis, "tipo"),
            criticas_em_aberto: filtrarPorProjeto(usuario, await demanda.readCriticasEmAberto()),
            // As 5 mais proximas do prazo, entre as que o usuario pode ver.
            proximas_do_prazo: proximas.slice(0, 5),
        };
        response.status(200).send(objResposta);
    }

    // Busca uma demanda pelo ID.
    async demanda_read_by_id_control(request: Request, response: Response) {
        const demanda = new Demanda();
        // O ID vem da URL (/demanda/5) e chega como texto; Number() converte.
        demanda.id = Number(request.params.id);
        const resultado = await demanda.readByID();

        // true se a lista veio com pelo menos 1 item.
        const demandaEncontrada = resultado.length > 0;

        const objResposta = {
            // cod 1 se achou, cod 0 se nao achou.
            cod: demandaEncontrada ? 1 : 0,
            status: demandaEncontrada,
            msg: demandaEncontrada ? "Demanda encontrada" : "Demanda nao encontrada",
            // resultado[0] e o primeiro (e unico) item da lista.
            demanda: demandaEncontrada ? resultado[0] : null,
        };
        // 200 se achou, 404 se nao achou.
        response.status(demandaEncontrada ? 200 : 404).send(objResposta);
    }

    // Muda o status de uma demanda (a transicao ja foi validada no middleware).
    async demanda_status_control(request: Request, response: Response) {
        const demanda = new Demanda();
        // ID que vem da URL (/demanda/5/status).
        demanda.id = Number(request.params.id);
        // Novo status que vem no corpo da requisicao.
        demanda.status = request.body.demanda.status;

        const consultaAnterior = new Demanda();
        consultaAnterior.id = demanda.id;
        const dadosAnteriores = await consultaAnterior.readByID();
        const isUpdated = await demanda.updateStatus();
        if (isUpdated && dadosAnteriores[0]) {
            await registrarHistorico(Number(demanda.id), Number(response.locals.usuario.id_usuario), "status", dadosAnteriores[0].status, demanda.status);
        }

        const objResposta = {
            cod: 1,
            status: isUpdated,
            msg: isUpdated ? "Status atualizado com sucesso" : "Erro ao atualizar o status",
        };
        response.status(isUpdated ? 200 : 500).send(objResposta);
    }
}
