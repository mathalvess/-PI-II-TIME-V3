/**
 * Consulta os feriados nacionais brasileiros pela BrasilAPI.
 * Cache por ano para evitar chamadas repetidas durante o uso do sistema.
 */
type Feriado = { date: string; name: string; type?: string };
const cacheFeriados = new Map<number, { expira: number; datas: Set<string> }>();
const CACHE_MS = 12 * 60 * 60 * 1000;

export async function ehFeriadoNacional(data: string): Promise<boolean> {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
    if (!partes) throw new Error("Data inválida. Use AAAA-MM-DD.");

    const ano = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    const dataObj = new Date(Date.UTC(ano, mes - 1, dia));
    if (dataObj.getUTCFullYear() !== ano || dataObj.getUTCMonth() !== mes - 1 || dataObj.getUTCDate() !== dia) {
        throw new Error("Data inválida.");
    }

    const agora = Date.now();
    const salvo = cacheFeriados.get(ano);
    if (salvo && salvo.expira > agora) return salvo.datas.has(data);

    const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(8000)
    });
    if (!resposta.ok) throw new Error(`Não foi possível consultar os feriados nacionais (HTTP ${resposta.status}).`);

    const feriados = await resposta.json() as Feriado[];
    if (!Array.isArray(feriados)) throw new Error("Resposta inválida da consulta de feriados.");
    const datas = new Set(feriados.map((feriado) => feriado.date));
    cacheFeriados.set(ano, { expira: agora + CACHE_MS, datas });
    return datas.has(data);
}
