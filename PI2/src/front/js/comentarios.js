/* Autor: Eduardo Campos Ferreira Filho
   Comentarios da tela de Detalhes da Demanda - Projeto Integrador 2 */

// Os pedacos da tela de detalhes que esse arquivo usa.
const listaComentarios = document.getElementById("lista-comentarios");
const campoComentario = document.getElementById("comentario");
const botaoComentar = document.getElementById("botao-comentar");

// Busca os comentarios no servidor e escreve na tela.
async function carregarComentarios() {
    const resposta = await buscarJSON("/comentario/" + idDemanda);

    // Limpa a lista antes, senao os comentarios ficam repetidos.
    listaComentarios.innerHTML = "";

    // O servidor recusou, tipo quando a pessoa nao pode ver essa demanda.
    if (!resposta.status) {
        return;
    }

    if (resposta.comentarios.length === 0) {
        listaComentarios.textContent = "Nenhum comentario ainda.";
        return;
    }

    // Monta um bloquinho pra cada comentario: nome, data e o texto.
    for (const comentario of resposta.comentarios) {
        const item = document.createElement("div");
        item.className = "border-bottom pb-2 mb-2";

        const autor = document.createElement("strong");
        // textContent garante que o que a pessoa escreveu aparece so como texto.
        autor.textContent = comentario.nome + " - " + dataHoraBR(comentario.data_hora);

        const texto = document.createElement("p");
        texto.className = "mb-0";
        texto.textContent = comentario.texto;

        item.appendChild(autor);
        item.appendChild(texto);
        listaComentarios.appendChild(item);
    }
}

// Roda quando clica em Comentar.
async function enviarComentario() {
    const texto = campoComentario.value.trim();

    // Nem incomoda o servidor se a caixa ta vazia.
    if (texto === "") {
        mostrarMensagem("Escreva o comentario antes de enviar.");
        return;
    }

    const resposta = await buscarJSON("/comentario/" + idDemanda, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto })
    });

    // Gravou: limpa a caixa, avisa e busca a lista de novo pra mostrar o novo.
    if (resposta.status) {
        campoComentario.value = "";
        mostrarMensagem("Comentario registrado.", "success");
        carregarComentarios();
    } else {
        mostrarMensagem(resposta.msg);
    }
}

botaoComentar.addEventListener("click", enviarComentario);

// Ja mostra os comentarios assim que a pagina abre.
carregarComentarios();
