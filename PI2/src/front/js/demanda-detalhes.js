/* Autor: Lucas Marassi Cipriano Pereira
   Tela de Detalhes da Demanda (busca os dados na API) - Sistema de Acompanhamento de Demandas
   Projeto Integrador 2 */

// Para quais status cada status pode ir. E so para decidir quais botoes aparecem:
// quem realmente confere a regra e a API, que responde com erro se a mudanca for proibida.
const TRANSICOES = {
    "Aberta": ["Em andamento", "Cancelada"],
    "Em andamento": ["Em revisao", "Cancelada"],
    "Em revisao": ["Em andamento", "Concluida", "Cancelada"],
    "Concluida": [],
    "Cancelada": []
};

// Pega o id da URL: em "demanda-detalhes.html?id=2" o id e "2".
const idDemanda = new URLSearchParams(window.location.search).get("id");

// Troca o texto de um elemento da pagina pelo id dele.
function preencher(id, texto) {
    document.getElementById(id).textContent = texto;
}

// Coloca uma etiqueta colorida dentro de um elemento (apagando o que havia antes).
function preencherBadge(id, texto, classes) {
    const elemento = document.getElementById(id);
    elemento.innerHTML = "";
    elemento.appendChild(criarBadge(texto, classes));
}

// Busca a demanda na API e preenche a tela.
async function carregarDemanda() {
    if (!idDemanda) {
        mostrarMensagem("Nenhuma demanda foi escolhida. Volte para a listagem e clique em Ver.");
        return;
    }

    try {
        const respostas = await Promise.all([
            buscarJSON("/demanda/" + idDemanda),
            buscarJSON("/projeto"),
            buscarJSON("/usuario")
        ]);

        // Se a demanda nao existe, a API responde status false.
        if (!respostas[0].status) {
            mostrarMensagem(respostas[0].msg);
            return;
        }

        const d = respostas[0].demanda;
        const projetos = respostas[1].projetos;
        const usuarios = respostas[2].usuarios;

        preencher("titulo-pagina", "Demanda " + String(d.id_demanda).padStart(4, "0"));
        preencher("d-titulo", d.titulo);
        preencher("d-descricao", d.descricao);
        preencher("d-codigo", String(d.id_demanda).padStart(4, "0"));
        preencher("d-tipo", d.tipo);
        preencherBadge("d-prioridade", d.prioridade, CLASSES_PRIORIDADE[d.prioridade]);
        preencherBadge("d-status", d.status, CLASSES_STATUS[d.status]);
        preencher("d-projeto", nomePorId(projetos, "id_projeto", d.id_projeto));
        preencher("d-responsavel", d.id_responsavel ? nomePorId(usuarios, "id_usuario", d.id_responsavel) : "Nao atribuido");
        preencher("d-criacao", dataHoraBR(d.data_criacao));
        preencher("d-atualizacao", dataHoraBR(d.data_atualizacao));
        preencher("d-prazo", dataBR(d.prazo));

        // O botao Editar abre o formulario ja preenchido com esta demanda (?id=2).
        document.getElementById("botao-editar").href = "demanda-form.html?id=" + d.id_demanda;

        montarBotoes(d.status, d.id_responsavel);
    } catch (erro) {
        mostrarMensagem("Nao foi possivel carregar a demanda. Confira se o servidor e o banco de dados estao ligados.");
    }
}

// Membro da Equipe so pode mudar as demandas dele, e so de Aberta para Em andamento
// e de Em andamento para Em revisao (regra 2.1.3 do documento). Os outros perfis podem tudo.
function podeMudarStatus(statusAtual, novoStatus, idResponsavel) {
    if (usuarioLogado.perfil !== "Membro da Equipe") {
        return true;
    }
    if (idResponsavel !== usuarioLogado.id_usuario) {
        return false;
    }
    if (statusAtual === "Aberta" && novoStatus === "Em andamento") {
        return true;
    }
    if (statusAtual === "Em andamento" && novoStatus === "Em revisao") {
        return true;
    }
    return false;
}

// Cria um botao para cada status para o qual a demanda pode ir.
function montarBotoes(statusAtual, idResponsavel) {
    const area = document.getElementById("acoes");
    area.innerHTML = "";

    const proximos = TRANSICOES[statusAtual] || [];
    if (proximos.length === 0) {
        area.textContent = "Esta demanda esta " + statusAtual + " e nao pode mais mudar de status.";
        return;
    }

    let botoesCriados = 0;
    proximos.forEach(function (novoStatus) {
        // So cria o botao se o perfil de quem esta logado pode fazer essa mudanca.
        if (!podeMudarStatus(statusAtual, novoStatus, idResponsavel)) {
            return;
        }
        botoesCriados = botoesCriados + 1;
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = novoStatus === "Cancelada" ? "Cancelar demanda" : "Mudar para " + novoStatus;
        // Cores: cancelar em vermelho, concluir em verde, as demais em azul.
        let cor = "btn-primary";
        if (novoStatus === "Cancelada") { cor = "btn-danger"; }
        if (novoStatus === "Concluida") { cor = "btn-success"; }
        botao.className = "btn " + cor + " w-100 mb-2";
        botao.addEventListener("click", function () { mudarStatus(novoStatus); });
        area.appendChild(botao);
    });

    if (botoesCriados === 0) {
        area.textContent = "Seu perfil nao pode mudar o status desta demanda.";
    }
}

// Pede para a API mudar o status da demanda.
async function mudarStatus(novoStatus) {
    // Cancelar nao tem volta, entao pede confirmacao.
    if (novoStatus === "Cancelada" && !confirm("Deseja mesmo cancelar esta demanda?")) {
        return;
    }

    try {
        // PATCH /demanda/2/status com o novo status.
        const resposta = await buscarJSON("/demanda/" + idDemanda + "/status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ demanda: { status: novoStatus } })
        });

        if (resposta.status) {
            mostrarMensagem("Status atualizado para " + novoStatus + ".", "success");
            carregarDemanda(); // recarrega os dados da tela
        } else {
            mostrarMensagem(resposta.msg); // mensagem da API (por exemplo, mudanca proibida)
        }
    } catch (erro) {
        mostrarMensagem("Nao foi possivel mudar o status. Confira se o servidor e o banco de dados estao ligados.");
    }
}

// Roda assim que a pagina abre.
carregarDemanda();
