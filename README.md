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
