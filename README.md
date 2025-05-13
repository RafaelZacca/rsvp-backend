# RSVP Backend

A GraphQL backend built with:
- 🚀 Apollo Server (TypeScript)
- 🧠 Hasura (instant GraphQL engine on PostgreSQL)
- 🐘 PostgreSQL (relational database)
- 🔐 Microsoft OAuth for authentication
- 📦 Docker for local infrastructure

## 📁 Project Structure

```bash
rsvp-backend/
├── apollo/
│   ├── src/                   # Apollo server source code
│   ├── package.json           # Local scripts + dependencies
│   └── .env                   # Local environment variables
├── hasura/
│   ├── migrations/            # Hasura migrations
│   └── metadata/              # Hasura metadata
├── docker-compose.yml         # Infrastructure (Postgres + Hasura)
├── .env                       # Root env shared across services
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository and navigate into the project folder

```bash
cd rsvp-backend
```

### 2. Configure environment variables

#### `.env` (root level)

```env
POSTGRES_USER=POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DB=rsvp

HASURA_GRAPHQL_ADMIN_SECRET=your-hasura-graphql-admin-seret
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256", "key":"you-32-char-secret"}
```

#### `apollo/.env` (inside `apollo` folder)

```env
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=your-hasura-graphql-admin-seret
JWT_SECRET=supersecretjwtkeythatishardtoguess123456

MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:4000/auth/microsoft/callback
```

### 3. Start infrastructure (Postgres + Hasura)

```bash
npm run dev:up
```

This will:
- Run PostgreSQL on port `15432`
- Run Hasura on `http://localhost:8080`

### 4. Run Apollo Server locally

In a separate terminal:

```bash
cd apollo
npm install
npm run start
```

Apollo Server will be running at: `http://localhost:4000/graphql`

## 🧪 Useful Scripts

You can run these from the root of the project:

| Script                     | Description                            |
|----------------------------|----------------------------------------|
| `npm run dev:up`           | Start Hasura + Postgres containers     |
| `npm run dev:down`         | Stop containers                        |
| `npm run dev:logs`         | Show logs from Docker services         |
| `npm run dev:reset`        | Stop and wipe Docker volumes           |
| `npm run hasura:console`   | Open Hasura Console locally            |
| `npm run hasura:migrate`   | Apply Hasura migrations and metadata   |

Apollo server scripts (`apollo/package.json`):

| Script              | Description                      |
|---------------------|----------------------------------|
| `npm run start`     | Run Apollo server (TypeScript)   |
| `npm run lint`      | Run ESLint                       |
| `npm run format`    | Format code using Prettier       |

## 🔐 Microsoft OAuth Flow

1. User hits `/auth/microsoft` endpoint
2. They are redirected to Microsoft login
3. On success, the server:
   - Fetches the user's profile from Microsoft Graph API
   - Upserts the user in Hasura
   - Signs a **JWT token** with the internal `user.id`
4. JWT token is returned for frontend to use

**Authorization header format for GraphQL requests:**

```
Authorization: Bearer <your-token>
```

## 📬 Example GraphQL Query

```graphql
query {
  users {
    id
    email
    username
  }
}

mutation {
  createEvent(
    title: "Tech Meetup"
    description: "Open source talk"
    date: "2025-06-01T18:00:00Z"
    location: "Online"
  ) {
    id
    title
  }
}
```

## 📝 License

MIT