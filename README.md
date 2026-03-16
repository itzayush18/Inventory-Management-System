# StockFlux - Enterprise Inventory Management System

**StockFlux** is a professional, high-performance Inventory Management System designed with a focus on speed, security, and a premium user experience. Built using the modern Bun runtime, it features a decoupled Service-Oriented architecture and a state-of-the-art Glassmorphism UI.

## 🚀 Key Features

- **Service-Oriented Backend**: Clean separation of concerns with dedicated service layers for Auth, Inventory, and Transactions.
- **Stateless Authentication**: Secure JWT-based auth with bcrypt-hashed passwords.
- **Premium Glassmorphism UI**: High-tech dark theme with smooth animations powered by Framer Motion.
- **Immutable Stock Ledger**: Full audit trail of every stock movement (IN/OUT) with reason tracking.
- **Real-time Telemetry**: Dashboard with aggregated stats for inventory value, product counts, and low-stock alerts.
- **Enterprise-Grade database**: Raw SQL performance with transactional safety.

## 🛠️ Technology Stack

- **Runtime**: [Bun](https://bun.sh/) (Backend)
- **Backend Framework**: [Hono](https://hono.dev/)
- **Frontend Framework**: [Next.js 15+](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: MySQL (with `mysql2` pool)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### Prerequisites

- [MySQL Server](https://dev.mysql.com/downloads/installer/) installed and running.
- [Bun](https://bun.sh/) installed (highly recommended for the backend).

### 1. Database Configuration

Create a database named `inventory_db` (or your preferred name) and configure the environment variables.

### 2. Environment Setup

#### Backend (`/backend/.env`)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventory_db
JWT_SECRET=your_jwt_secret
PORT=3001
```

#### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📦 Installation & Execution

### 1. Initial Setup
From the root directory, install all dependencies and set up the project:
```bash
# Install everything (Root, Backend, and Frontend)
bun run install:all
```

### 2. Database Preparation
Prepare your MySQL database with these shortcuts:
```bash
# Initialize tables
bun run db:init

# Seed initial data (Admins, Categories, etc.)
bun run db:seed
```

### 3. Launching the System

#### **🚀 High-Speed Launch (Recommended)**
Start both the Backend and Frontend with a single command from the root:
```bash
bun dev
```
*This uses `concurrently` to run both services. Backend starts on port **3001**, Frontend on **3000**.*

---

## 🔐 Default Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` |
| **Shopkeeper** | `shopkeeper` | `keeper123` |

---

## 🏗️ Project Architecture

```text
/backend
  /src
    /db         # Pool config and SQL scripts
    /services   # Business logic (SQL execution)
    /routes     # API endpoints
    /middleware # Auth & Error handlers
/frontend
  /src
    /app        # Next.js App Router (Pages)
    /components # Shared UI Components
    /lib        # Utils & API Config
```

## 📜 License
Personal Project - All Rights Reserved.
