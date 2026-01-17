# Device Farm Hub

AWS Device Farm management dashboard with Next.js, Prisma, and PostgreSQL.

## Features

- 🔐 NextAuth.js authentication
- 📱 Project & app management
- 🧪 Test run monitoring
- 🎨 Dark/light theme
- 📚 Swagger API docs
- 🧪 API testing console

## Quick Start

```bash
# Install
npm install

# Setup database (use db push, not migrate)
npx prisma db push
npx prisma generate

# Start
npm run dev
```

**Or use the setup script:**

```bash
./setup.sh
```

## Environment Variables

Create `.env`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/device_farm_hub"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-west-2"

```

- **Sign Up**: http://localhost:3000/auth/signup (Create account)
- **Sign In**: http://localhost:3000/auth/signin
- Dashboard: http://localhost:3000/dashboard
- API Docs: http://localhost:3000/api-docs
- API Test: http://localhost:3000/api-test

## API Endpoints

### Projects

- `GET /api/projects` - List
- `POST /api/projects` - Create
- `GET /api/projects/:id` - Get
- `PATCH /api/projects/:id` - Update
- `DELETE /api/projects/:id` - Delete

### Device Pools

- `GET /api/device-pools` - List
- `POST /api/device-pools` - Create

### Devices

- `GET /api/devices` - List all
- `GET /api/devices?platform=android` - Android only

### Apps

- `GET /api/apps?projectId=xxx` - List
- `POST /api/apps` - Upload

### Runs

- `GET /api/runs?projectId=xxx` - List
- `POST /api/runs` - Schedule
- `POST /api/runs/:id/stop` - Stop
- `GET /api/runs/:id/artifacts` - Get artifacts

## Tech Stack

- Next.js 16
- Prisma + PostgreSQL
- NextAuth.js
- shadcn/ui
- AWS SDK
- Swagger UI
