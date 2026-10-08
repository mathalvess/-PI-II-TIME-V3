/* Autor: Lucas Marassi Cipriano Pereira
   Tela de Cadastro e Edicao de Demanda (envia os dados para a API) - Sistema de Acompanhamento de Demandas
   Projeto Integrador 2 */

// Se a URL for "demanda-form.html?id=2", o formulario esta em modo EDICAO da demanda 2.
// Se nao tiver ?id=, esta em modo CADASTRO (demanda nova). Sem id, o valor e null.
const idDemanda = new URLSearchParams(window.location.search).get("id");

// Preenche um <select> com as opcoes que vieram da API.
function preencherSelect(select, lista, campoId) {
    lista.forEach(function (item) {
        const opcao = document.createElement("option");
        opcao.value = item[campoId];
        opcao.textContent = item.nome;
        select.appendChild(opcao);
    });
}

// Modo edicao: busca a demanda e coloca os dados dela nos campos do formulario.
async function carregarParaEdicao() {
    const resposta = await buscarJSON("/demanda/" + idDemanda);

    if (!resposta.status) {
        mostrarMensagem(resposta.msg); // por exemplo: "Demanda nao encontrada"
        return;
    }

    const d = resposta.demanda;
    document.getElementById("titulo-pagina").textContent = "Editar Demanda " + String(d.id_demanda).padStart(4, "0");
    document.getElementById("titulo").value = d.titulo;
    document.getElementById("descricao").value = d.descricao;
    document.getElementById("tipo").value = d.tipo;
    document.getElementById("prioridade").value = d.prioridade;
    document.getElementById("projeto").value = d.id_projeto;
    // Sem responsavel, o valor do select e "" (a opcao "Nao atribuido").
    document.getElementById("responsavel").value = d.id_responsavel || "";
    document.getElementById("status").value = d.status; // so mostra; o status muda na tela de detalhes
    document.getElementById("prazo").value = d.prazo || "";
}

// Carrega os projetos e os usuarios do banco para dentro dos selects.
async function carregarOpcoes() {
    try {
        const projetos = await buscarJSON("/projeto");
        const usuarios = await buscarJSON("/usuario");
        preencherSelect(document.getElementById("projeto"), projetos.projetos, "id_projeto");
        preencherSelect(document.getElementById("responsavel"), usuarios.usuarios, "id_usuario");

        // Os selects precisam estar preenchidos ANTES de escolher a opcao da demanda.
        if (idDemanda) {
            await carregarParaEdicao();
        }
    } catch (erro) {
        mostrarMensagem("Nao foi possivel carregar os dados. Confira se o servidor e o banco de dados estao ligados.");
    }
}

// Quando o formulario for enviado, manda os dados para a API (em vez de recarregar a pagina).
document.getElementById("form-demanda").addEventListener("submit", async function (evento) {
    evento.preventDefault(); // impede o envio normal do formulario

    // Antes de enviar, confere os campos (validacoes do js/demanda-form-validacao.js).
    if (!validarFormularioDemanda()) {
        return;
    }

    // Monta o objeto no formato que a API espera: { demanda: { ... } }
    const corpo = {
        demanda: {
            titulo: document.getElementById("titulo").value,
            descricao: document.getElementById("descricao").value,
            tipo: document.getElementById("tipo").value,
            prioridade: document.getElementById("prioridade").value,
            id_projeto: document.getElementById("projeto").value,
            // Se nenhum responsavel foi escolhido, o valor e "" e vira null.
            id_responsavel: document.getElementById("responsavel").value || null,
            prazo: document.getElementById("prazo").value || null
        }
    };

    // Edicao usa PUT /demanda/2; cadastro usa POST /demanda.
    const url = idDemanda ? "/demanda/" + idDemanda : "/demanda";
    const metodo = idDemanda ? "PUT" : "POST";

    try {
        const resposta = await buscarJSON(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo)
        });

        if (resposta.status) {
            // Deu certo: vai para a tela de detalhes da demanda (a editada ou a recem-criada).
            window.location.href = "demanda-detalhes.html?id=" + resposta.demanda.id_demanda;
        } else {
            // A API recusou (dado invalido): mostra a mensagem dela.
            mostrarMensagem(resposta.msg);
        }
    } catch (erro) {
        mostrarMensagem("Nao foi possivel salvar. Confira se o servidor e o banco de dados estao ligados.");
    }
});

// Roda assim que a pagina abre.
carregarOpcoes();
