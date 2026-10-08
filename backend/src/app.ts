/**
 * Projeto Integrador II - Sistema de Acompanhamento de Demandas
 * Arquivo: src/app.ts
 * Autor: Pedro Henrique Bassetto Ruiz
 * Descrição: cria a aplicação Express e define as rotas iniciais.
 */
import express, { Request, Response } from "express";

import opcoesRouter from "./opcoes";

const app = express();
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Servidor do Sistema de Acompanhamento de Demandas funcionando!");
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Rotas das opções da demanda (tipos, prioridades e status)
app.use("/api/opcoes", opcoesRouter);

export default app;