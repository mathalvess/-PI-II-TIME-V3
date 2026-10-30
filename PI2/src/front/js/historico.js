/* Carrega o historico de alteracoes da demanda atual. */
const listaHistorico = document.getElementById("lista-historico");

async function carregarHistorico() {
    if (!listaHistorico || !Number.isFinite(Number(idDemanda)) || Number(idDemanda) <= 0) return;
    try {
        const resposta = await buscarJSON("/historico/" + idDemanda);
        listaHistorico.innerHTML = "";
        if (!resposta.status) {
            listaHistorico.textContent = resposta.msg || "Nao foi possivel carregar o historico.";
            return;
        }
        if (!resposta.historico || resposta.historico.length === 0) {
            listaHistorico.textContent = "Nenhuma alteracao registrada ainda.";
            return;
        }
        for (const registro of resposta.historico) {
            const item = document.createElement("div");
            item.className = "border-bottom pb-2 mb-2";
            const titulo = document.createElement("strong");
            titulo.textContent = `${registro.nome} — ${registro.campo}`;
            const data = document.createElement("div");
            data.className = "small text-muted";
            data.textContent = registro.data_hora ? dataHoraBR(registro.data_hora) : "";
            const detalhe = document.createElement("p");
            detalhe.className = "mb-0";
            const anterior = registro.valor_anterior == null ? "—" : registro.valor_anterior;
            const novo = registro.valor_novo == null ? "—" : registro.valor_novo;
            detalhe.textContent = `${anterior} → ${novo}`;
            item.append(titulo, data, detalhe);
            listaHistorico.appendChild(item);
        }
    } catch (_erro) {
        listaHistorico.textContent = "Nao foi possivel carregar o historico. Confira a conexao com o servidor.";
    }
}

carregarHistorico();
