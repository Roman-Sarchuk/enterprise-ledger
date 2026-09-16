<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=32&duration=3000&pause=1000&color=10B981&center=true&vCenter=true&width=1000&lines=Enterprise-Ledger;Corporate+Finance+Portal;React+19+%2B+Node.js+%2B+Docker" />
</p>

# Enterprise-Ledger

[![Frontend CI](https://github.com/Roman-Sarchuk/enterprise-ledger/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Roman-Sarchuk/enterprise-ledger/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/Roman-Sarchuk/enterprise-ledger/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Roman-Sarchuk/enterprise-ledger/actions/workflows/backend-ci.yml)
[![codecov](https://codecov.io/github/Roman-Sarchuk/enterprise-ledger/graph/badge.svg)](https://codecov.io/github/Roman-Sarchuk/enterprise-ledger)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Enterprise-Ledger is a full-stack, containerized internal financial portal for managing corporate accounts, operational expenses, transaction history, and business analytics. The frontend is built with React, Vite, and TypeScript, served via Nginx. The backend utilizes Express and a MongoDB database with JWT-based authentication.

The system is designed to help businesses:
- track balances across multiple corporate accounts and cash registers
- route and organize operational spending with custom categories
- review comprehensive transaction history with safe CRUD flows
- visualize cash flow, liquidity, and expense breakdowns
- deploy seamlessly using Docker and Docker Compose

---


## ✨ Core Features

* **💳 Enterprise Finance Tools:** Manage enterprise balances, organize operational spending, and maintain a secure transaction ledger.
* **📊 Business Intelligence:** Visualize cash flow, asset liquidity, and expense distribution with interactive charting.
* **🔐 Enterprise-Grade Security:** Protected API routes using secure JWT authentication.
* **🐳 Dockerized Infrastructure:** Fully containerized architecture using Docker Compose, Nginx for static serving, and MongoDB for reliable data storage.
* **⚡ Modern UX Architecture:** Query-driven frontend, strict form validation, and reusable UI primitives.

---

## 🛠 Technology Stack

### 🐳 Infrastructure & DevOps
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Web%20Server-009639?logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white)

### 💻 Frontend
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-Data%20Fetching-FF4154?logo=reactquery&logoColor=white)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)

---

## 📂 Project Structure

```text
enterprise-ledger/
├─ backend/                 # Express API and business logic
│  ├─ Dockerfile            # Node.js backend container configuration
│  ├─ config/              # Database and app configuration
│  ├─ controllers/         # Route handlers
│  ├─ middleware/          # Auth and request validation
│  ├─ models/              # Mongoose schemas
│  ├─ routes/              # API endpoints
│  ├─ services/            # Core business logic
│  ├─ tests/               # Jest test suites
│  └─ package.json         # Backend dependencies and scripts
├─ frontend/                # React + Vite SPA
│  ├─ Dockerfile            # Multi-stage build with Node + Nginx
│  ├─ nginx.conf            # Nginx routing configuration
│  ├─ src/                  # React application source
│  └─ package.json          # Frontend dependencies and scripts
├─ docker-compose.yml       # Container orchestration
├─ .github/workflows/       # CI/CD pipelines
├─ README.md                # Project documentation
└─ package-lock.json        # Root lockfile if present
```

---

## 🚀 Getting Started (Docker Environment)

The easiest way to run Enterprise-Ledger is using Docker. This automatically starts the React frontend, Express backend, and MongoDB services with the proper configuration.

> Prerequisites: Docker and Docker Compose must be installed on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/Roman-Sarchuk/enterprise-ledger.git
cd enterprise-ledger
```

### 2. Configure environment variables

Create a `backend/.env` file:

```env
PORT=3000
MONGO_URI=mongodb://db:27017/enterprise_ledger?directConnection=true
JWT_SECRET=your_super_secure_jwt_secret
NODE_ENV=development
```

### 3. Launch the infrastructure

Run the following command in the project root:

```bash
docker compose up -d --build
```

### 4. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

To stop the application:

```bash
docker compose down
```

---

## 🛠 Local Development (Without Docker)

If you prefer to run the app locally for active development:

1. Ensure you have a local MongoDB instance running.
2. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Start the development servers in separate terminals:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 🌐 Connect

* **Lead Developer:** [Roman Sarchuk](https://www.linkedin.com/in/roman-sarchuk-267102323/)
