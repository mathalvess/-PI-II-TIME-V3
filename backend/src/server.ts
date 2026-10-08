/**
 * Projeto Integrador II - Sistema de Acompanhamento de Demandas
 * Arquivo: src/server.ts
 * Autor: Pedro Henrique Bassetto Ruiz
 * Descrição: ponto de entrada do backend, inicia o servidor na porta 3000.
 */
import app from "./app";

// Porta de execução: usa PORT ou 3000 por padrão
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});