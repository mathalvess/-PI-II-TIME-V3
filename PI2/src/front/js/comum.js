/* Autor: Lucas Marassi Cipriano Pereira
   Funcoes comuns usadas pelas telas de demanda - Sistema de Acompanhamento de Demandas
   Projeto Integrador 2 */

// Quem esta logado (o login.js guarda isso ao entrar). Sem login, volta para a tela de login.
const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario"));
if (!usuarioLogado) {
    window.location.href = "index.html";
}

// Cor da etiqueta (badge do Bootstrap) para cada status.
const CLASSES_STATUS = {
    "Aberta": "bg-primary",
    "Em andamento": "bg-warning text-dark",
    "Em revisao": "bg-info text-dark",
    "Concluida": "bg-success",
    "Cancelada": "bg-secondary"
};

// Cor da etiqueta para cada prioridade.
const CLASSES_PRIORIDADE = {
    "Critica": "bg-danger",
    "Alta": "bg-warning text-dark",
    "Media": "bg-primary",
    "Baixa": "bg-secondary"
};

// Chama a API e devolve a resposta ja convertida de JSON para objeto.
// "async" e "await": a funcao espera o servidor responder antes de continuar.
async function buscarJSON(url, opcoes) {
    // Todo pedido leva o numero de quem esta logado, para o servidor saber o que pode mostrar.
    opcoes = opcoes || {};
    opcoes.headers = opcoes.headers || {};
    if (usuarioLogado) {
        opcoes.headers["id-usuario"] = usuarioLogado.id_usuario;
    }
    const resposta = await fetch(url, opcoes);
    return await resposta.json();
}

// Converte "2026-09-19" ou "2026-09-19 10:03:00" para "19/09/2026".
function dataBR(texto) {
    if (!texto) {
        return "-";
    }
    const partes = texto.substring(0, 10).split("-"); // ["2026", "09", "19"]
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Converte "2026-09-19 10:03:00" para "19/09/2026 10:03".
function dataHoraBR(texto) {
    if (!texto) {
        return "-";
    }
    return dataBR(texto) + " " + texto.substring(11, 16);
}

// Cria uma etiqueta colorida (<span class="badge ...">texto</span>).
// Usa textContent (e nao innerHTML) para o texto nunca ser interpretado como HTML.
function criarBadge(texto, classes) {
    const span = document.createElement("span");
    span.className = "badge " + (classes || "bg-secondary");
    span.textContent = texto;
    return span;
}

// Procura em uma lista (de projetos ou usuarios) o nome que tem o id informado.
function nomePorId(lista, campoId, id) {
    const item = lista.find(function (i) { return i[campoId] === id; });
    return item ? item.nome : "-";
}

// Mostra uma mensagem de erro (ou de sucesso) na caixa de aviso da tela.
function mostrarMensagem(texto, tipo) {
    const caixa = document.getElementById("mensagem");
    caixa.className = "alert alert-" + (tipo || "danger");
    caixa.textContent = texto;
}

// Mostra na barra de cima quem esta logado e, para o Membro da Equipe,
// esconde os botoes de criar e editar demanda (o servidor tambem bloqueia).
if (usuarioLogado) {
    document.querySelector(".navbar-text").textContent = usuarioLogado.nome + " (" + usuarioLogado.perfil + ")";

    if (usuarioLogado.perfil === "Membro da Equipe") {
        const links = document.querySelectorAll('a[href^="demanda-form.html"]');
        for (const link of links) {
            link.style.display = "none";
        }
    }
}
