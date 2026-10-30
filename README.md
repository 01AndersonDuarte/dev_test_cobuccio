# Carteira Financeira

API para gerenciar carteiras financeiras. Permite criar usuários, autenticar, adicionar saldo, consultar saldo, realizar transferências e estornar transferências recebidas.

## Tecnologias

- TypeScript e NestJS
- Prisma ORM
- PostgreSQL
- Docker
- Swagger

## Executar com Docker Compose

Requisitos: Docker e Docker Compose.

Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

Configure o .env para o banco do Compose:

```bash
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/postgres"
JWT_SECRET="defina_um_segredo"
```

Inicie a aplicação e o banco:

```bash
docker compose up --build -d
```

A API ficará disponível em http://localhost:5000 e a documentação Swagger em http://localhost:5000/docs.

## Executar localmente

Requisitos: Node.js, npm e PostgreSQL local.

Copie o arquivo de ambiente e instale as dependências:

```bash
cp .env.example .env
npm install
```

Configure o DATABASE_URL para apontar para seu banco local. Por exemplo:

```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
JWT_SECRET="defina_um_segredo"
```

Crie/aplique as migrações e inicie a aplicação:

```bash
npm run prisma:dev
npm run start:dev
```

A API ficará disponível em http://localhost:3000 e a documentação Swagger em http://localhost:3000/docs.

## Executar os testes

Os testes E2E usam Testcontainers para iniciar um PostgreSQL temporário. É necessário ter o Docker em execução:

```bash
npm run test:e2e
```

Para executar apenas um arquivo E2E:

```bash
npm run test:e2e -- test/integration/transfers.e2e-spec.ts
```

## Decisões técnicas

### Arquitetura

O projeto utiliza a arquitetura modular do **NestJS**, com separação de responsabilidades entre **Controllers, Services e Repositories**, seguindo os princípios SOLID.

- **Controllers:** gerenciamento das requisições HTTP.
- **Services:** implementação das regras de negócio.
- **Repositories:** persistência e consultas utilizando Prisma.

### Persistência e consistência

O **PostgreSQL** foi escolhido pelo suporte a transações ACID e integridade relacional.

As transferências e estornos utilizam `prisma.$transaction()`, garantindo atomicidade: em caso de falha, todas as alterações são revertidas.

Para evitar condições de corrida e saldo negativo, são utilizadas atualizações atômicas com validação de saldo disponível.

Os valores monetários são armazenados em centavos, utilizando números inteiros.

### Estornos

Somente o beneficiário pode estornar uma transferência recebida.

Os estornos são registrados separadamente na entidade `Reversal`, preservando o histórico original. Uma restrição de unicidade impede múltiplos estornos da mesma transferência.

A devolução exige saldo disponível e é efetuada atomicamente.

### Segurança

- Autenticação baseada em JWT.
- Validação de autorização nas operações financeiras.
- Proteção contra enumeração de usuários no cadastro.
- Validação de saldo e integridade transacional.

### Documentação

- **Swagger:** documentação interativa dos endpoints da API.

### Observabilidade

- **Pino:** logging estruturado de requisições e eventos.
- **Health Check:** verificação de disponibilidade da aplicação e conectividade com PostgreSQL.
