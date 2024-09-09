A aplicação consiste em um endpoint /users que permite operações CRUD. 
As rotas são protegidas por JWT.
Você pode rodar a aplicação em seu ambiente local ou gerar as imagens Docker e rodá-las em contêineres.

*Importante*: os arquivos de configuração como .env e Dockerfile estão presentes para fins de facilitar a execução da aplicação ao clonar o repositório.

Para realização de testes utilize o comando:

- npm run test

# Ambiente local

Nesta seção temos as instruções para rodar a aplicação em ambiente local.

## Requisitos
- Node version: v20.11.1
- NPM version: 10.8.2
- MongoDB Compass: 1.44.3
- MongoDB Server: 7.0.14

## Orientações

1. Clone o projeto do repositório do GitHub (disponível em package.json, repositories);
2. Certifique-se que está na _branch_ *prod*;
3. Instale as dependências com o comando npm install
4. Scripts para rodar a aplicação:

- npm run build: para build da aplicação
- npm run start:dev: inicia a aplicação em modo de desenvolvimento

## Como usar
A aplicação possui um endpoint chamado '/users'. Para poder acessá-lo e realizar operações CRUD você precisa de um token de acesso. 
Para gerar seu token de acesso siga os passos abaixo:

1. Envie via Postman/Insomnia uma requisição POST para http://localhost:8010/auth/register cujo corpo é:
{
    "username": [seu nome de usuário],
    "password": [sua senha]
}

Você terá como retorno o seu token de acesso:

{
    "acess_token": [token]
}

2. Com seu token de acesso você poderá acessar as rotas GET, POST, DELETE e PATCH enviando o token no cabeçalho da requisição:

'Authorization': 'Bearer [token]'

Para saber quais as rotas disponíveis verifique a documentação da API.


# Ambiente Docker

Nesta seção temos as instruções para rodar a aplicação em Docker.

## Requisitos

- Docker version: 27.1.1
- Docker Compose version v2.29.1-desktop.1

## Orientações

1. Clone o projeto do repositório do GitHub (disponível em package.json, repositories)
2. Certifique-se que está na _branch_ *prod*;
3. Instale as dependências com o comando npm install
4. Scripts para rodar a aplicação:

- npm run build:docker (para construir as imagens sem iniciar os contêineres)
- npm run start:docker (para construir as imagens e rodar os contêineres em primeiro plano execute)

A aplicação estará acessível em http://localhost:8010

Caso queira rodar a aplicação em segundo plano para utilizar outros comandos do Docker (como docker ps) utilize o comando:

- npm run start:docker:detach

Agora você poderá verificar os contêineres em execução com:

- docker ps

Ou mesmo verificar as imagens:

- docker images

Para visualizar os logs das aplicações:

- npm run logs:docker

Caso queira parar os contêineres utilize:

- npm run stop:docker

Para interagir com a aplicação siga os passos descritos na seção *como usar* do ambiente local.

## Configurações
Verifique os arquivos de configuração para dúvidas pontuais:

- docker-compose.yml
- Dockerfile


# Documentação da API
Swagger: http://localhost:8010/api

# Documentação técnica

- Consulte o diretório ./documentation 
- Caso não o encontre rode o comando: npm run docs