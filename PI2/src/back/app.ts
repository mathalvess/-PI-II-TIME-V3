// Importa o express (o framework) e os tipos Request e Response (so para o TypeScript).
import express, { Request, Response, NextFunction } from "express";
// "path" e um modulo do proprio Node para montar caminhos de pastas.
import path from "path";
// Importa a classe que define as rotas de demanda.
import DemandaRouter from "./router/DemandaRouter";
import ProjetoRouter from "./router/ProjetoRouter";
import UsuarioRouter from "./router/UsuarioRouter";
import LoginRouter from "./router/LoginRouter";
import AcessoMiddleware from "./middleware/AcessoMiddleware";

// Cria o servidor Express (ainda nao esta escutando nenhuma porta).
const app = express();
// Faz o servidor entender o corpo das requisicoes que vem em JSON.
app.use(express.json());

// Entrega as telas HTML/CSS da pasta src/front (a raiz abre o login).
// process.cwd() e a pasta de onde o "npm run dev" foi executado.
app.use(express.static(path.resolve(process.cwd(), "src/front")));

// Rota de teste: GET /health responde que o servidor esta de pe.
// "_req" comeca com underline porque nao e usado (so o res e usado).
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Cria o roteador de demanda e vincula as rotas dele em /demanda.
// Antes de qualquer rota de demanda, projeto ou usuario, descobre quem esta pedindo.
const acesso = new AcessoMiddleware();

const demandaRoteador = new DemandaRouter();
app.use("/demanda", acesso.identificar_Usuario, demandaRoteador.criarRotasDemanda());

// Mesma ideia para projeto e usuario (por enquanto so listam, para os selects das telas).
const projetoRoteador = new ProjetoRouter();
app.use("/projeto", acesso.identificar_Usuario, projetoRoteador.criarRotasProjeto());

const usuarioRoteador = new UsuarioRouter();
app.use("/usuario", acesso.identificar_Usuario, usuarioRoteador.criarRotasUsuario());

// Login: POST /login confere o e-mail e a senha no banco.
const loginRoteador = new LoginRouter();
app.use("/login", loginRoteador.criarRotasLogin());

// Tratamento de erros inesperados (por exemplo, o banco de dados fora do ar).
// O Express reconhece que e um tratador de erros porque a funcao tem 4 parametros.
// Responde no mesmo formato do projeto, sem mostrar detalhes tecnicos para quem chamou.
app.use((erro: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Erro inesperado:", erro); // Os detalhes ficam so no terminal do servidor.
  res.status(500).send({ cod: 1, status: false, msg: "Erro interno do servidor" });
});

// Exporta o app para o server.ts usar (la ele e colocado para escutar uma porta).
export default app;
