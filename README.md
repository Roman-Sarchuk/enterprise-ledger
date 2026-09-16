<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=32&duration=3000&pause=1000&color=10B981&center=true&vCenter=true&width=1000&lines=Full-stack+Finance+Tracker;React+19+%2B+Node.js+%2B+MongoDB;Smart+Analytics+%26+Tracking" />
</p>

# Home-ledger

[![Frontend CI](https://github.com/Roman-Sarchuk/Home-ledger/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Roman-Sarchuk/Home-ledger/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/Roman-Sarchuk/Home-ledger/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Roman-Sarchuk/Home-ledger/actions/workflows/backend-ci.yml)
[![codecov](https://codecov.io/github/Roman-Sarchuk/Home-ledger/graph/badge.svg?token=5EU00G9C7M)](https://codecov.io/github/Roman-Sarchuk/Home-ledger)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Home-ledger is a full-stack personal finance tracker for managing accounts, categories, transactions, and analytics in one place. The frontend is built with React, Vite, and TypeScript, while the backend uses Express and MongoDB with JWT-based authentication.

The app is designed to help you:
- track balances across multiple accounts
- organize spending and income with categories
- review transaction history with editing and deletion flows
- visualize cash flow, liquidity, and category breakdowns
- recover passwords through email-based reset links

---

## 📸 Project Preview

<details>
  <summary><b>🏠 Landing & Authentication</b></summary>
  <br/>
  
  <img width="1885" height="966" alt="home" src="https://github.com/user-attachments/assets/0388ce8b-dcac-4aee-bd7e-aa71d1f8020e" />

  | <img width="1880" height="948" alt="login" src="https://github.com/user-attachments/assets/9f6a13a0-186c-429c-a9ec-e3b426948272" /> | <img width="1880" height="948" alt="login" src="https://github.com/user-attachments/assets/6e7b181b-4fc4-49e1-a18b-e19595ac8dff" /> |
  | :-: | :-: |
  
</details>

<details>
  <summary><b>💼 Core Application Pages</b></summary>
  <br/>

  <img width="1897" height="965" alt="accounts" src="https://github.com/user-attachments/assets/88864a92-9744-4982-985c-5ca62b310701" />
  <img width="1873" height="954" alt="categories" src="https://github.com/user-attachments/assets/80862d66-364c-4858-946e-ffb2fb189f3c" />
<img width="1872" height="954" alt="transactions" src="https://github.com/user-attachments/assets/de0de087-c798-46c6-b59e-284fc389ab4e" />
<img width="1874" height="957" alt="settings" src="https://github.com/user-attachments/assets/d925fbed-d596-466e-ac9b-8914e6e44c4b" />

</details>

<details>
  <summary><b>🔒 Password recovery</b></summary>
  <br/>

| <img width="1898" height="967" alt="forgot password" src="https://github.com/user-attachments/assets/6426c82f-09df-4880-a525-451bf73e4803" /> | <img width="1902" height="967" alt="password recovery" src="https://github.com/user-attachments/assets/f8e5a2d1-c84e-451f-8190-02e89b2e440d" /> |
  | :-: | :-: |

<img width="1392" height="492" alt="email" src="https://github.com/user-attachments/assets/57aa1124-eac2-4cd1-806c-69cd065d4f04" />

</details>

<details>
  <summary><b>📈 Analytics & Insights</b></summary>
  <br/>

  <img width="1869" height="957" alt="analytics-circule" src="https://github.com/user-attachments/assets/e9571031-b07c-4a38-82d3-3c05f73cca27" />

| <img width="1888" height="958" alt="analytics-liqudity" src="https://github.com/user-attachments/assets/0f31eb62-6d40-4906-8821-ea7a100d0e92" /> | <img width="1873" height="957" alt="analytics-cash-flow" src="https://github.com/user-attachments/assets/57c6c0b8-c2ae-489e-86c9-dbdba9134ce8" /> |
  | :-: | :-: |

</details>

---

## ✨ Core Features

* **💳 Comprehensive Finance Tools:** Track balances across multiple accounts, organize spending with categories, and manage full transaction history (CRUD flows).
* **📊 Advanced Analytics:** Visualize cash flow, liquidity, and category breakdowns with interactive charts.
* **🔐 Secure Authentication:** Protected app routes with JWT authentication securely stored on the backend side.
* **📬 Robust Password Recovery:** API-backed password reset flow utilizing Resend API and Nodemailer.
* **⚡ Modern UX Architecture:** Query-driven frontend (React Query), form validation (Zod), and reusable UI primitives built with Radix/shadcn-style components.

---

## 🛠 Technology Stack

### 💻 Frontend
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-Data%20Fetching-FF4154?logo=reactquery&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Analytics-FF7300?logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9ImNoYXJ0LWZsZXhpYmxlLWRhdGUtc3RhdC1zdGF0aXN0aWNzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxNiAxNTsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDE2IDE1IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBmaWxsPSIjRUVFRUVFIiBkPSJNMTQuNSwxNFYzaC00VjBoLTV2OWgtNHY1SDB2MWgxLjVoNGgxaDNoMWg0SDE2di0xSDE0LjV6IE0yLjUsMTR2LTRoM3Y0SDIuNXogTTYuNSwxNFY5VjFoM3YydjExSDYuNXogTTEwLjUsMTRWNGgzdjEwICBIMTAuNXoiLz48L3N2Zz4=&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State-000000?logo=redux&logoColor=white)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-SMTP-0F9D50?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJtMzY5LjEgMzIxLjYtOC44LTEwLjIgNTYuNyA2Ni4yaDk1VjEzNC40eiIgc3R5bGU9Im9wYWNpdHk6LjY7ZmlsbDojZmZmIi8+PHBhdGggZD0ibTUxMiAxMzQuNC0xNTEuNyAxNzcgOC44IDEwLjJ6IiBzdHlsZT0ib3BhY2l0eTouNztmaWxsOiNmZmYiLz48cGF0aCBkPSJNMCAxMzQuNHYyNDMuMmgyMDguNXoiIHN0eWxlPSJmaWxsOiNmZmYiLz48cGF0aCBkPSJNNDE3IDM3Ny42IDIwOC41IDEzNC40djI0My4yIiBzdHlsZT0ib3BhY2l0eTouODtmaWxsOiNmZmYiLz48L3N2Zz4=&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-Email%20API-000000?logo=resend&logoColor=white)

### 🧪 Testing & CI
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?logo=githubactions&logoColor=white)

---

## 📂 Project Structure

```text
home-ledger/
├─ backend/                 # Express API, MongoDB models, services, and tests
│  ├─ config/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  ├─ scripts/
│  ├─ tests/
│  └─ utils/
├─ frontend/                # React + Vite SPA
│  ├─ src/
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ features/
│  │  ├─ pages/
│  │  ├─ shared/
│  │  └─ store/
│  └─ vite.config.ts
└─ .github/workflows/       # CI and branch protection workflows
```

---

## 🚀 Getting Started

> **Prerequisites:** Node.js 20+, npm 9+, and a MongoDB instance (or Atlas connection string).

### 1. Clone the repository

```bash
git clone https://github.com/Roman-Sarchuk/Home-ledger.git
cd Home-ledger
```

### 2. Configure the backend

Create a `backend/.env` file with at least the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
NODE_ENV=development
```

Optional email configuration for password recovery:

```env
FRONTEND_URL=http://localhost:5173

# resend configuration
RESEND_API_KEY=
RESEND_EMAIL_FROM=
RESEND_EMAIL_TO=

# nodemailer configuration
EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=  #false/true
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_FROM=
```

### 3. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Run locally (Requires two terminals)

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

> **Note:** The frontend defaults to `http://localhost:3000` for API requests unless `VITE_API_URL` is overridden in `frontend/.env`.

---

## 📜 Available Scripts

### Backend (`/backend`):

* `npm run dev` – Start development server
* `npm test` – Run Jest test suite
* `npm run test:watch` – Run tests in watch mode
* `npm run test:coverage` – Generate test coverage report
* `npm run recalc:balances` – Utility script for balance recalculation

### Frontend (`/frontend`):

* `npm run dev` – Start Vite development server
* `npm run build` – Build SPA for production
* `npm run lint` – Run ESLint
* `npm run preview` – Preview production build locally

---

## 🌐 Connect

* **Developer LinkedIn:** [![LinkedIn](https://img.shields.io/badge/Roman_Sarchuk-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/roman-sarchuk-267102323/)
