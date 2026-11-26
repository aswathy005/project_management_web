# ProTrack — Complete Project Workflow & Technical Documentation

---

## 1. Project Introduction

**ProTrack** is a full-stack, commercial-grade SaaS Project Management System built using the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js). Designed for engineering, product, and cross-functional delivery teams, ProTrack centralizes project planning, task execution, interactive Kanban workflows, real-time workload monitoring, activity auditing, and automated notifications inside a clean, responsive web application.

Unlike static prototypes, every dashboard metric, chart dataset, project progress percentage, Kanban transition, comment thread, and notification is backed by persistent MongoDB collections and a secure REST API.

---

## 2. Project Objectives

- **Centralized Project Visibility**: Give leadership and managers instant insight into active projects, completion percentages, overdue tasks, and team throughput.
- **Structured Role-Based Access Control (RBAC)**: Enforce clear operational boundaries across **Admin**, **Project Manager**, and **Team Member** roles on both backend endpoints and frontend views.
- **Interactive Execution**: Provide an intuitive drag-and-drop Kanban board (`@hello-pangea/dnd`) synchronized in real time with MongoDB and automatic project progress recalculation.
- **Accountability & Collaboration**: Connect tasks with assignees, comments, activity timelines, and automated notifications (assignment, status changes, comments, and deadline alerts).
- **Clean, Scalable Engineering**: Maintain strict separation of concerns using MVC on the backend and modular services/contexts/components on the frontend.

---

## 3. Technology Stack

### Frontend
- **React 18** with **Vite** (fast HMR & optimized production bundle)
- **Tailwind CSS** (utility-first SaaS design system with custom animations)
- **React Router DOM v6** (protected & role-gated routing)
- **Axios** (centralized HTTP client with JWT request/response interceptors)
- **Lucide React** (crisp vector iconography)
- **Recharts** (BarChart & Donut/PieChart analytics)
- **React Hot Toast** (non-blocking success/error feedback)
- **@hello-pangea/dnd** (React 18 compatible `react-beautiful-dnd` drag-and-drop)

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose ODM**
- **JSON Web Tokens (`jsonwebtoken`)** for stateless authentication
- **bcryptjs** for password hashing and comparison
- **express-validator** for request payload validation
- **morgan** & **cors** for request logging and cross-origin configuration

---

## 4. System Architecture

```
+-----------------------------------------------------------------------+
|                           CLIENT (React + Vite)                       |
|  Pages -> Components -> AuthContext / UIContext -> Axios Services     |
+-----------------------------------+-----------------------------------+
                                    | HTTPS / JSON + Bearer JWT
                                    v
+-----------------------------------------------------------------------+
|                       EXPRESS.JS REST API SERVER                      |
|  Routes -> express-validator -> Auth/Role Middleware -> Controllers   |
|                              -> Utility Services (Progress, Logger)   |
+-----------------------------------+-----------------------------------+
                                    | Mongoose ODM
                                    v
+-----------------------------------------------------------------------+
|                         MONGODB (protrack_db)                         |
|  Collections: users | projects | tasks | comments | notifications |   |
|               activities                                              |
+-----------------------------------------------------------------------+
```

1. The React SPA communicates with `/api/*` via Axios (proxied to `http://localhost:5000` in development).
2. Axios attaches `Authorization: Bearer <token>` from `localStorage` on every request.
3. Express routes validate request bodies via `express-validator` and verify tokens via `protect` middleware before enforcing role checks via `authorize(...)`.
4. Controllers execute business logic, mutate MongoDB via Mongoose models, recalculate project progress when tasks change, record `Activity` entries, and emit `Notification` documents.

---

## 5. Application Modules

1. **Authentication & Profile Module**: Registration, sign-in, JWT session verification, profile updates, avatar customization, notification preferences, and password rotation.
2. **Analytics Dashboard Module**: Aggregates live counts, project completion charts, task status distributions, upcoming deadlines, personal tasks, and team productivity bars.
3. **Project Management Module**: Project creation, editing, deletion (cascading tasks/comments/activities), manager assignment, team roster management, and dedicated Project Details workspace.
4. **Task Management Module**: Full task lifecycle CRUD, priority/status tagging, filtering, personal "My Tasks" queue, and task detail modal with discussion comments.
5. **Interactive Kanban Module**: Multi-column board (`To Do`, `In Progress`, `In Review`, `Completed`) with drag-and-drop status persistence and priority/assignee/project filters.
6. **Team & Workload Module**: Directory of workspace members with active task load percentages, member profile inspection, member onboarding, and Admin role management.
7. **Notifications & Activity Timeline Module**: Real-time unread notification counters, read/unread management, automated deadline alerts, and workspace-wide chronological activity audit logs.

