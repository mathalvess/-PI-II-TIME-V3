// Autor: Matheus Augusto Alves
// Filtros da tela de listagem de demandas
// Sistema de Acompanhamento de Demandas
// Projeto Integrador 2

const formulario = document.querySelector("form");

const busca = document.getElementById("busca");
const status = document.getElementById("status");
const prioridade = document.getElementById("prioridade");
const tipo = document.getElementById("tipo");
const responsavel = document.getElementById("responsavel");

// Os responsaveis vem do banco (GET /usuario), e nao de uma lista fixa no HTML
async function carregarResponsaveis() {
    try {
        const resposta = await buscarJSON("/usuario");

        if (!resposta.status) {
            return;
        }

        // Apaga as opcoes antigas, deixando so a primeira ("Todos")
        while (responsavel.options.length > 1) {
            responsavel.remove(1);
        }

        resposta.usuarios.forEach(function(usuario) {
            const opcao = document.createElement("option");
            opcao.value = usuario.id_usuario;
            opcao.textContent = usuario.nome;
            responsavel.appendChild(opcao);
        });
    } catch (erro) {
        // Sem servidor, o select continua com as opcoes que ja tinha
    }
}

formulario.addEventListener("submit", function(event) {

    // Impede que a pagina seja recarregada
    event.preventDefault();

    // As linhas sao lidas aqui, na hora de filtrar, porque a tabela e montada
    // pelo js/demandas.js so depois que os dados chegam da API
    const linhas = document.querySelectorAll("#tabela-demandas tr");

    linhas.forEach(function(linha) {

        // Linha de aviso ("Nenhuma demanda cadastrada") nao tem as colunas
        if (linha.children.length < 7) {
            return;
        }

        // Pega os dados de cada linha da tabela
        const tituloTabela = linha.children[1].textContent.toLowerCase();
        const tipoTabela = linha.children[2].textContent.toLowerCase();
        const prioridadeTabela = linha.children[3].textContent.toLowerCase();
        const statusTabela = linha.children[4].textContent.toLowerCase();
        const responsavelTabela = linha.children[6].textContent.toLowerCase();

        let mostrar = true;

        // Filtro de busca pelo titulo
        if (busca.value != "") {

            const textoBusca = busca.value.toLowerCase();

            if (!tituloTabela.includes(textoBusca)) {
                mostrar = false;
            }
        }

        // Filtro por tipo
        if (tipo.value != "") {

            if (!tipoTabela.includes(tipo.value)) {
                mostrar = false;
            }
        }

        // Filtro por prioridade
        if (prioridade.value != "") {

            if (!prioridadeTabela.includes(prioridade.value)) {
                mostrar = false;
            }
        }

        // Filtro por status
        if (status.value != "") {

            let statusEscolhido = status.value;

            if (statusEscolhido == "andamento") {
                statusEscolhido = "em andamento";
            }

            if (statusEscolhido == "revisao") {
                statusEscolhido = "em revisao";
            }

            if (!statusTabela.includes(statusEscolhido)) {
                mostrar = false;
            }
        }

        // Filtro por responsavel: compara com o nome que aparece na opcao escolhida
        if (responsavel.value != "") {

            const nomeResponsavel = responsavel.options[responsavel.selectedIndex].textContent.toLowerCase();

            if (responsavelTabela != nomeResponsavel) {
                mostrar = false;
            }
        }

        // Mostra ou esconde a linha
        if (mostrar == true) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }

    });

});

carregarResponsaveis();
