/* Autor: Eduardo Campos Ferreira Filho
   Ordenacao da tela de listagem de demandas - Projeto Integrador 2 */

// A ordem certa de cada coisa. Texto em ordem alfabetica nao daria isso.
const ordemPrioridade = ["Critica", "Alta", "Media", "Baixa"];
const ordemStatus = ["Aberta", "Em andamento", "Em revisao", "Concluida", "Cancelada"];

// Pra prioridade e status: pra cada valor da lista, joga pro fim da tabela as linhas
// que tem esse valor. Quando termina, ficou tudo na ordem da lista.
function ordenarPorLista(tabela, linhas, campo, ordem) {
    for (const valor of ordem) {
        for (const linha of linhas) {
            if (linha.dataset[campo] === valor) {
                tabela.appendChild(linha);
            }
        }
    }
}

// Pra datas: o sort compara as linhas de duas em duas.
function ordenarPorData(tabela, linhas, campo) {
    linhas.sort(function (a, b) {
        const dataA = a.dataset[campo];
        const dataB = b.dataset[campo];

        // Quem nao tem prazo vai pro fim.
        if (dataA === "") {
            return 1;
        }
        if (dataB === "") {
            return -1;
        }
        // A data vem como 2026-09-10, entao comparar como texto ja funciona.
        if (dataA < dataB) {
            return -1;
        }
        if (dataA > dataB) {
            return 1;
        }
        return 0;
    });

    // Depois de ordenar, recoloca as linhas na tabela nessa ordem.
    for (const linha of linhas) {
        tabela.appendChild(linha);
    }
}

// Olha o que ta escolhido em Ordenar por e chama a funcao certa.
function ordenarDemandas() {
    const tabela = document.getElementById("tabela-demandas");
    // O Array.from transforma as linhas numa lista normal, senao o sort nao funciona.
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

// Ordena quando clica em Filtrar.
document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    ordenarDemandas();
});