---

## 6. User Roles and Permissions

| Capability | Admin | Project Manager | Team Member |
| :--- | :---: | :---: | :---: |
| View Dashboard & Analytics | All Workspace | All Workspace | Scoped to Assigned Projects |
| View Projects | All | All | Assigned Projects Only |
| Create Project | Yes | Yes | No (`403 Forbidden`) |
| Edit / Delete Project | Any Project | Managed / Created Projects | No (`403 Forbidden`) |
| Create Tasks | Any Project | Any Project | Assigned Projects Only |
| Drag & Drop / Update Task Status | Yes | Yes | Yes (Assigned / Project Tasks) |
| Delete Tasks | Any Task | Any Task | Tasks Created by Self |
| Post Comments | Yes | Yes | Yes |
| View Team Members & Profiles | Yes | Yes | Yes |
| Add Team Member / Change Roles / Remove Member | Yes | No (`403 Forbidden`) | No (`403 Forbidden`) |

---

## 7. Authentication Workflow

1. **Registration (`POST /api/auth/register`)**:
   - User submits `name`, `email`, `password`, `role`, `jobTitle`, and `department`.
   - `express-validator` validates email format and password length (`>= 6`).
   - `User` model pre-save hook hashes the password using `bcryptjs` (salt rounds: 10).
   - Server logs a `user_registered` activity, generates a signed JWT (`JWT_EXPIRES_IN=7d`), and returns `{ token, user }`.
2. **Login (`POST /api/auth/login`)**:
   - Server fetches user with `.select('+password')`, verifies `isActive`, and compares passwords using `user.comparePassword(password)`.
   - Returns `{ token, user }`.
   - Frontend `AuthContext` persists `protrack_token` and `protrack_user` to `localStorage` and navigates to `/dashboard`.
3. **Session Hydration & Route Protection**:
   - On page reload, `AuthContext` calls `GET /api/auth/me` with the stored token.
   - If the token is invalid or expired (`401`), the Axios response interceptor clears `localStorage` and redirects to `/login`.
   - `ProtectedRoute` restricts unauthenticated users from private routes and checks `allowedRoles` for role-gated pages like `/projects/new`.

---

## 8. Dashboard Workflow

1. When the user visits `/dashboard`, `DashboardPage` invokes `GET /api/dashboard`.
2. Backend `dashboardController.getDashboardStats`:
   - Runs `syncDeadlineNotificationsForUser(req.user._id)` to generate daily deadline/overdue alerts for tasks due within 48 hours.
   - Scopes queries (`Team Member` sees projects they manage or belong to; `Admin` and `Project Manager` see full workspace telemetry).
   - Computes the 8 KPI cards directly from MongoDB documents:
     - `totalProjects`, `activeProjects`, `completedProjects`, `overallProgress`
     - `totalTasks`, `pendingTasks`, `completedTasks`, `overdueTasks`
   - Builds chart payloads (`projectProgress` for Recharts `BarChart` and `taskStatus` for Recharts `PieChart`).
   - Returns `recentActivities`, `upcomingDeadlines`, `myAssignedTasks`, and `teamProductivity`.
3. Frontend renders animated `StatCard` tiles, interactive Recharts tooltips, progress bars, and quick navigation links.

---

## 9. Project Creation Workflow

1. An **Admin** or **Project Manager** clicks **Create Project** (navigating to `/projects/new`).
2. `ProjectForm` validates that `name >= 3` chars, `description` is present, and `deadline >= startDate`.
3. Submitting sends `POST /api/projects`.
4. Backend `authorize('Admin', 'Project Manager')` verifies permission, ensures the `projectManager` is automatically included in `teamMembers`, and creates the `Project` document.
5. Backend writes a `project_created` `Activity` record and sends `project_assigned` notifications to all selected team members (excluding the actor).
6. Frontend redirects to `/projects/:id` (`ProjectDetailsPage`), displaying the project overview, task list, team roster, and activity timeline.

