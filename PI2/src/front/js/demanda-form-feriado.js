/* Autor: Pedro Henrique Bassetto Ruiz
   Aviso de feriado nacional no campo de prazo (tela de Cadastro/Edicao de Demanda)
   Sistema de Acompanhamento de Demandas - Projeto Integrador 2 */

// Assim que o usuario escolhe o prazo, pergunta ao servidor se a data e feriado
// nacional e mostra o aviso embaixo do campo, antes de clicar em Salvar.
// O servidor continua barrando o feriado na gravacao; este aviso so adianta a resposta.

const campoPrazoFeriado = document.getElementById("prazo");

// Cria o espaco do aviso logo abaixo do campo de prazo.
const avisoFeriado = document.createElement("div");
avisoFeriado.id = "avisoFeriado";
avisoFeriado.className = "small mt-1";
campoPrazoFeriado.parentNode.insertBefore(avisoFeriado, campoPrazoFeriado.nextSibling);

// Mostra uma mensagem no aviso com a cor escolhida (classe do Bootstrap).
function mostrarAvisoFeriado(texto, classeCor) {
    avisoFeriado.textContent = texto;
    avisoFeriado.className = "small mt-1 " + classeCor;
}

// Converte 2026-12-25 em 25/12/2026 para o usuario ler.
function formatarDataBR(data) {
    const partes = data.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Consulta o servidor e atualiza o aviso.
async function verificarFeriado() {
    const data = campoPrazoFeriado.value; // vem como AAAA-MM-DD ("" se vazio)

    // Campo vazio: nao tem o que verificar.
    if (data === "") {
        mostrarAvisoFeriado("", "");
        return;
    }

    mostrarAvisoFeriado("Verificando feriado...", "text-muted");

    try {
        const resposta = await buscarJSON("/feriado/" + data);

        // O usuario pode ter trocado a data enquanto esperava: ignora a resposta antiga.
        if (campoPrazoFeriado.value !== data) {
            return;
        }

        if (!resposta.status) {
            mostrarAvisoFeriado(resposta.msg, "text-muted");
        } else if (resposta.feriado) {
            mostrarAvisoFeriado(formatarDataBR(data) + " e feriado nacional. Escolha outra data.", "text-danger");
        } else {
            mostrarAvisoFeriado(formatarDataBR(data) + " nao e feriado.", "text-success");
        }
    } catch (erro) {
        // Servidor desligado ou sem internet.
        mostrarAvisoFeriado("Nao foi possivel verificar o feriado agora.", "text-muted");
    }
}

// "change" dispara quando o usuario termina de escolher a data.
campoPrazoFeriado.addEventListener("change", verificarFeriado);