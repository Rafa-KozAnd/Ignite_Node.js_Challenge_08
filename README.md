<p align="center">
  <img src="http://img.shields.io/static/v1?label=STATUS&message=Concluded&color=blue&style=flat"/>
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/Rafa-KozAnd/Ignite_Node.js_Challenge_08">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/top/Rafa-KozAnd/Ignite_Node.js_Challenge_08">
  <img alt="GitHub repo file count" src="https://img.shields.io/github/directory-file-count/Rafa-KozAnd/Ignite_Node.js_Challenge_08">
  <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/Rafa-KozAnd/Ignite_Node.js_Challenge_08">
  <img alt="GitHub language count" src="https://img.shields.io/github/license/Rafa-KozAnd/Ignite_Node.js_Challenge_08">
</p>

# Ignite_Node.js_Challenge_08

Node JS challenge done with 'Rocketseat' Ignite course. ("Desafio 08 - Transferências com a FinAPI")

# 💻 Sobre o desafio

Nesse desafio você irá implementar uma nova funcionalidade na FinAPI, a aplicação que foi testada durante o desafio **[Testes unitários](https://www.notion.so/Desafio-01-Testes-unit-rios-0321db2af07e4b48a85a1e4e360fcd11)**.

A nova funcionalidade deverá permitir a transferência de valores entre contas. Para isso, você pode pensar na melhor forma de construir essa solução mas alguns requisitos deverão ser cumpridos:

- Não deve ser possível transferir valores superiores ao disponível no saldo de uma conta;
- O balance (obtido através da rota `/api/v1/statements/balance`) deverá considerar também todos os valores transferidos ou recebidos através de transferências ao exibir o saldo de um usuário;
- As informações para realizar uma transferência serão:

{
	"amount": 100,
	"description": "Descrição da transferência"
}

Você pode passar o `id` do usuário destinatário via parâmetro na rota (exemplo: `/api/v1/statements/transfers/:user_id`) e o id do usuário remetente poderá ser obtido através do token JWT enviado no header da requisição;

- Ao mostrar o balance de um usuário, operações do tipo `transfer` deverão possuir os seguintes campos:

{
  "id": "4d04b6ec-2280-4dc2-9432-8a00f64e7930",
	"sender_id": "cfd06865-11b9-412a-aa78-f47cc3e52905"
  "amount": 100,
  "description": "Transferência de valor",
  "type": "transfer",
  "created_at": "2021-03-26T21:33:11.370Z",
  "updated_at": "2021-03-26T21:33:11.370Z"
}

Observe o campo sender_id. Esse deverá ser o id do usuário que enviou a transferência.
O campo type também deverá exibir o tipo da operação, que nesse caso é transfer.