---

## 10. Task Creation and Assignment Workflow

1. Users can create tasks from `/tasks`, `/projects/:id`, or directly from any column on `/kanban`.
2. `TaskFormModal` collects `title`, `description`, `project`, `assignedTo`, `status`, `priority`, and `dueDate`.
3. `POST /api/tasks` verifies the parent project exists (and membership if the caller is a `Team Member`), creates the `Task`, and triggers `recalculateProjectProgress(projectId)`.
4. `recalculateProjectProgress` counts total vs. `Completed` tasks in the project, updates `project.progress` (`0–100%`), and automatically transitions project status to `Completed` when progress hits `100%` (or back to `In Progress` if tasks are reopened).
5. Backend logs a `task_created` activity and creates a `task_assigned` notification for the assignee.

---

## 11. Kanban Board Workflow

1. Navigating to `/kanban` fetches all accessible tasks, projects, and team members.
2. Tasks are grouped into 4 workflow columns: **To Do**, **In Progress**, **In Review**, and **Completed**.
3. Users can filter cards simultaneously by **Project**, **Priority**, and **Assignee**.
4. When a user drags a card between columns:
   - `onDragEnd` executes an **optimistic UI update** so the card snaps cleanly without lag.
   - `PATCH /api/tasks/:id/status` updates `task.status` and `task.order` in MongoDB, sets/clears `completedAt`, recalculates parent project progress, logs a `task_status_changed` activity, and notifies the task creator, assignee, and project manager.
   - If the API call fails, the UI reverts to the previous state and shows an error toast.
5. Clicking any Kanban card opens `TaskDetailModal` for inline status edits and comment collaboration.

---

## 12. Team Management Workflow

1. Navigating to `/team` calls `GET /api/users`.
2. The backend enriches every user with real-time task statistics:
   - `totalTasks`, `completedTasks`, `pendingTasks`, `overdueTasks`, `projectCount`, and `workloadPercent` (`Math.min(100, Math.round((pendingTasks / 8) * 100))`).
3. Clicking **View Profile** calls `GET /api/users/:id` and opens `MemberProfileModal` showing the member's bio, stats, and assigned tasks.
4. **Admin-only controls**:
   - **Add Member (`POST /api/users`)**: Creates a new team account with chosen role and initial password.
   - **Role Switcher (`PATCH /api/users/:id/role`)**: Updates a member's role (`Admin`, `Project Manager`, `Team Member`), logs the change, and notifies the affected user.
   - **Remove Member (`DELETE /api/users/:id`)**: Unassigns their tasks, removes them from project rosters, and deletes the user record after confirmation.

---

## 13. Comments and Notifications Workflow

### Task Comments
- Opening any task opens `TaskDetailModal`, which fetches task details and chronological comments (`GET /api/tasks/:id`).
- Posting a comment (`POST /api/comments/task/:taskId`) saves the `Comment`, logs a `comment_added` activity, and sends `comment_added` notifications to both the task assignee and task creator (excluding the commenter).
- Authors and Admins can delete comments (`DELETE /api/comments/:id`).

### Notifications & Automated Deadlines
- `UIContext` polls/fetches `GET /api/notifications` to keep the Topbar bell badge and Sidebar unread count synchronized.
- Every fetch runs `syncDeadlineNotificationsForUser`, which checks incomplete tasks due within 48 hours or already overdue and creates a deduplicated daily `deadline` notification.
- Users can mark individual notifications read (`PATCH /api/notifications/:id/read`), mark all read (`PATCH /api/notifications/read-all`), delete notifications, or switch to the **Activity Timeline** tab on `/notifications`.

---

## 14. Database Schema and Relationships

### Collections & References

1. **Users (`users`)**
   - `_id`, `name`, `email` (unique), `password` (bcrypt hash, `select: false`), `role` (`Admin` | `Project Manager` | `Team Member`), `jobTitle`, `department`, `phone`, `bio`, `avatarColor`, `preferences`, `isActive`, `timestamps`.
