# Cobrança de Frete — Start Química

Sistema **multi-tenant** para gestão de cobranças de frete, integrando transportadores, tomadores e documentos fiscais (CTe, NFe, NFS) ao ERP **Sankhya**.

---

## Funcionalidades

- **Gestão de cobranças** com ciclo de vida completo: Rascunho → Pendente → Enviada → Cancelada
- **Envio ao ERP Sankhya** via serviço `ImportacaoEDIFreteSP.integrarDocTransp`
- **Documentos fiscais** vinculados a cada cobrança (CTe, NFe, NFS) com notas de entrega
- **Transportadores e Tomadores** com CNPJ, cadastrados por tenant
- **Multi-tenancy** automático — cada empresa (tenant) enxerga apenas seus próprios dados
- **Gestão de usuários** com controle de acesso baseado em papéis (RBAC)
- **Dashboard** com indicadores por status, tipo e valor; visão consolidada para o administrador
- **Recuperação de senha** por e-mail com token de expiração de 1 hora
- **Autenticação JWT** stateless

---

## Tech Stack

### Backend

| Tecnologia | Versão |
|---|---|
| Java | 17 |
| Spring Boot | 3.4.4 |
| Spring Security + JWT (jjwt) | 0.12.5 |
| Spring Data JPA / Hibernate | — |
| PostgreSQL | — |
| Flyway (migrações) | — |
| Spring AOP (isolamento multi-tenant) | — |
| Spring Mail | — |
| Lombok | — |
| Maven | — |

### Frontend

| Tecnologia | Versão |
|---|---|
| React | 19 |
| TypeScript | 5.9 |
| Vite | 8 |
| React Router DOM | 7 |
| Axios | 1 |
| React Hook Form + Zod | 7 / 4 |
| Tailwind CSS | 3 |
| lucide-react | — |
| jwt-decode | 4 |

---

## Pré-requisitos

- **Java 17+**
- **Node.js 18+** e **npm**
- **PostgreSQL** (banco `cobranca` criado previamente)
- Maven Wrapper incluso (`./mvnw` ou `mvnw.cmd`)

---

## Configuração

### Variáveis de ambiente — Backend

Configure as variáveis abaixo antes de iniciar o backend. Os valores indicados são os padrões de desenvolvimento.

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/cobranca` | URL de conexão com o PostgreSQL |
| `DB_USERNAME` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `123456` | Senha do banco |
| `JWT_SECRET` | *(chave base64 embutida)* | ⚠️ **Obrigatório trocar em produção** |
| `JWT_EXPIRATION` | `86400000` | Expiração do JWT em ms (padrão: 24h) |
| `MAIL_HOST` | `smtp.gmail.com` | Servidor SMTP para envio de e-mails |
| `MAIL_PORT` | `587` | Porta SMTP |
| `MAIL_USERNAME` | — | Usuário SMTP |
| `MAIL_PASSWORD` | — | Senha SMTP |
| `FRONTEND_URL` | `http://localhost:5173` | URL do frontend (usada nos e-mails de reset) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origens permitidas pelo CORS |
| `SANKHYA_LOGIN_URL` | — | URL de autenticação Sankhya |
| `SANKHYA_SERVICE_URL` | — | URL do serviço Sankhya |
| `SANKHYA_AUTH_ENABLED` | `true` | Ativa/desativa integração Sankhya |

---

## Como executar

### Backend

```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Para gerar o JAR e executá-lo:

```bash
# Windows
mvnw.cmd clean package
java -jar target\backend-0.0.1-SNAPSHOT.jar

# Linux / macOS
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

O servidor sobe em `http://localhost:8080/api`.

> As migrações Flyway são executadas automaticamente na inicialização.
> Um usuário `ADMIN_TENANT` padrão é criado: **admin@startquimica.com.br** / **admin** (altere em produção).

### Frontend

```bash
cd frontend

npm install

# Servidor de desenvolvimento (porta 5173)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

O frontend estará disponível em `http://localhost:5173`.
Requisições para `/api` são automaticamente redirecionadas para `http://localhost:8080` pelo proxy do Vite em desenvolvimento.

---

## API — Endpoints principais

