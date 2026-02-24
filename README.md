# ⛪ Paróquia API

Este repositório contém o Backend (API) do sistema institucional da paróquia. O projeto é construído sobre a arquitetura Serverless da Cloudflare, utilizando Workers (TypeScript) para lógica de negócios e persistência de dados.

O objetivo principal desta API é desacoplar o Painel Administrativo do Site Público, garantindo máxima segurança e desempenho através da Edge Computing.

## Funções Principais:

1. Autenticação: Gerencia o login e a sessão dos responsáveis (administradores) utilizando tokens.

2. CRUD (Create, Read, Update, Delete): Interage com o banco de dados Cloudflare D1 para gerenciar dados transacionais (administradores, rascunhos de notícias, horários, etc.).

3. Publicação na Edge: Processa o conteúdo salvo pelo Admin e o armazena pré-formatado no Cloudflare Workers KV para consumo de baixa latência pelo Site Público.

## Tecnologias Utilizadas:

- **Cloudflare Workers**: Plataforma serverless para executar código na borda da rede.
- **TypeScript**: Linguagem de programação utilizada para desenvolver a API.
- **Cloudflare D1**: Banco de dados SQLite para armazenamento de dados transacionais.
- **Cloudflare Workers KV**: Armazenamento de chave-valor para dados de alta performance.
  -- **Wrangler**: Ferramenta de linha de comando para desenvolver e implantar Workers.

## Configuração e Desenvolvimento Local

Para rodar este Worker localmente, você precisa configurar as variáveis de ambiente e as conexões da Cloudflare.

1. Pré-requisitos
   a. Node.js (versão LTS) e npm instalados.
   b. Wrangler CLI instalado globalmente: npm install -g wrangler
   c. Uma conta na Cloudflare com os seguintes recursos criados:

   - Um D1 Database (Nome sugerido: paroquia-db).
   - Um KV Namespace (Nome sugerido: paroquia-storage).

2. Configuração do Projeto
   a. Clone este repositório:

   ```bash
   git clone https://github.com/SEU_USER/api.git
   cd api
   ```

   b. Instale as dependências:

   ```bash
   npm install
   ```

3. Atualize o wrangler.toml com os IDs reais do seu D1 e KV (obtidos no Painel da Cloudflare).

## Rodando o Servidor Local

1. Faça login no Cloudflare via CLI:

   ```bash
   wrangler login
   ```

2. Inicie o servidor de desenvolvimento. O Wrangler irá simular o ambiente Cloudflare na sua máquina:

   ```bash
   wrangler dev
   ```

## Rotas (Endpoints)

Visualize a API completa no endereço: [https://api.paroquiasaojosecaragua.org.br/docs](https://api.paroquiasaojosecaragua.org.br/docs)

## Licença

Este projeto é distribuído sob a Licença MIT. Para mais detalhes, veja o arquivo [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
