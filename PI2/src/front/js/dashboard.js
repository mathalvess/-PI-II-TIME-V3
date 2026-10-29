/* Autor: Lucas Marassi Cipriano Pereira
   Tela de Dashboard (busca os dados na API) - Sistema de Acompanhamento de Demandas
   Projeto Integrador 2 */

// Procura em uma lista de contagens (ex.: [{status: "Aberta", qtd: 2}]) a quantidade de um valor.
// Se esse valor nao aparece na lista, e porque nao ha demandas nele: a quantidade e 0.
function quantidade(lista, campo, valor) {
    const item = lista.find(function (i) { return i[campo] === valor; });
    return item ? item.qtd : 0;
}

// Coloca um numero dentro de um elemento da pagina, pelo id dele.
function colocarNumero(id, numero) {
    document.getElementById(id).textContent = numero;
}

// Cria uma celula (<td>) com texto, com um elemento dentro ou com um link.
function criarCelula(linha, conteudo) {
    const td = document.createElement("td");
    if (typeof conteudo === "string") {
        td.textContent = conteudo;
    } else {
        td.appendChild(conteudo);
    }
    linha.appendChild(td);
}

// Cria o link com o titulo da demanda, que leva para a tela de detalhes (?id=...).
function criarLinkDemanda(d) {
    const link = document.createElement("a");
    link.href = "demanda-detalhes.html?id=" + d.id_demanda;
    link.textContent = d.titulo;
    return link;
}

// Monta a tabela "Demandas criticas em aberto".
function montarCriticas(demandas, projetos, usuarios) {
    const tabela = document.getElementById("tabela-criticas");
    tabela.innerHTML = "";

    if (demandas.length === 0) {
        tabela.innerHTML = '<tr><td colspan="5">Nenhuma demanda critica em aberto.</td></tr>';
        return;
    }

    demandas.forEach(function (d) {
        const linha = document.createElement("tr");
        criarCelula(linha, String(d.id_demanda).padStart(4, "0"));
        criarCelula(linha, criarLinkDemanda(d));
        criarCelula(linha, nomePorId(projetos, "id_projeto", d.id_projeto));
        criarCelula(linha, d.id_responsavel ? nomePorId(usuarios, "id_usuario", d.id_responsavel) : "Nao atribuido");
        criarCelula(linha, dataBR(d.prazo));
        tabela.appendChild(linha);
    });
}

// Monta a tabela "Demandas proximas do prazo".
function montarProximas(demandas) {
    const tabela = document.getElementById("tabela-proximas");
    tabela.innerHTML = "";

    if (demandas.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6">Nenhuma demanda com prazo definido.</td></tr>';
        return;
    }

    demandas.forEach(function (d) {
        const linha = document.createElement("tr");
        criarCelula(linha, String(d.id_demanda).padStart(4, "0"));
        criarCelula(linha, criarLinkDemanda(d));
        criarCelula(linha, d.tipo);
        criarCelula(linha, criarBadge(d.prioridade, CLASSES_PRIORIDADE[d.prioridade]));
        criarCelula(linha, criarBadge(d.status, CLASSES_STATUS[d.status]));
        criarCelula(linha, dataBR(d.prazo));
        tabela.appendChild(linha);
    });
}

// Busca os dados do dashboard na API e preenche a tela.
async function carregarDashboard() {
    try {
        const respostas = await Promise.all([
            buscarJSON("/demanda/dashboard"),
            buscarJSON("/projeto"),
            buscarJSON("/usuario")
        ]);
        const d = respostas[0];

        if (!d.status) {
            throw new Error(d.msg);
        }

        // Cards com o total e a quantidade por status.
        colocarNumero("n-total", d.total);
        colocarNumero("n-aberta", quantidade(d.por_status, "status", "Aberta"));
        colocarNumero("n-andamento", quantidade(d.por_status, "status", "Em andamento"));
        colocarNumero("n-revisao", quantidade(d.por_status, "status", "Em revisao"));
        colocarNumero("n-concluida", quantidade(d.por_status, "status", "Concluida"));
        colocarNumero("n-cancelada", quantidade(d.por_status, "status", "Cancelada"));

        // Tabela por prioridade.
        ["Critica", "Alta", "Media", "Baixa"].forEach(function (prioridade) {
            colocarNumero("prioridade-" + prioridade, quantidade(d.por_prioridade, "prioridade", prioridade));
        });

        // Tabela por tipo.
        ["Tarefa", "Defeito", "Melhoria", "Documentacao"].forEach(function (tipo) {
            colocarNumero("tipo-" + tipo, quantidade(d.por_tipo, "tipo", tipo));
        });

        montarCriticas(d.criticas_em_aberto, respostas[1].projetos, respostas[2].usuarios);
        montarProximas(d.proximas_do_prazo);
    } catch (erro) {
        mostrarMensagem("Nao foi possivel carregar o dashboard. Confira se o servidor e o banco de dados estao ligados.");
    }
}

// Roda assim que a pagina abre.
carregarDashboard();
