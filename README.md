# PaperBook - School Management System

A comprehensive school management system built with React, TypeScript, and modern web technologies.

## Features

- **27 Feature Modules**: Students, Staff, Attendance, Exams, LMS, Finance, Library, Transport, and more
- **Role-Based Access Control**: 8 user roles with granular permissions
- **Modern UI**: Built with Radix UI primitives and Tailwind CSS
- **Type Safety**: Full TypeScript coverage with strict mode
- **State Management**: Zustand for global state, React Query for server state

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **State Management**: Zustand + React Query
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/paperbook-app.git
cd paperbook-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:ui` | Open Vitest UI |

## Project Structure

```
src/
├── components/           # Shared UI components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI primitives
├── features/            # Feature modules
│   ├── admissions/      # Admissions management
│   ├── attendance/      # Attendance tracking
│   ├── auth/            # Authentication
│   ├── behavior/        # Behavior & discipline
│   ├── communication/   # Announcements, messages
│   ├── dashboard/       # Role-based dashboards
│   ├── documents/       # Document management
│   ├── exams/           # Exam management
│   ├── finance/         # Fee management
│   ├── hostel/          # Hostel management
│   ├── inventory/       # Asset & inventory
│   ├── library/         # Library management
│   ├── lms/             # Learning management
│   ├── management/      # Schedule & docs
│   ├── operations/      # Transport, hostel, assets
│   ├── parent-portal/   # Parent view
│   ├── people/          # Students, staff, attendance
│   ├── reports/         # Reports & analytics
│   ├── settings/        # App settings
│   ├── staff/           # Staff management
│   ├── students/        # Student management
│   ├── school-website/  # Public school website builder
│   ├── timetable/       # Timetable + AI planner
│   ├── transport/       # Transport management
│   └── visitors/        # Visitor management
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── mocks/               # MSW mock handlers
├── stores/              # Zustand stores
├── styles/              # Global styles
├── test/                # Test setup and utilities
└── types/               # TypeScript types
```

## User Roles

| Role | Description |
|------|-------------|
| Admin | Full system access |
| Principal | School-wide management |
| Teacher | Class and student management |
| Accountant | Financial operations |
| Librarian | Library management |
| Transport Manager | Transport operations |
| Student | Student portal access |
| Parent | Parent portal access |

## Demo Accounts

The application includes demo accounts for testing:

| Role | Email |
|------|-------|
| Admin | admin@paperbook.in |
| Principal | principal@paperbook.in |
| Teacher | teacher@paperbook.in |
| Accountant | accounts@paperbook.in |
| Librarian | librarian@paperbook.in |
| Transport | transport@paperbook.in |
| Student | student@paperbook.in |
| Parent | parent@paperbook.in |

Password for all demo accounts: `demo123`

## Docker Deployment

### Production Build

```bash
# Build the Docker image
docker build -t paperbook-app .

# Run the container
docker run -p 3000:80 paperbook-app
```

### Using Docker Compose

```bash
# Start the production service
docker-compose up -d

# Start with development service
docker-compose --profile dev up
```

## Testing

```bash
# Run all tests
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/lib/validation.test.ts
```

### Test Coverage Targets

- Lines: 60%
- Branches: 60%
- Functions: 60%
- Statements: 60%

## Security Features

- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: Client-side request throttling
- **Session Timeout**: Automatic logout after inactivity
- **Input Sanitization**: XSS prevention utilities
- **Role-Based Access**: Granular permission system

## Environment Variables

### Frontend

Create a `.env.development` or `.env.production` file in the project root:

```env
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_MSW=true
```

### Backend

Copy the example env file and update values:

```bash
cp server/.env.example server/.env
```

Required variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret for signing access tokens | — |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | — |
| `PORT` | Server port | `3001` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

## Local AI Setup (Ollama)

PaperBook uses [Ollama](https://ollama.com) to run AI features locally — no cloud API keys needed. This powers the AI website builder, executive assistant, and timetable planner.

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows — download from https://ollama.com/download
```

### 2. Pull a model

```bash
ollama pull qwen2.5:14b
```

> You can use a smaller model if your machine has limited RAM:
> - `qwen2.5:7b` — needs ~8 GB RAM
> - `qwen2.5:14b` — needs ~16 GB RAM (recommended)
> - `llama3.1:8b` — alternative, needs ~8 GB RAM

### 3. Start Ollama

```bash
ollama serve
```

Ollama runs on `http://localhost:11434` by default.

### 4. Configure in `.env`

Add these to your `server/.env`:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
```

If you pulled a different model, update `OLLAMA_MODEL` to match.

### Using a cloud LLM instead

If you prefer to use OpenAI or Anthropic instead of a local model, set the API key:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

or

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

## Code Quality

- TypeScript strict mode enabled
- ESLint for code linting
- Vitest for testing
- Pre-commit hooks (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team or open an issue on GitHub.
