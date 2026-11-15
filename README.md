# Poeta

Sistema pessoal de organização: notas, ideias, tarefas, planos e progresso.
HTML, CSS e JavaScript puro, com dados no `localStorage`. Básico bem feito.

## Central de Evolução Pessoal
Registro e acompanhamento de Faculdade, Treinos (Muay Thai, Corrida, Pedal, Musculação), Concursos e Cursos, com metas de progresso automático, histórico geral e dashboard (filtros por dia, semana, mês e período). Tudo calculado a partir dos registros reais, salvo no `localStorage`.
- `evolucao.js`: modelos, indicadores, metas, exportação/importação (backup v2) e migração. Carregado antes do `script.js`.
- Backup v2: `{ app, version, exportedAt, data }`. Importação valida o arquivo, mostra resumo e permite mesclar (sem duplicar) ou substituir (guarda cópia dos dados atuais). Backups antigos (v1) continuam importáveis.

## Novidades do visual
Tema escuro com aurora e cartões de vidro, intro animada com a logo, dashboard com calendário do dia, eventos e gráficos em SVG.

## Como usar
Abra `index.html` no navegador (ou use o link do GitHub Pages).

## Estrutura
- `index.html`: estrutura da página
- `style.css`: identidade visual e responsividade
- `assets/icons/logo.png`: logo usada na intro e na barra lateral
- `script.js`: lógica (camada `Storage` isolada, `Repo` para dados, `Views` para telas)

## Backup
Os dados ficam só no navegador. Em Configurações, use Exportar dados para gerar um `.json`
e Importar dados para restaurar.

## Evolução futura
Para trocar o LocalStorage por API/banco, altere apenas o objeto `Storage` em `script.js`.

## Publicar no GitHub Pages
1. Suba a pasta no GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. No repositório: Settings, Pages, Source: branch `main`, pasta `/ (root)`.
