/*
 * Autor: Lucas Marassi Cipriano Pereira
 * Middleware Demanda - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Validacoes que rodam antes do control. Se algo estiver errado, responde
 * com o erro; se estiver certo, chama next() e segue para o control.
 */

// "import { ... } from" traz so as partes pedidas de dentro de um modulo
// (parecido com o "use" do PHP e o "import" do Java).
// Request = a requisicao que chegou; Response = a resposta que vamos enviar;
// NextFunction = a funcao que passa para o proximo passo (o control).
import { Request, Response, NextFunction } from "express";
// Demanda (sem chaves) e a classe principal do arquivo; as constantes vem entre chaves.
import Demanda, { TIPOS, PRIORIDADES, TRANSICOES } from "../model/Demanda";

export default class DemandaMiddleware {

    // Valida os campos obrigatorios do cadastro de demanda.
    // Os parametros tem tipo: "request: Request" = a variavel request e do tipo Request.
    validar_DadosDemanda(request: Request, response: Response, next: NextFunction) {
        // "?." so le o campo se request.body existir (evita erro se vier vazio).
        // "?? {}" usa um objeto vazio caso o valor seja nulo (evita erro mais adiante).
        // Os dados vem dentro de "demanda": { "demanda": { "titulo": "..." } }.
        const demanda = request.body?.demanda ?? {};
        // Guarda a mensagem de erro; se continuar vazia, esta tudo certo.
        let msg = "";

        // Titulo: obrigatorio e com no maximo 120 caracteres (regra do escopo).
        if (!demanda.titulo || demanda.titulo.length > 120) {
            msg = "O titulo e obrigatorio e deve ter no maximo 120 caracteres";
        // Descricao: obrigatoria.
        } else if (!demanda.descricao) {
            msg = "A descricao e obrigatoria";
        // Tipo: precisa estar na lista de tipos permitidos (".includes" confere se esta na lista).
        } else if (!TIPOS.includes(demanda.tipo)) {
            msg = "Tipo invalido";
        // Prioridade: precisa estar na lista de prioridades permitidas.
        } else if (!PRIORIDADES.includes(demanda.prioridade)) {
            msg = "Prioridade invalida";
        // Projeto: obrigatorio (a demanda sempre pertence a um projeto).
        } else if (!demanda.id_projeto) {
            msg = "O projeto e obrigatorio";
        // Prazo: e opcional, mas se vier precisa estar no formato AAAA-MM-DD.
        // "/^\d{4}-\d{2}-\d{2}$/" e uma expressao regular: 4 digitos, traco, 2, traco, 2.
        } else if (demanda.prazo && !/^\d{4}-\d{2}-\d{2}$/.test(demanda.prazo)) {
            msg = "Prazo invalido (use o formato AAAA-MM-DD)";
        }

        // Se a mensagem nao ficou vazia, algo esta errado.
        if (msg !== "") {
            // Monta o objeto de resposta no formato do projeto: cod, status e msg.
            const objResposta = { cod: 1, status: false, msg: msg };
            // 400 = requisicao invalida. ".send" envia a resposta e encerra aqui.
            response.status(400).send(objResposta);
        } else {
            next(); // Tudo certo: chama o proximo passo (o control).
        }
    }

    // Confere se a demanda da URL existe (usado na edicao: /demanda/5).
    async existe_Demanda(request: Request, response: Response, next: NextFunction) {
        const objDemanda = new Demanda();
        objDemanda.id = Number(request.params.id);
        const resultado = await objDemanda.readByID();

        if (resultado.length === 0) {
            const objResposta = { cod: 0, status: false, msg: "Demanda nao encontrada" };
            response.status(404).send(objResposta);
        } else {
            next();
        }
    }

    // Confere se o projeto informado existe no banco (como o existe_Id_professor do projeto de Curso).
    async existe_Id_projeto(request: Request, response: Response, next: NextFunction) {
        // Cria um objeto Demanda so para fazer a consulta.
        const objDemanda = new Demanda();
        objDemanda.id_projeto = Number(request.body.demanda.id_projeto);
        // Pergunta ao model se esse projeto existe.
        const projetoExiste = await objDemanda.isId_projeto();

        if (projetoExiste === false) {
            const objResposta = { cod: 1, status: false, msg: "Nao e possivel cadastrar uma demanda sem um projeto existente" };
            response.status(400).send(objResposta);
        } else {
            next();
        }
    }

    // Se o cadastro trouxe um responsavel, confere se ele existe como usuario.
    async existe_Id_responsavel(request: Request, response: Response, next: NextFunction) {
        const id_responsavel = request.body.demanda.id_responsavel;

        // Responsavel e opcional: se nao veio, nao tem o que conferir.
        if (!id_responsavel) {
            next();
            return; // "return" sai da funcao aqui.
        }

        const objDemanda = new Demanda();
        objDemanda.id_responsavel = Number(id_responsavel);
        const responsavelExiste = await objDemanda.isId_responsavel();

        if (responsavelExiste === false) {
            const objResposta = { cod: 1, status: false, msg: "O responsavel informado nao existe" };
            response.status(400).send(objResposta);
        } else {
            next();
        }
    }

    // Confere se a demanda existe e se a mudanca de status e permitida.
    // "async" porque dentro usa "await" (espera a resposta do model).
    async validar_TransicaoStatus(request: Request, response: Response, next: NextFunction) {
        // O novo status pedido vem no corpo da requisicao. ": string" e o tipo da variavel.
        const novoStatus: string = request.body?.demanda?.status;

        // Cria um objeto Demanda so para buscar pelo ID da URL (/demanda/5/status -> id 5).
        const objDemanda = new Demanda();
        // Tudo que vem da URL e texto, por isso Number() converte para numero.
        objDemanda.id = Number(request.params.id);
        // "await" espera o resultado do model antes de seguir para a proxima linha.
        const resultado = await objDemanda.readByID();

        // Lista vazia = nao existe demanda com esse ID.
        if (resultado.length === 0) {
            const objResposta = { cod: 0, status: false, msg: "Demanda nao encontrada" };
            // 404 = nao encontrado.
            response.status(404).send(objResposta);
            // "return" sai da funcao aqui para nao continuar executando.
            return;
        }

        // Pega o status em que a demanda esta agora.
        const statusAtual: string = resultado[0].status;
        // TRANSICOES[statusAtual] e a lista de status permitidos a partir do atual.
        // O "?." evita erro se o status atual nao existir na tabela.
        // Se o novo status NAO estiver nessa lista, a mudanca e proibida.
        if (!TRANSICOES[statusAtual]?.includes(novoStatus)) {
            const objResposta = {
                cod: 1,
                status: false,
                // Crase (`) permite colocar variaveis dentro do texto com ${variavel}.
                msg: `Nao e permitido mudar de "${statusAtual}" para "${novoStatus}"`,
            };
            // 409 = conflito (a acao conflita com o estado atual da demanda).
            response.status(409).send(objResposta);
        } else {
            // Transicao permitida: segue para o control.
            next();
        }
    }
}
