/*
 * Autor: Pedro Henrique Bassetto Ruiz
 * Util Feriados - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Consulta a API externa BrasilAPI para saber se uma data e feriado nacional.
 * Regra do Documento de Escopo (item 2.2.5): o prazo de finalizacao nao pode
 * cair em feriado nacional.
 * API usada: https://brasilapi.com.br/api/feriados/v1/{ano}
 */

// Formato de cada feriado que a BrasilAPI devolve.
// Exemplo: { "date": "2026-12-25", "name": "Natal", "type": "national" }
type FeriadoBrasilAPI = {
    date: string;
    name: string;
    type: string;
};

// Guarda os feriados de cada ano ja consultado, para nao chamar a API toda vez.
// Exemplo: cacheFeriados[2026] = [ ...lista de feriados de 2026... ]
const cacheFeriados: Record<number, FeriadoBrasilAPI[]> = {};

// Busca a lista de feriados nacionais de um ano na BrasilAPI.
// "async" porque precisa esperar a resposta da internet.
async function buscarFeriadosDoAno(ano: number): Promise<FeriadoBrasilAPI[]> {
    // Se esse ano ja foi consultado antes, devolve o que esta guardado.
    if (cacheFeriados[ano]) {
        return cacheFeriados[ano];
    }

    // fetch faz a requisicao HTTP para a API externa.
    const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);

    // Se a API respondeu com erro (ex.: fora do ar), avisa quem chamou.
    if (!resposta.ok) {
        throw new Error(`BrasilAPI respondeu com status ${resposta.status}`);
    }

    // Converte a resposta de texto JSON para uma lista de objetos.
    const feriados = (await resposta.json()) as FeriadoBrasilAPI[];
    cacheFeriados[ano] = feriados;
    return feriados;
}

// Confere se a data (formato AAAA-MM-DD) e feriado nacional.
// Devolve o nome do feriado (ex.: "Natal") ou null se nao for feriado.
export async function buscarFeriadoNacional(data: string): Promise<string | null> {
    // Os 4 primeiros caracteres da data sao o ano: "2026-12-25" -> 2026.
    const ano = Number(data.substring(0, 4));
    const feriados = await buscarFeriadosDoAno(ano);

    // ".find" procura na lista o primeiro feriado com a mesma data.
    const feriado = feriados.find((f) => f.date === data);

    // "?." le o nome so se achou o feriado; "?? null" devolve null se nao achou.
    return feriado?.name ?? null;
}