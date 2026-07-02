# Inventory Management System

<div align="center">
  <kbd>
    <b style="color: #ea6060; font-size: 1.3em;">⚠️ WARNING: UNDER ACTIVE DEVELOPMENT</b>
  </kbd>
  <br />
  <p style="color: #f27474; font-weight: 500; max-width: 500px; margin-top: 8px;">
    This project is currently unstable and contains bugs. <b>Do not try to use this for normal or production use.</b>
  </p>
  <p style="color: #666;">
    🛠️ If you are a developer, feel free to clone or experiment!
  </p>
</div>

A full-stack inventory management web application with role-based access control, built with the MERN stack and secured using hybrid asymmetric/symmetric encryption.

---

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Frontend  | React 19, Vite 8, Tailwind CSS 4, Framer Motion |
| Backend   | Node.js, Express 5                              |
| Database  | MongoDB (Mongoose 9)                            |
| Auth      | JWT, Argon2, RSA hybrid encryption              |
| Dev Tools | Concurrently, ESLint, Pino logger               |

---

## Project Structure

```
Inventory-Management-System/
├── Backend/
│   ├── app.js
│   ├── server.js
│   ├── keys/
│   │   ├── asymmetricKey/       # RSA public/private key pair
│   │   │   ├── private.pem
│   │   │   └── public.pem
│   │   └── symmetricKey/        # AES session key
│   │       └── season_key.pem
│   └── src/
│       ├── config/              # DB connection, key manager, logger
│       ├── controllers/         # Route handlers (Auth, Accounts, Roles, etc.)
│       ├── middlewares/         # Access verification, permission checks, route blocking
│       ├── models/              # Mongoose schemas (User, Role, RefreshToken)
│       ├── routes/              # Express routers
│       └── utility/             # Encryption, hashing, token service, cookies
│
├── Frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── AccountsAndPermissions/   # User list, detail panel, create modal
│   │   │   ├── Auth/                     # Sign-in form
│   │   │   ├── Common/                   # Shared inputs, fields, tooltip
│   │   │   ├── Nav/                      # Navigation bar
│   │   │   └── RoleManagement/           # Role cards, permission toggles, create role
│   │   ├── Contexts/                     # React context (user session)
│   │   ├── Hooks/                        # useDebounce, useGetRoles, useGetTimeZone
│   │   ├── Pages/                        # Route-level page components
│   │   ├── Service/                      # Axios auth service
│   │   └── Theme/                        # Design system (palette, buttons, inputs)
│   └── public/
│
├── certs/                        # TLS certificates (localhost HTTPS)
├── Configs/
├── DOC/
└── README.md
```

---

## Prerequisites

- **Node.js** 20+
- **npm**
- **MongoDB** instance (local or Atlas)

---

## Environment Setup

> **Note:** Private keys and TLS certificates are stored in `Backend/keys/` and `certs/`. Do **not** commit these to version control.

### Frontend — `Frontend/.env`

```env
VITE_APP_NAME=Inventra
VITE_IS_HTTPS=true
VITE_BACKEND_API_HEADER=https://localhost:5000
VITE_TIMEZONE=Asia/Dhaka
```

| Variable                  | Description                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `VITE_APP_NAME`           | Application display name                                              |
| `VITE_IS_HTTPS`           | Enable HTTPS mode (`true` / `false`)                                  |
| `VITE_BACKEND_API_HEADER` | Base URL for all backend API calls                                    |
| `VITE_BG_COLOUR`          | Global background colour — hex value, **must include the `#` prefix** |
| `VITE_TIMEZONE`           | Display timezone (IANA format, e.g. `Asia/Dhaka`)                     |

### Backend — `Backend/.env`

```env
LOG_LEVEL=debug
NODE_ENV=production
IS_HTTPS=true
PORT=5000
ALLOWED_ORIGIN=https://localhost:3000,https://localhost:5000,https://192.168.1.17:3000
MONGOURL=mongodb://<user>:<password>@<mongodb server url>/<dbname>?authSource=admin
JWT_SECRET=replace_with_secret
JWT_ACCESS_SECRET=replace_with_64_byte_hex
JWT_REFRESH_SECRET=replace_with_64_byte_hex
```

| Variable             | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `LOG_LEVEL`          | Pino log level (`debug`, `info`, `warn`, `error`)    |
| `NODE_ENV`           | Runtime environment (`development` / `production`)   |
| `IS_HTTPS`           | Enables HTTPS server mode                            |
| `PORT`               | Port the Express server listens on (default: `5000`) |
| `ALLOWED_ORIGIN`     | Comma-separated list of allowed CORS origins         |
| `MONGOURL`           | MongoDB connection string with auth credentials      |
| `JWT_SECRET`         | General JWT signing secret                           |
| `JWT_ACCESS_SECRET`  | Secret for access tokens — use a 64-byte hex value   |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens — use a 64-byte hex value  |

Generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Quick Start

### 1. Install all dependencies

From the project root:

```bash
# Root dev tools
npm install

# Backend
cd Backend && npm install && cd ..

# Frontend
cd Frontend && npm install && cd ..
```

### 2. Run in development mode

```bash
# From project root — starts both Backend and Frontend concurrently
npm run dev
```

| Script           | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `npm run dev`    | Runs Backend + Frontend concurrently with colour-coded output |
| `npm run server` | Backend only (`nodemon`)                                      |
| `npm run client` | Frontend only (`vite --host`)                                 |

### 3. Backend only

```bash
cd Backend
node server.js
```

### 4. Frontend only

```bash
cd Frontend
npm run dev
```

---

## Features

- **Authentication** — JWT access/refresh token flow with HttpOnly cookies
- **Hybrid Encryption** — RSA + AES encrypted payloads for sensitive requests
- **Role Management** — Create roles with granular permission toggles
- **Accounts & Permissions** — User list with infinite scroll, debounced search, and inline editing
- **Status & Role Persistence** — Real-time status/role updates synced to MongoDB
- **HTTPS (local)** — TLS via self-signed certs in `certs/`

---

## Security Notes

- Passwords hashed with **Argon2**
- Sensitive API payloads use a **hybridEncrypt** pattern (RSA-encrypted AES key + AES-GCM data)
- Public RSA key served via `/api/public-key` endpoint
- Route-level middleware enforces permission checks per role

---

## License

ISC
