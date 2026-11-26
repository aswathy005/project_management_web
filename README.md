# ProTrack — Modern SaaS Project Management System (MERN Stack)

**ProTrack** is a full-stack, commercial-grade Project Management System built with **MongoDB, Express.js, React.js (Vite), and Node.js**. It delivers a modern SaaS workspace featuring real-time database analytics, role-based access control (RBAC), interactive drag-and-drop Kanban boards, team workload tracking, task comments, and automated notifications.

---

## Key Features

- **JWT Authentication & 3-Tier RBAC**: Secure bcrypt password hashing, protected routes, and role-enforced permissions across **Admin**, **Project Manager**, and **Team Member**.
- **Real-Time Analytics Dashboard**: 8 live KPI cards (Total/Active/Completed Projects, Total/Pending/Completed/Overdue Tasks, Overall Progress), interactive Recharts visualizations, upcoming deadlines, personal task queue, team productivity overview, and recent activity feed.
- **Full Project & Task CRUD**: Create, search, filter, edit, and delete projects & tasks with confirmation dialogs, automatic project progress calculation, and dedicated Project Details pages.
- **Interactive Kanban Board**: Drag-and-drop task cards across `To Do`, `In Progress`, `In Review`, and `Completed` columns using `@hello-pangea/dnd`, persisted automatically to MongoDB with priority and assignee filters.
- **Team & Workload Management**: Member directory with active workload progress bars, individual member profile modals, Admin onboarding, and role management.
- **Collaboration & Notifications**: Live task comment threads, chronological project/workspace activity timelines, unread notification badges, and automated 48-hour deadline/overdue alerts.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React, Recharts, React Hot Toast, `@hello-pangea/dnd` |
| **Backend** | Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `cors`, `morgan` |
| **Database** | MongoDB (`protrack_db`) with 6 collections: Users, Projects, Tasks, Comments, Notifications, Activities |

---

## Screenshots

> Add application screenshots here after running locally:
> - `[Dashboard Analytics View]`
> - `[Interactive Kanban Board]`
> - `[Project Details & Activity Timeline]`
> - `[Team Workload & Member Profiles]`

---

## Installation Instructions

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas URI)

### 2. Install Dependencies
```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3. Environment Configuration
The repository includes `backend/.env.example` and a ready-to-run `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/protrack_db
JWT_SECRET=protrack_super_secret_jwt_key_2026_change_in_prod
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Seed Demo Data
Populate MongoDB with realistic users, projects, tasks, comments, activities, and notifications:
```bash
npm run seed --prefix backend
```

---

## Running the Application

Start both servers in separate terminals:

```bash
# Terminal 1: Start Express API (http://localhost:5000)
npm run dev:backend

# Terminal 2: Start Vite React App (http://localhost:5173)
npm run dev:frontend
```

Open **`http://localhost:5173`** in your browser.

---

## Demo Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin@123` |
| **Project Manager** | `ProjectManager@gmail.com` | `ProjectManager@123` |
| **Team Member** | `TeamMember@gmail.com` | `TeamMember@123` |

---

## Documentation

For a complete, step-by-step walkthrough of every module, database schema, REST API endpoint, and workflow, see **[PROJECT_WORKFLOW.md](./PROJECT_WORKFLOW.md)**.
