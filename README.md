# Dashboard de Alocações

Dashboard desenvolvido como uma extensão do Airtable para apoiar a alocação de membros em novos projetos. A ferramenta utiliza os dados armazenados na base para gerar rankings e visualizações que ajudam na identificação dos melhores **consultores**, **gerentes** e **madrinhas** para cada projeto.

---

# Visão Geral

O **Dashboard de Alocações** foi criado para tornar o processo de montagem de equipes mais analítico, visual e orientado por critérios objetivos. A partir das informações já registradas no Airtable, a extensão calcula pontuações e apresenta rankings dinâmicos com base em fatores como experiência, disponibilidade, preferências e desempenho anterior.

Seu principal público de uso são os **diretores responsáveis pela alocação de membros**.

---

# Problema que o projeto resolve

A alocação de pessoas para novos projetos pode se tornar subjetiva e descentralizada quando depende apenas de conhecimento informal sobre os membros.

Este dashboard busca resolver esse problema ao:

- facilitar a escolha de membros para novos projetos  
- centralizar critérios de decisão em uma interface visual  
- permitir comparação entre perfis de forma estruturada  
- apoiar decisões com base em dados já existentes no Airtable  

---

# Funcionalidades

### Ranking automático de membros
Gera classificações para **consultores**, **gerentes** e **madrinhas** com base em múltiplos critérios.

### Sistema de pesos configuráveis
Permite ajustar os pesos dos critérios para **consultores e gerentes**, adaptando o ranking ao contexto do projeto.

### Visualização detalhada de membros
Exibe informações específicas de cada membro para apoiar análises individuais.

### Integração com Airtable
Consome dados diretamente das tabelas da base utilizada pela extensão.

### Identificação de projetos sem equipe alocada
Destaca projetos que ainda não possuem equipe definida, considerando informações como kickoff.

---

# Tecnologias utilizadas

- React  
- TypeScript / TSX  
- TailwindCSS  
- Airtable Blocks SDK  
- Node.js  

---

# Instalação

## Pré-requisitos

Antes de iniciar, você precisa ter instalado:

- **Node.js**
- **npm**
- **Airtable Blocks CLI**

Instalação do CLI (caso necessário):

```bash
npm install -g @airtable/blocks-cli
