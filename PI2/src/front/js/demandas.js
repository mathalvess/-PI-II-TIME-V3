/* Autor: Lucas Marassi Cipriano Pereira
   Tela de Listagem de Demandas (busca os dados na API) - Sistema de Acompanhamento de Demandas
   Projeto Integrador 2 */

// Busca as demandas, os projetos e os usuarios e monta a tabela.
async function carregarDemandas() {
    const tabela = document.getElementById("tabela-demandas");
    const contador = document.getElementById("contador");

    try {
        // Faz as tres chamadas ao mesmo tempo e espera as tres respostas.
        const respostas = await Promise.all([
            buscarJSON("/demanda"),
            buscarJSON("/projeto"),
            buscarJSON("/usuario")
        ]);
        const demandas = respostas[0].demandas;
        const projetos = respostas[1].projetos;
        const usuarios = respostas[2].usuarios;

        // Se a API respondeu com erro, nao existe lista para mostrar.
        if (!respostas[0].status) {
            throw new Error(respostas[0].msg);
        }

        contador.textContent = demandas.length + " demandas encontradas";
        tabela.innerHTML = ""; // limpa a tabela antes de preencher

        // Para cada demanda, cria uma linha (<tr>) na tabela.
        demandas.forEach(function (d) {
            const linha = document.createElement("tr");

            // Funcao pequena que cria uma celula (<td>) com um texto ou com um elemento dentro.
            function celula(conteudo) {
                const td = document.createElement("td");
                if (typeof conteudo === "string") {
                    td.textContent = conteudo;
                } else {
                    td.appendChild(conteudo);
                }
                linha.appendChild(td);
            }

            celula(String(d.id_demanda).padStart(4, "0"));
            celula(d.titulo);
            celula(d.tipo);
            celula(criarBadge(d.prioridade, CLASSES_PRIORIDADE[d.prioridade]));
            celula(criarBadge(d.status, CLASSES_STATUS[d.status]));
            celula(nomePorId(projetos, "id_projeto", d.id_projeto));
            // Se a demanda nao tem responsavel, mostra "Nao atribuido".
            celula(d.id_responsavel ? nomePorId(usuarios, "id_usuario", d.id_responsavel) : "Nao atribuido");
            celula(dataBR(d.data_criacao));
            celula(dataBR(d.prazo));

            // Botao "Ver": leva para a tela de detalhes passando o id na URL (?id=2).
            const botao = document.createElement("a");
            botao.href = "demanda-detalhes.html?id=" + d.id_demanda;
            botao.className = "btn btn-sm btn-primary";
            botao.textContent = "Ver";
            celula(botao);

            tabela.appendChild(linha);
        });

        if (demandas.length === 0) {
            tabela.innerHTML = '<tr><td colspan="10">Nenhuma demanda cadastrada.</td></tr>';
        }
    } catch (erro) {
        contador.textContent = "Erro ao carregar as demandas";
        mostrarMensagem("Nao foi possivel carregar as demandas. Confira se o servidor e o banco de dados estao ligados.");
    }
}

// Roda assim que a pagina abre.
carregarDemandas();
