/* Autor: Lucas Marassi Cipriano Pereira
   Validacoes da tela de Cadastro/Edicao de Demanda - Projeto Integrador 2 */

const formulario = document.querySelector("#formDemanda");

const campoTitulo = document.querySelector("#titulo");
const campoDescricao = document.querySelector("#descricao");
const campoTipo = document.querySelector("#tipo");
const campoPrioridade = document.querySelector("#prioridade");
const campoStatus = document.querySelector("#status");
const campoProjeto = document.querySelector("#projeto");
const campoResponsavel = document.querySelector("#responsavel"); // opcional, nao tem erro
const campoPrazo = document.querySelector("#prazo");

const erroTitulo = document.querySelector("#erroTitulo");
const erroDescricao = document.querySelector("#erroDescricao");
const erroTipo = document.querySelector("#erroTipo");
const erroPrioridade = document.querySelector("#erroPrioridade");
const erroStatus = document.querySelector("#erroStatus");
const erroProjeto = document.querySelector("#erroProjeto");
const erroPrazo = document.querySelector("#erroPrazo");

const painelResultado = document.querySelector("#painelResultado");
const resultado = document.querySelector("#resultado");

const camposComErro = [
    campoTitulo,
    campoDescricao,
    campoTipo,
    campoPrioridade,
    campoStatus,
    campoProjeto,
    campoPrazo
];

const mensagensDeErro = [
    erroTitulo,
    erroDescricao,
    erroTipo,
    erroPrioridade,
    erroStatus,
    erroProjeto,
    erroPrazo
];

// Status previstos no escopo do sistema
const statusValidos = ["Aberta", "Em andamento", "Em revisao", "Concluida", "Cancelada"];

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.innerText = mensagem;
}

function limparErros() {
    camposComErro.forEach(function (campo) {
        campo.classList.remove("is-invalid");
    });

    mensagensDeErro.forEach(function (elementoErro) {
        elementoErro.innerText = "";
    });
}

formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    limparErros();

    const titulo = campoTitulo.value.trim();
    const descricao = campoDescricao.value.trim();
    const tipo = campoTipo.value.trim();
    const prioridade = campoPrioridade.value.trim();
    const status = campoStatus.value.trim();
    const projeto = campoProjeto.value.trim();
    const responsavel = campoResponsavel.value.trim();
    const prazo = campoPrazo.value.trim();

    let formValido = true;

    //validar titulo
    if (titulo === "") {
        mostrarErro(campoTitulo, erroTitulo, "Informe o titulo da demanda.");
        formValido = false;
    }
    else if (titulo.length < 5) {
        mostrarErro(campoTitulo, erroTitulo, "O titulo deve ter no minimo 5 caracteres.");
        formValido = false;
    }
    else if (titulo.length > 120) {
        mostrarErro(campoTitulo, erroTitulo, "O titulo deve ter no maximo 120 caracteres.");
        formValido = false;
    }

    //validar descricao
    if (descricao === "") {
        mostrarErro(campoDescricao, erroDescricao, "Informe a descricao da demanda.");
        formValido = false;
    }
    else if (descricao.length < 10) {
        mostrarErro(campoDescricao, erroDescricao, "A descricao deve ter no minimo 10 caracteres.");
        formValido = false;
    }
    else if (descricao.length > 1000) {
        mostrarErro(campoDescricao, erroDescricao, "A descricao deve ter no maximo 1000 caracteres.");
        formValido = false;
    }

    //validar tipo
    if (tipo === "") {
        mostrarErro(campoTipo, erroTipo, "Selecione o tipo da demanda.");
        formValido = false;
    }

    //validar prioridade
    if (prioridade === "") {
        mostrarErro(campoPrioridade, erroPrioridade, "Selecione a prioridade.");
        formValido = false;
    }

    //validar status (campo travado, so confere se e um status do escopo)
    if (!statusValidos.includes(status)) {
        mostrarErro(campoStatus, erroStatus, "Status invalido.");
        formValido = false;
    }

    //validar projeto
    if (projeto === "") {
        mostrarErro(campoProjeto, erroProjeto, "Selecione o projeto.");
        formValido = false;
    }

    //validar prazo (opcional, mas se preenchido precisa ser uma data valida e nao passada)
    //a checagem de feriado nacional (API externa) fica para a proxima etapa
    if (campoPrazo.validity.badInput) {
        mostrarErro(campoPrazo, erroPrazo, "Data invalida. Use o formato dd/mm/aaaa.");
        formValido = false;
    }
    else if (prazo !== "") {
        const dataPrazo = new Date(`${prazo}T00:00:00`);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // zera a hora para comparar so o dia

        if (isNaN(dataPrazo.getTime())) {
            mostrarErro(campoPrazo, erroPrazo, "Data invalida.");
            formValido = false;
        }
        else if (dataPrazo < hoje) {
            mostrarErro(campoPrazo, erroPrazo, "O prazo nao pode ser anterior a hoje.");
            formValido = false;
        }
    }

    if (!formValido) {
        painelResultado.classList.add("d-none");
        return;
    }

    const demanda = {
        titulo, descricao, tipo, prioridade, status, projeto, responsavel, prazo
    };

    console.log(demanda);
    resultado.innerText = JSON.stringify(demanda, null, 2);
    painelResultado.classList.remove("d-none");
});