2. **Projects (`projects`)**
   - `_id`, `name`, `description`, `startDate`, `deadline`, `status` (`Planning` | `In Progress` | `On Hold` | `Completed`), `priority` (`Low` | `Medium` | `High` | `Urgent`), `progress` (`0–100`), `tags`.
   - `projectManager` -> `ObjectId (ref: User)`
   - `teamMembers` -> `[ObjectId (ref: User)]`
   - `createdBy` -> `ObjectId (ref: User)`
3. **Tasks (`tasks`)**
   - `_id`, `title`, `description`, `priority`, `status` (`To Do` | `In Progress` | `In Review` | `Completed`), `dueDate`, `order`, `completedAt`, `timestamps`.
   - `project` -> `ObjectId (ref: Project)`
   - `assignedTo` -> `ObjectId (ref: User)`
   - `createdBy` -> `ObjectId (ref: User)`
4. **Comments (`comments`)**
   - `_id`, `content`, `timestamps`.
   - `task` -> `ObjectId (ref: Task)`
   - `project` -> `ObjectId (ref: Project)`
   - `author` -> `ObjectId (ref: User)`
5. **Notifications (`notifications`)**
   - `_id`, `type`, `title`, `message`, `link`, `isRead`, `timestamps`.
   - `recipient` -> `ObjectId (ref: User)`
   - `sender` -> `ObjectId (ref: User)`
   - `relatedProject` -> `ObjectId (ref: Project)`
   - `relatedTask` -> `ObjectId (ref: Task)`
6. **Activities (`activities`)**
   - `_id`, `action`, `entityType`, `entityId`, `description`, `timestamps`.
   - `actor` -> `ObjectId (ref: User)`
   - `project` -> `ObjectId (ref: Project)`
   - `task` -> `ObjectId (ref: Task)`

---

## 15. REST API Documentation

All endpoints are prefixed with `/api`. Private routes require header `Authorization: Bearer <JWT>`.

### Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Register a new account and return JWT |
| POST | `/api/auth/login` | Public | Authenticate credentials and return JWT |
| GET | `/api/auth/me` | Private | Fetch current user profile |
| PUT | `/api/auth/profile` | Private | Update profile details & UI preferences |
| PUT | `/api/auth/password` | Private | Change current user's password |

### Dashboard
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/dashboard` | Private | Return 8 KPIs, chart data, deadlines, activities, team productivity |

### Projects
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/projects` | Private | List projects (query: `search`, `status`, `priority`) |
| GET | `/api/projects/:id` | Private | Get project details, tasks, and activity log |
| POST | `/api/projects` | Admin, PM | Create a new project |
| PUT | `/api/projects/:id` | Admin, PM (owner) | Update project details and team members |
| DELETE | `/api/projects/:id` | Admin, PM (owner) | Delete project and cascade tasks/comments/activities |

### Tasks & Comments
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/tasks` | Private | List tasks (query: `project`, `status`, `priority`, `assignedTo`, `search`) |
| GET | `/api/tasks/my-tasks` | Private | List tasks assigned to the logged-in user |
| GET | `/api/tasks/:id` | Private | Get task details and comments |
| POST | `/api/tasks` | Private | Create task and recalculate project progress |
| PUT | `/api/tasks/:id` | Private | Update task fields and notify on reassignment/status |
| PATCH | `/api/tasks/:id/status` | Private | Kanban drag-and-drop status & order update |
| DELETE | `/api/tasks/:id` | Admin, PM, Creator | Delete task and recalculate project progress |
| GET | `/api/comments/task/:taskId` | Private | List comments for a task |
| POST | `/api/comments/task/:taskId` | Private | Add comment to task |
| DELETE | `/api/comments/:id` | Author, Admin | Delete a comment |

### Team, Notifications & Activities
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/users` | Private | List team members with workload statistics |
| GET | `/api/users/:id` | Private | Get member profile, tasks, and projects |
| POST | `/api/users` | Admin | Create/add a new team member |
| PATCH | `/api/users/:id/role` | Admin | Update member role, title, or active status |
| DELETE | `/api/users/:id` | Admin | Remove team member |
| GET | `/api/notifications` | Private | Get user notifications + unread count |
| PATCH | `/api/notifications/read-all` | Private | Mark all notifications as read |
| PATCH | `/api/notifications/:id/read` | Private | Mark single notification as read |
| DELETE | `/api/notifications/:id` | Private | Delete a notification |
| GET | `/api/activities` | Private | Get recent activity timeline |

---

## 16. Frontend and Backend Architecture

