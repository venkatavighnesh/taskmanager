# TaskFlow: Premium Team Task Manager

**Live Demo:** [https://energetic-enthusiasm-production-a661.up.railway.app/](https://energetic-enthusiasm-production-a661.up.railway.app/)

TaskFlow is a high-performance, full-stack team management application designed with a premium, light-themed aesthetic. It enables teams to organize projects, track tasks with precision, and maintain security through robust Role-Based Access Control (RBAC).



## ✨ Key Features

- **🏆 Premium UI/UX**: Built with a curated light-color palette, custom typography (Outfit & Inter), and glassmorphism elements.
- **🛡️ Role-Based Access Control (RBAC)**:
  - **Admins**: Full control over projects, member invitations, and task management for everyone.
  - **Members**: Focused view-only access to team details and the ability to update their own assigned tasks.
- **📊 Real-time Dashboard**: Live statistics on task progress, active projects, and upcoming deadlines.
- **📅 Deadline Tracking**: Integrated due-date management with visual "Overdue" indicators.
- **🏗️ Project Boards**: Clean, categorized views (Todo, In Progress, Completed) for efficient workflow tracking.

## 🛠️ Technical Architecture

### Frontend
- **React (Vite)**: Lightning-fast development and optimized production builds.
- **Vanilla CSS**: Custom-built design system with a focus on modern aesthetics and performance.
- **Lucide Icons**: Consistent, beautiful iconography.
- **Framer Motion**: Smooth micro-animations and page transitions.

### Backend
- **Node.js & Express**: Scalable and fast RESTful API.
- **Prisma ORM**: Type-safe database queries and schema management.
- **PostgreSQL**: Production-grade relational database.
- **JWT & Bcryptjs**: Secure authentication and industry-standard password hashing.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20+)
- **PostgreSQL** (Local or Cloud instance)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
JWT_SECRET="your_ultra_secret_key"
PORT=5000
```
Run migrations and start:
```bash
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Deployment

TaskFlow is optimized for **Railway** deployment.

1. **Database**: Provision a PostgreSQL instance on Railway.
2. **Environment Variables**: Add `DATABASE_URL` and `JWT_SECRET` to the Railway project settings.
3. **Build**: Railway will automatically detect the `package.json` and deploy both services.


