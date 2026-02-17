# GraySimWeb

GraySimWeb is a full-stack educational simulator for Operating Systems topics.
It provides interactive practice for:
- CPU Scheduling
- Page Replacement

The project is a TypeScript monorepo with a React frontend and an Express backend.

## What Is In This Repo
- `src/frontend`: React + TypeScript web app
- `src/backend`: Express + TypeScript API server
- `src/backend/scala-app`: legacy/reference Scala simulation projects (not required by the web app runtime)

## Architecture
- Frontend calls backend REST endpoints via Axios.
- Backend handles auth, problem generation, scoring, and feedback.
- Simulation sessions are tied to authenticated users via JWT.
- MongoDB stores users and verification records.

## Tech Stack
- Frontend: React 19, TypeScript, React Router, Framer Motion, Bootstrap
- Backend: Node.js, Express, TypeScript, Mongoose, JWT, bcrypt, Nodemailer
- Database: MongoDB

## Security Model
- JWT secret is required at boot (`JWT_SECRET`).
- Simulation endpoints require Bearer auth.
- Email verification codes are hashed before storage.
- Pending verification records expire automatically (TTL index).
- Verification code is emailed via SMTP and is not returned in API responses.

## Environment Variables
Backend requires the following environment variables:

- `JWT_SECRET` (required)
- `MONGO_URI` (optional, defaults to `mongodb://localhost:27017/cadets`)
- `EMAIL_FROM` (required)
- `SMTP_HOST` (required)
- `SMTP_PORT` (required)
- `SMTP_USER` (required)
- `SMTP_PASS` (required)

Example file: `src/backend/.env.example`

## Local Setup
### 1) Backend
```bash
cd src/backend
npm install
JWT_SECRET=change-me \
MONGO_URI=mongodb://localhost:27017/cadets \
EMAIL_FROM=you@example.com \
SMTP_HOST=smtp.example.com \
SMTP_PORT=587 \
SMTP_USER=your-user \
SMTP_PASS=your-pass \
npm run dev
```

Backend scripts (`src/backend/package.json`):
- `npm run dev`: run TS server with `tsx`
- `npm run build`: compile TS to `dist/`
- `npm run start`: run compiled server

### 2) Frontend
```bash
cd src/frontend
npm install
npm start
```

Frontend scripts (`src/frontend/package.json`):
- `npm start`: dev server
- `npm run build`: production build
- `npm test`: test runner

## Default Ports
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## API Overview
### Public Auth/Utility Endpoints
- `POST /send-verify`
- `POST /verify-code`
- `POST /register`
- `POST /login`
- `POST /test`

### Protected CPU Scheduling Endpoints
(Require `Authorization: Bearer <token>`)
- `POST /cpu_scheduling/get_problem`
- `POST /cpu_scheduling/reset`
- `POST /cpu_scheduling/get_policy`
- `POST /cpu_scheduling/get_solution`
- `POST /cpu_scheduling/get_feedback`

### Protected Page Replacement Endpoints
(Require `Authorization: Bearer <token>`)
- `POST /page_replacement/get_problem`
- `POST /page_replacement/reset`
- `POST /page_replacement/get_policy`
- `POST /page_replacement/get_solution`
- `POST /page_replacement/get_feedback`

## API Examples
All protected examples assume:
- Header: `Authorization: Bearer <jwt>`
- Header: `Content-Type: application/json`

### CPU Scheduling
Get current problem:
```http
POST /cpu_scheduling/get_problem
```
```json
{
  "problem": {
    "id": "cpu-...",
    "processes": [{ "id": "A", "arrival": 0, "burst": 4 }],
    "quantum": 2,
    "createdAt": 1739800000000,
    "horizon": 10
  }
}
```

Get policy description:
```http
POST /cpu_scheduling/get_policy
```
```json
{ "policyName": "RR" }
```
```json
{ "msg": "Round Robin: rotate through ready processes using a fixed time quantum.", "policy": "RR" }
```

Get solution:
```http
POST /cpu_scheduling/get_solution
```
```json
{ "policyName": "FIFO" }
```
```json
{
  "msg": "Solution generated.",
  "policy": "FIFO",
  "solution": {
    "timeline": ["A", "A", "B", "-"],
    "matrix": [["A", "A", "-", "-"], ["-", "-", "B", "-"]],
    "description": "First In, First Out: when the running process finishes, choose the ready process that arrived first."
  }
}
```

Get feedback:
```http
POST /cpu_scheduling/get_feedback
```
```json
{
  "policyName": "SJF",
  "studentAnswer": [["A", "A", "-", "-"], ["-", "-", "B", "-"]]
}
```
```json
{
  "msg": "First mismatch at process B, time 1. Re-check ready-queue decisions around that point.",
  "isCorrect": false,
  "score": 75
}
```

Reset problem:
```http
POST /cpu_scheduling/reset
```
```json
{ "msg": "CPU scheduling problem reset.", "problem": { "id": "cpu-..." } }
```

### Page Replacement
Get current problem:
```http
POST /page_replacement/get_problem
```
```json
{
  "problem": {
    "id": "page-...",
    "referenceString": [1, 2, 3, 2, 4],
    "frameCount": 3,
    "createdAt": 1739800000000
  }
}
```

Get policy description:
```http
POST /page_replacement/get_policy
```
```json
{ "policyName": "LRU" }
```
```json
{ "msg": "Replace the page that has not been used for the longest time.", "policy": "LRU" }
```

Get solution:
```http
POST /page_replacement/get_solution
```
```json
{ "policyName": "OPT" }
```
```json
{
  "msg": "Solution generated.",
  "policy": "OPT",
  "solution": {
    "memory": [["1", "1", "1"], ["-", "2", "2"], ["-", "-", "3"]],
    "description": "Replace the page whose next use is farthest in the future."
  }
}
```

Get feedback:
```http
POST /page_replacement/get_feedback
```
```json
{
  "policyName": "CLOCK",
  "studentAnswer": [["1", "1", "1"], ["-", "2", "2"], ["-", "-", "3"]]
}
```
```json
{
  "msg": "First mismatch at request index 3, frame 1. Re-check replacement decision there.",
  "isCorrect": false,
  "score": 82
}
```

Reset problem:
```http
POST /page_replacement/reset
```
```json
{ "msg": "Page replacement problem reset.", "problem": { "id": "page-..." } }
```

## Frontend Pages
- `/`: landing page
- `/login`: login form
- `/register`: registration form
- `/verify`: email code verification
- `/dashboard`: simulation dashboard
- `/cpu-scheduling`: interactive CPU scheduling simulator
- `/page-replacement`: interactive page replacement simulator

## Repository Notes
- The web app runtime uses TypeScript sources in `src/frontend/src` and `src/backend/src`.
- Scala projects under `src/backend/scala-app` are legacy/reference implementations and tests.
- The deleted screenshot file in git history is intentionally not part of runtime.

## Suggested Development Workflow
1. Start MongoDB.
2. Start backend with required env vars.
3. Start frontend.
4. Register a user with a `@westpoint.edu` email.
5. Verify via emailed code.
6. Use dashboard links to run simulations.

## Troubleshooting
- `Missing required environment variable`: ensure backend env vars are set.
- `401 Missing bearer token` on simulation routes: log in and keep token in local storage.
- Email verification issues: validate SMTP credentials and outbound SMTP access.
- Mongo connection errors: confirm `MONGO_URI` and local MongoDB availability.
