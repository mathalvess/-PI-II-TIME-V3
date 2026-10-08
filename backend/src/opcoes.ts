/**
 * Projeto Integrador II - Sistema de Acompanhamento de Demandas
 * Arquivo: src/opcoes.ts
 * Autor: Pedro Henrique Bassetto Ruiz
 * Descrição: opções fixas da demanda definidas no Documento de Escopo
 *            (tipos, prioridades e status) e a rota GET /api/opcoes,
 *            que o frontend poderá usar para montar os campos de seleção.
 */
import { Router, Request, Response } from "express";

// Tipos de demanda (Escopo, item 2.2.1)
export const TIPOS = ["Tarefa", "Defeito", "Melhoria", "Documentação"];

// Prioridades, da mais urgente para a menos urgente (Escopo, item 2.2.2)
export const PRIORIDADES = ["Crítica", "Alta", "Média", "Baixa"];

// Status obrigatórios; toda demanda nova começa como "Aberta" (Escopo, item 2.2.3)
export const STATUS = ["Aberta", "Em andamento", "Em revisão", "Concluída", "Cancelada"];

const opcoesRouter = Router();

// GET /api/opcoes: devolve todas as listas de uma vez
opcoesRouter.get("/", (_req: Request, res: Response) => {
  res.json({ tipos: TIPOS, prioridades: PRIORIDADES, status: STATUS });
});

// GET /api/opcoes/:lista: devolve só uma lista (tipos, prioridades ou status)
opcoesRouter.get("/:lista", (req: Request, res: Response) => {
  const listas: Record<string, string[]> = {
    tipos: TIPOS,
    prioridades: PRIORIDADES,
    status: STATUS,
  };
  const lista = listas[String(req.params.lista)];

  // Lista que não existe: responde 404 com uma mensagem clara
  if (!lista) {
    res.status(404).json({ erro: "Lista não encontrada. Use: tipos, prioridades ou status." });
    return;
  }

  res.json(lista);
});

export default opcoesRouter;