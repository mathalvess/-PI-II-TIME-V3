/* Autor: Eduardo Campos Ferreira Filho
   Ordenacao da tela de listagem de demandas - Projeto Integrador 2 */

const ordemPrioridade = ["Critica", "Alta", "Media", "Baixa"];
const ordemStatus = ["Aberta", "Em andamento", "Em revisao", "Concluida", "Cancelada"];

function ordenarPorLista(tabela, linhas, campo, ordem) {
    for (const valor of ordem) {
        for (const linha of linhas) {
            if (linha.dataset[campo] === valor) {
                tabela.appendChild(linha);
            }
        }
    }
}

function ordenarPorData(tabela, linhas, campo) {
    linhas.sort(function (a, b) {
        const dataA = a.dataset[campo];
        const dataB = b.dataset[campo];

        if (dataA === "") {
            return 1;
        }
        if (dataB === "") {
            return -1;
        }
        if (dataA < dataB) {
            return -1;
        }
        if (dataA > dataB) {
            return 1;
        }
        return 0;
    });

    for (const linha of linhas) {
        tabela.appendChild(linha);
    }
}

function ordenarDemandas() {
    const tabela = document.getElementById("tabela-demandas");
    const linhas = Array.from(tabela.querySelectorAll("tr"));
    const escolha = document.getElementById("ordenar").value;

    if (escolha === "prioridade") {
        ordenarPorLista(tabela, linhas, "prioridade", ordemPrioridade);
    }
    if (escolha === "status") {
        ordenarPorLista(tabela, linhas, "status", ordemStatus);
    }
    if (escolha === "criacao") {
        ordenarPorData(tabela, linhas, "criacao");
    }
    if (escolha === "prazo") {
        ordenarPorData(tabela, linhas, "prazo");
    }
}

document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    ordenarDemandas();
});
