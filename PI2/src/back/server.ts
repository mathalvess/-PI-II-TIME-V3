/*
 * Autor: Pedro Henrique Bassetto Ruiz
 * Server - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Ponto de entrada do backend: le a porta e coloca o app (app.ts) para escutar.
 */
import app from "./app";

// Porta de execução: usa PORT ou 3000 por padrão
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});