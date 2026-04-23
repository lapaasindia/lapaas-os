# Lapaas OS - Build Instructions

**Status:** 🟢 DEVELOPMENT STARTED  
**Phase:** 1 - Foundation (Weeks 1-4)  
**Date:** January 15, 2024

---

## 🚀 Quick Start (5 minutes)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env.local
npm run dev
```

### Frontend Setup
```bash
cd lapaas-saas-ui-kit
npm install
npm run dev
```

---

## 📁 Project Structure

```
lapaas-os/
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── index.ts            # Main entry point
│   │   ├── config/             # Configuration files
│   │   │   ├── logger.ts       # Logging setup
│   │   │   └── database.ts     # Database connection
│   │   ├── modules/            # Feature modules
│   │   ├── services/           # Business logic
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Database models
│   │   └── utils/              # Utilities
│   ├── database/
│   │   ├── migrations/         # Database migrations
│   │   └── seeds/              # Seed data
│   ├── tests/                  # Test files
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── lapaas-saas-ui-kit/         # React UI Kit
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   ├── store/              # State management
│   │   └── styles/             # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── UI_UX_GUIDE.md
│   ├── MODULES/
│   └── ...
│
├── DEVELOPMENT_STATUS.md        # Current development status
├── GETTING_STARTED_DEVELOPMENT.md
├── WEEKLY_PROGRESS_TEMPLATE.md
└── README.md
```

---

## 🛠️ Installation Steps

### Prerequisites
- Node.js v18+
- npm or yarn
- PostgreSQL (local or Docker)
- Redis (local or Docker)
- Git

### Step 1: Clone Repository
```bash
git clone <repo-url>
cd lapaas-os
```

### Step 2: Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your local configuration:
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/lapaas_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-local-secret-key
```

#### Start Backend
```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3000
📝 API Documentation: http://localhost:3000/api/docs
🏥 Health Check: http://localhost:3000/api/health
```

### Step 3: Frontend Setup

#### Install Dependencies
```bash
cd lapaas-saas-ui-kit
npm install
```

#### Start Frontend
```bash
npm run dev
```

Expected output:
```
  VITE v4.5.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 4: Verify Setup

#### Backend Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 5.234
}
```

#### Frontend Access
Open http://localhost:5173 in your browser

---

## 📦 Available Scripts

### Backend Scripts
```bash
npm run dev              # Start development server with hot reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server
npm run test            # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run lint           # Run ESLint
npm run lint:fix       # Fix linting issues
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database with sample data
npm run db:reset       # Reset database
npm run type-check     # Check TypeScript types
```

### Frontend Scripts
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run test           # Run tests
npm run test:watch    # Run tests in watch mode
npm run lint          # Run ESLint
npm run type-check    # Check TypeScript types
```

---

## 🗄️ Database Setup

### Using Docker (Recommended)

#### Start PostgreSQL
```bash
docker run --name lapaas-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=lapaas_dev \
  -p 5432:5432 \
  -d postgres:15
```

#### Start Redis
```bash
docker run --name lapaas-redis \
  -p 6379:6379 \
  -d redis:7
```

### Manual Setup

#### PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb lapaas_dev
```

#### Redis
```bash
# macOS with Homebrew
brew install redis
brew services start redis
```

---

## 🔧 Configuration

### Backend Environment Variables

**Required:**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret

**Optional:**
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `STRIPE_API_KEY` - Stripe API key
- `SMTP_HOST` - Email SMTP host
- `AWS_REGION` - AWS region

### Frontend Environment Variables

**Required:**
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Tests
```bash
cd lapaas-saas-ui-kit

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🔄 Git Workflow

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/auth-module
```

### Make Changes
```bash
git add .
git commit -m "feat: implement auth module"
```

### Push and Create PR
```bash
git push origin feature/auth-module
# Create pull request on GitHub
```

### Code Review
1. Request review (2 approvals required)
2. Address feedback
3. Merge to develop
4. Deploy to staging

---

## 📊 Development Status

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Project Setup & Infrastructure** 🟡 IN PROGRESS
- [x] Create backend project structure
- [x] Create frontend project structure
- [x] Setup TypeScript configuration
- [x] Setup environment variables
- [x] Create database configuration
- [ ] Setup CI/CD pipeline
- [ ] Configure Docker
- [ ] Setup monitoring & logging

**Week 2: Authentication Module** 🟡 READY TO START
- [ ] Email/password authentication
- [ ] JWT token management
- [ ] Password hashing (bcrypt)
- [ ] User registration flow
- [ ] Login flow
- [ ] Password reset
- [ ] Email verification

**Week 3: User Management Module** ⏳ PENDING
- [ ] User profile management
- [ ] Organization creation
- [ ] Team management
- [ ] Role-based access control
- [ ] Permission system
- [ ] User invitation system
- [ ] Activity logging

**Week 4: Core UI Framework** ⏳ PENDING
- [ ] Setup React project with Vite
- [ ] Implement design system components
- [ ] Create layout components
- [ ] Build navigation system
- [ ] Create dashboard layout
- [ ] Implement responsive design
- [ ] Setup state management

---

## 🚨 Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Database connection error**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/lapaas_dev
```

**Module not found errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Port already in use**
```bash
# Kill process using port 5173
lsof -i :5173
kill -9 <PID>
```

**Module not found errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Vite build errors**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## 📝 Next Steps

### Immediate (Today)
1. [x] Create backend project structure
2. [x] Create frontend project structure
3. [ ] Install dependencies
4. [ ] Setup database
5. [ ] Start development servers
6. [ ] Verify setup

### This Week
1. [ ] Setup CI/CD pipeline
2. [ ] Configure Docker
3. [ ] Setup monitoring & logging
4. [ ] Create first feature branch
5. [ ] Begin authentication module

### Next Week
1. [ ] Complete authentication module
2. [ ] Create login/register pages
3. [ ] Write unit tests
4. [ ] Code review & merge
5. [ ] Deploy to staging

---

## 📚 Documentation

- [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) - Current status
- [GETTING_STARTED_DEVELOPMENT.md](./GETTING_STARTED_DEVELOPMENT.md) - Getting started guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design
- [UI_UX_GUIDE.md](./UI_UX_GUIDE.md) - Design system
- [MODULES/INDEX.md](./MODULES/INDEX.md) - Module documentation

---

## 🆘 Getting Help

- Check documentation in `/docs` folder
- Check relevant module documentation
- Ask in team Slack channel
- Schedule 1-on-1 with team lead
- Create GitHub issue for bugs

---

## ✅ Checklist

Before starting development:
- [ ] Node.js v18+ installed
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Database health check passed
- [ ] Ready to code!

---

**Status:** 🟢 READY TO BUILD  
**Next Update:** Daily during standup  
**Questions?** Check documentation or ask team lead

**Let's build Lapaas OS! 🚀**