> Todos os endpoints requerem `Authorization: Bearer <token>`, exceto `/api/auth/**`.

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/api/auth/login` | Autenticação, retorna JWT | Público |
| `POST` | `/api/auth/forgot-password` | Envia e-mail de recuperação de senha | Público |
| `GET/POST/PUT/DELETE` | `/api/tenants` | CRUD de empresas | `ADMIN_TENANT` |
| `GET` | `/api/usuarios` | Lista usuários do tenant | Autenticado |
| `POST/PUT/DELETE` | `/api/usuarios` | Gerencia usuários | `ADMIN_TENANT`, `GERENTE` |
| `PATCH` | `/api/usuarios/me/senha` | Altera a própria senha | Autenticado |
| `GET/POST/PUT/DELETE` | `/api/cobrancas` | CRUD de cobranças (paginado) | Autenticado |
| `POST` | `/api/cobrancas/{id}/enviar` | Envia cobrança ao Sankhya | `ADMIN_TENANT`, `GERENTE`, `OPERADOR` |
| `GET/POST/PUT/DELETE` | `/api/transportadores` | CRUD de transportadores | Autenticado |
| `GET/POST/PUT/DELETE` | `/api/tomadores` | CRUD de tomadores | Autenticado |
| `GET` | `/api/dashboard` | Indicadores e estatísticas | Autenticado |

---

## API Externa para Cobranças

Endpoint público para criação e envio de cobranças diretamente pelo sistema Sankhya ou qualquer integrador externo, sem necessidade de login JWT.

### Autenticação

Cada tenant possui uma **API Key** gerada automaticamente no cadastro, visível na tela de **Tenants** (coluna "API Key") e no formulário de edição. Envie-a no header:

```
X-API-Key: <sua-api-key>
```

### Endpoint

```
POST /api/api-externa/cobrancas
Content-Type: application/json
X-API-Key: <sua-api-key>
```

### Corpo da requisição

```json
{
  "cnpjTransportador": "12345678000195",
  "cnpjContratante": "98765432000100",
  "ordemCarga": 1001,
  "tipoTransporte": "T",
  "tipoCobranca": "NM",
  "docFisc": [
    {
      "numDoc": 42,
      "serieDoc": "1",
      "valor": 1500.00,
      "emissao": "20/03/2026",
      "vencimento": "20/04/2026",
      "baseCalculo": 1500.00,
      "aliquota": 10.00,
      "valorImposto": 150.00,
      "chave": "35260312345678000195570000000004200000042000",
      "TipoDoc": "CTE",
      "notas": [
        {
          "numero": 100,
          "serie": "1",
          "dataEntrega": "22/03/2026"
        }
      ]
    }
  ]
}
```

### Resposta — sucesso (`201 Created`)

```json
{
  "success": true,
  "protocolo": "PROT-20260328-001",
  "cobrancaId": 57
}
```

### Resposta — erro de autenticação (`401 Unauthorized`)

```json
{
  "success": false,
  "error": "API key inválida"
}
```

### Resposta — erro de negócio (`422 Unprocessable Entity`)

```json
{
  "success": false,
  "error": "Transportador não encontrado para o CNPJ: 12345678000195"
}
```

### Comportamento

1. Valida o header `X-API-Key` — retorna 401 se ausente ou inválida.
2. Busca `Transportador` e `Tomador` por CNPJ no cadastro do tenant — retorna 422 se não encontrado.
3. Cria a cobrança com status **Pendente (`P`)**.
4. Envia imediatamente ao Sankhya via `ImportacaoEDIFreteSP.integrarDocTransp`.
5. Em caso de erro no envio, a cobrança é excluída (rollback) e o erro é retornado.
6. Em caso de sucesso, retorna o protocolo Sankhya e o ID da cobrança criada (status `E`).

> **Pré-condição:** Transportador e Tomador devem estar previamente cadastrados no tenant correspondente.

### Filtros disponíveis em `GET /api/cobrancas`

`status`, `tipoCobranca`, `tipoTransporte`, `transportador`, `alteracaoDe`, `alteracaoAte`, `envioDe`, `envioAte`

---

## Papéis e permissões

| Papel | Escopo | Permissões |
|---|---|---|
| `ADMIN_TENANT` | Global (todos os tenants) | Acesso total; gerencia tenants e usuários |
| `GERENTE` | Tenant próprio | CRUD completo de cobranças, transportadores, tomadores e usuários do tenant |
| `OPERADOR` | Tenant próprio | Cria e edita cobranças; envia ao Sankhya |
| `VISUALIZADOR` | Tenant próprio | Somente leitura |

---

## Banco de dados

As migrações são gerenciadas pelo **Flyway** e executadas automaticamente na inicialização.

| Migração | Descrição |
|---|---|
| `V1__init_schema.sql` | Schema inicial: tenants, usuarios, transportadores, tomadores, cobrancas, documentos_fiscais, notas |
| `V2__add_sankhya_fields.sql` | Campos `data_envio` e `protocolo_sankhya` em `cobrancas` |
| `V3__add_data_ultima_alteracao.sql` | Campo `data_ultima_alteracao` em `cobrancas` |
| `V4__add_indexes.sql` | Índices de performance em `cobrancas` |
| `V5__add_password_reset_token.sql` | Campos de token de recuperação de senha em `usuarios` |
| `V6__add_api_key_to_tenant.sql` | Campo `api_key` único em `tenants` para autenticação da API externa |

### Status de cobrança

| Código | Significado |
|---|---|
| `R` | Rascunho |
| `P` | Pendente |
| `E` | Enviada |
| `C` | Cancelada |

---

## Estrutura do projeto

```
Cobranca/
├── backend/                        # API Spring Boot
│   ├── src/main/java/br/com/startquimica/backend/
│   │   ├── config/                 # Configurações (Security, CORS, Flyway)
│   │   ├── controller/             # Endpoints REST
│   │   ├── domain/                 # Entidades JPA
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── exception/              # Tratamento de erros
│   │   ├── repository/             # Repositórios Spring Data
│   │   ├── security/               # JWT, filtros, multi-tenant aspect
│   │   └── service/                # Regras de negócio
│   └── src/main/resources/
│       ├── application.yml         # Configurações da aplicação
│       └── db/migration/           # Scripts Flyway
│
└── frontend/                       # SPA React + TypeScript
    └── src/
        ├── components/             # Componentes reutilizáveis e formulários
        ├── contexts/               # AuthContext, ToastContext, ConfirmContext
        ├── pages/                  # Páginas: Login, Dashboard, Cobranças, etc.
        ├── services/               # Cliente Axios (api.ts)
        └── types/                  # Tipos TypeScript globais
```