```
project_management/
├── package.json
├── README.md
├── PROJECT_WORKFLOW.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/         (db.js, env.js)
│       ├── controllers/    (auth, user, project, task, comment, notification, activity, dashboard)
│       ├── middleware/     (authMiddleware, errorMiddleware, validateMiddleware)
│       ├── models/         (User, Project, Task, Comment, Notification, Activity)
│       ├── routes/         (8 REST route modules)
│       ├── seed/           (seedData.js)
│       └── utils/          (ApiError, asyncHandler, tokenUtils, activityLogger, progressUtils)
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/     (common, layout, dashboard, projects, tasks, team)
        ├── context/        (AuthContext, UIContext)
        ├── hooks/          (useDebounce)
        ├── pages/          (All 14 application pages)
        ├── services/       (Axios API wrappers)
        └── utils/          (formatters, permissions)
```

---

## 17. Installation Instructions

### Prerequisites
- **Node.js** v18+ (tested on v22.16.0)
- **npm** v9+
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

### Steps
```bash
# 1. Install backend dependencies
npm install --prefix backend

# 2. Install frontend dependencies
npm install --prefix frontend

# 3. Seed realistic demo data into MongoDB
npm run seed --prefix backend
```

---

## 18. Environment Variables

Configure `backend/.env` (a template is provided at `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/protrack_db
JWT_SECRET=protrack_super_secret_jwt_key_2026_change_in_prod
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Optional frontend variable (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```
*(In development, Vite proxies `/api` to `http://localhost:5000` automatically via `vite.config.js`.)*

---

## 19. How to Run the Application

Open two terminals in the project root:

**Terminal 1 — Start Backend API:**
```bash
npm run dev:backend
```
Server runs on `http://localhost:5000` (health check: `http://localhost:5000/api/health`).

**Terminal 2 — Start Frontend Client:**
```bash
npm run dev:frontend
```
Application runs on `http://localhost:5173`.

---

## 20. Testing Instructions

1. **Authentication & Session Persistence**:
   - Open `http://localhost:5173/login`, use the **Quick Demo Login** buttons or register a new user at `/register`.
   - Refresh the browser to verify JWT persistence via `/api/auth/me`.
2. **Role-Based Access Control (RBAC)**:
   - Sign in as **Admin** (`admin@protrack.io`): verify access to **Create Project**, project edit/delete, **Add Member**, and role dropdowns on `/team`.
   - Sign in as **Project Manager** (`manager@protrack.io`): verify project creation/editing works, while Admin-only member creation/role editing controls are hidden and rejected (`403`) on the API.
   - Sign in as **Team Member** (`member@protrack.io`): verify `/projects/new` redirects to `/dashboard`, project edit/delete actions are restricted, and task status updates + comments work seamlessly.
3. **Project & Task CRUD**:
   - Create a project on `/projects/new`, inspect `/projects/:id`, add a task, edit it, and confirm the project's progress percentage recalculates automatically.
   - Test confirmation dialogs before deleting a task or project.
4. **Kanban Drag & Drop**:
   - Open `/kanban`, filter by Priority or Assignee, drag a card from `To Do` to `Completed`, reload the page, and verify the column change persisted in MongoDB.
5. **Collaboration & Dashboard Sync**:
   - Open a task modal, post a comment, then check `/notifications` and `/dashboard` to verify live notification counts, recent activities, and updated chart counts.

---

## 21. Demo Login Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Admin User | `admin@gmail.com` | `admin@123` |
| **Project Manager** | Project Manager | `ProjectManager@gmail.com` | `ProjectManager@123` |
| **Team Member** | Team Member | `TeamMember@gmail.com` | `TeamMember@123` |

---

## 22. Future Enhancements

- **Real-Time WebSockets (Socket.io)**: Instant live Kanban board updates and toast notifications across connected team browsers without page refreshes.
- **File Attachments & S3 Storage**: Attach design specs, screenshots, and PR artifacts directly to tasks and comments.
- **Sprint & Time Tracking**: Dedicated sprint velocity burndown charts and billable hour logging per task.
- **Calendar & Gantt Timeline View**: Interactive timeline visualization for project dependencies and milestone scheduling.
- **Email & Slack Integrations**: Outbound webhook digests for overdue tasks and daily standup summaries.
