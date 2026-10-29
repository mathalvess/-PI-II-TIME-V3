/* Autor: Eduardo Campos Ferreira Filho
   Comentarios da tela de Detalhes da Demanda - Projeto Integrador 2 */

const listaComentarios = document.getElementById("lista-comentarios");
const campoComentario = document.getElementById("comentario");
const botaoComentar = document.getElementById("botao-comentar");

async function carregarComentarios() {
    const resposta = await buscarJSON("/comentario/" + idDemanda);

    listaComentarios.innerHTML = "";

    if (!resposta.status) {
        return;
    }

    if (resposta.comentarios.length === 0) {
        listaComentarios.textContent = "Nenhum comentario ainda.";
        return;
    }

    for (const comentario of resposta.comentarios) {
        const item = document.createElement("div");
        item.className = "border-bottom pb-2 mb-2";

        const autor = document.createElement("strong");
        autor.textContent = comentario.nome + " - " + dataHoraBR(comentario.data_hora);

        const texto = document.createElement("p");
        texto.className = "mb-0";
        texto.textContent = comentario.texto;

        item.appendChild(autor);
        item.appendChild(texto);
        listaComentarios.appendChild(item);
    }
}

async function enviarComentario() {
    const texto = campoComentario.value.trim();

    if (texto === "") {
        mostrarMensagem("Escreva o comentario antes de enviar.");
        return;
    }

    const resposta = await buscarJSON("/comentario/" + idDemanda, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto })
    });

    if (resposta.status) {
        campoComentario.value = "";
        mostrarMensagem("Comentario registrado.", "success");
        carregarComentarios();
    } else {
        mostrarMensagem(resposta.msg);
    }
}

botaoComentar.addEventListener("click", enviarComentario);

carregarComentarios();
