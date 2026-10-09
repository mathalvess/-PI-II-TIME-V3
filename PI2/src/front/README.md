# SAD - Sistema de Acompanhamento de Demandas

Projeto Integrador 2 - Engenharia de Software - PUC-Campinas - 2026.

Entrega da Reunião 2: as cinco telas iniciais do sistema feitas com HTML, CSS e
Bootstrap 5.

## Como rodar

Não precisa de servidor. É só abrir o arquivo `index.html` no navegador.

Se quiser rodar em localhost:

```
python3 -m http.server 8000
```

E acessar `http://localhost:8000`.

## Telas

| Arquivo | Tela |
|---|---|
| index.html | Login |
| dashboard.html | Dashboard |
| demandas.html | Listagem de demandas |
| demanda-form.html | Cadastro de demanda |
| demanda-detalhes.html | Detalhes da demanda |

O arquivo `css/estilo.css` tem os poucos estilos próprios do projeto. O resto do
visual vem do Bootstrap 5, carregado por CDN.

## O que foi seguido do documento de escopo

- Tipos de demanda: Tarefa, Defeito, Melhoria e Documentação
- Prioridades: Crítica, Alta, Média e Baixa
- Status: Aberta, Em andamento, Em revisão, Concluída e Cancelada
- No cadastro, o status já vem como Aberta e o responsável pode ficar em branco
- Na tela de detalhes, o botão Concluir está desabilitado porque a demanda
  precisa passar por Em revisão antes
- Não existe botão de excluir, só de cancelar
- A listagem tem filtros por status, prioridade, tipo e responsável, além de
  busca e ordenação
- O dashboard mostra os totais por status, prioridade e tipo, as demandas
  críticas em aberto e as que estão perto do prazo

## Observação

Os dados que aparecem nas telas são exemplos fixos, escritos no HTML. O login
também não valida nada ainda: o botão Entrar só leva para o dashboard. A
validação e os dados reais vão entrar quando o backend em Node.js e o banco de
dados forem feitos.

## Autor

Cada arquivo tem no topo um comentário com o nome do autor.
