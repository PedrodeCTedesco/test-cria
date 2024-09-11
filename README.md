A aplicação possui dois endpoints ('/users' e '/auth') que permitem operações CRUD mediante autenticação JWT.
Você pode rodar a aplicação em seu ambiente local ou em contêineres.

**Importante**: os arquivos de configuração como .env e Dockerfile e outros estão presentes para fins de facilitar a execução da aplicação ao clonar o repositório.

Para realização de testes utilize o comando:
```bash
npm run test
```

# Ambiente local

Para rodar a aplicação em ambiente local você deve se certificar que o Mongo Server está ativo e funcionando com as configurações corretas.

## Requisitos

- NestJS
[more info](https://docs.nestjs.com/)

- Node version: v20.11.1
[more info](https://nodejs.org/docs/latest/api/)

- NPM version: 10.8.2 
[more info](https://docs.npmjs.com/cli/v9/configuring-npm/install)

- MongoDB Compass: 1.44.3
[more info](https://www.mongodb.com/pt-br/docs/compass/current/)

- MongoDB Server: 7.0.14
[more info](https://www.mongodb.com/pt-br/docs/)

## Orientações

1. Clone o projeto do repositório do GitHub;
2. Certifique-se que está na _branch_ **prod**;
3. Inicie o Mongo Server;
4. Instale as dependências da aplicação com o comando ``` npm install ```
5. _Scripts_ para rodar a aplicação:

```bash 
npm run build 
``` 

```bash 
npm run start:dev 
``` 

# Ambiente Docker

Para rodar a aplicação em Docker.

## Requisitos

- Docker version: 27.1.1
[more info](https://docs.docker.com/)

- Docker Compose version v2.29.1-desktop.1
[more info](https://docs.docker.com/compose/)

## Orientações

1. Clone o projeto do repositório do GitHub;
2. Certifique-se que está na _branch_ **prod**;
3. _Scripts_ para rodar a aplicação:

Para construir as imagens sem iniciar os contêineres

```bash 
npm run build:docker 
```

Para construir as imagens e rodar os contêineres em primeiro plano

```bash 
npm run start:docker 
``` 

A aplicação estará acessível em http://localhost:8010

Caso queira rodar a aplicação em segundo plano utilize o comando:

```bash 
npm run start:docker:detach 
```

Agora você poderá verificar os contêineres em execução com:

```bash
docker ps
```

Ou mesmo verificar as imagens:

```bash 
docker images 
```

Para visualizar os logs das aplicações:

```bash 
npm run logs:docker 
```

Caso queira parar os contêineres utilize:

```bash 
npm run stop:docker 
```

# Como usar
A aplicação possui um endpoint chamado '/users' que permite realização de operações CRUD e um endpoint '/auth' cujas rotas permitem operações de autenticação do usuário para interagir com a aplicação. Para realizar operações CRUD com o endpoint '/users' você precisa de um token de acesso. 
Para gerar seu token de acesso siga os passos abaixo:

1. Envie via Postman/Insomnia uma requisição POST para http://localhost:8010/auth/register cujo corpo é:

```json
{
    "username": "[seu nome de usuário]",
    "password": "[sua senha]"
}
```

Você terá como retorno o seu token de acesso:

```json
{
    "acess_token": "[token]"
}
```

2. Com seu token de acesso você poderá acessar as rotas GET, POST, DELETE e PATCH enviando o token no cabeçalho da requisição:

```json
Authorization: Bearer "[token]"
```

Para saber quais as rotas estão disponíveis verifique a documentação da API.

3. Após o token expirar você pode obter um novo token através da rota: http://localhost:8010/auth/login utilizando no corpo da requisição as mesmas credenciais utilizadas no registro.

```json
{
    "username": "[seu nome de usuário]",
    "password": "[sua senha]"
}
```

# Documentação da API
Swagger: http://localhost:8010/api

# Documentação técnica

Rode o comando
```bash 
npm run docs 
``` 
Consulte o diretório ./documentation 