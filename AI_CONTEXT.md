# AI Context: Inventory Management System

This document gives an AI coding assistant the minimum reliable context needed to work in this repository. Read it before making changes.

## Project purpose

This is a full-stack inventory and retail operations application. It supports:

- User authentication with access and refresh tokens
- Role-based access control and granular permissions
- Products, categories, suppliers, pricing, variants, and images
- Warehouses, racks, shelves, and stock movement
- Register/POS workflows and orders
- Returns, warranties, guarantees, service claims, and debt/credit
- Live order/dashboard updates using Server-Sent Events

The project is under active development and should not be assumed production-ready.

## Repository layout

```text
Backend/
  app.js                 # Express application and API mounting
  server.js              # HTTP/HTTPS server entry point
  src/
    config/              # MongoDB, logging, image storage, key management
    controllers/         # Domain request handlers
    middlewares/         # Auth, permissions, uploads, route guards
    models/              # Mongoose schemas
    routes/              # Express routers
    utility/             # Tokens, encryption, cookies, images, stock, SSE

Frontend/
  index.html
  vite.config.js
  src/
    main.jsx             # React bootstrap
    MainRouter.jsx       # Application routes
    App.jsx              # Authenticated application shell
    Components/          # Feature and shared UI components
    Contexts/             # User/session and selected-warehouse state
    Hooks/                # Reusable React hooks
    Pages/                # Route-level screens
    ProtectedRoute/       # Authentication and warehouse guards
    Service/              # API/auth service helpers
    Theme/                # Shared colors and component styles
```

## Technology

- Node.js 20+
- JavaScript and JSX with native ES modules
- React 19
- Vite 8
- React Router 8
- Tailwind CSS 4
- Express 5
- MongoDB with Mongoose 9
- Axios
- JWT, Argon2, HttpOnly cookies
- RSA/AES hybrid encryption for selected payloads
- Pino logging
- Cloudinary or S3-compatible image storage

## Running the application

Install dependencies from the repository root, then in each application directory:

```bash
npm install
cd Backend && npm install
cd ../Frontend && npm install
```

Frontend commands:

```bash
cd Frontend
npm run dev
npm run build
npm run lint
npm run preview
```

Backend entry point:

```bash
cd Backend
node server.js
```

The root `npm run dev` is intended to run frontend and backend concurrently. Verify the root `server` script before using it: it currently references `nodemon index.js`, while the actual backend entry point is `server.js`.

## Backend API groups

The Express app mounts these base paths:

- `/api/health`
- `/api/auth`
- `/api/publickey`
- `/api/accounts-and-permissions`
- `/api/roles`
- `/api/category`
- `/api/suppliers`
- `/api/product`
- `/api/warehouses`
- `/api/racks`
- `/api/shelves`
- `/api/order`
- `/api/return-warranty-guarantee`
- `/api/debt-credit`

Authentication is normally provided by the `access_token` HttpOnly cookie. Protected handlers use `verifyAccess`, and permission-sensitive handlers use `checkPermission`.

## Frontend routes

- `/auth`
- `/`
- `/warehouse`
- `/products`
- `/role-management`
- `/accounts-and-permissions`
- `/user`
- `/register/:selection/*`

`ProtectedRouteUser` guards the authenticated application. `ProtectedRouteWarehouse` requires a selected warehouse before register workflows can be used.

## Environment configuration

Backend environment variables commonly include:

```text
PORT
IS_HTTPS
ALLOWED_ORIGIN
MONGOURL
NODE_ENV
LOG_LEVEL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_TTL
JWT_REFRESH_TTL
UPLOAD_PROVIDER
```

Image storage additionally requires either Cloudinary variables or S3/MinIO variables, depending on `UPLOAD_PROVIDER`.

Frontend environment variables commonly include:

```text
VITE_APP_NAME
VITE_IS_HTTPS
VITE_BACKEND_API_HEADER
VITE_TIMEZONE
VITE_JWT_ACCESS_TTL
```

Do not commit `.env` files, private keys, certificates, credentials, or generated secrets.

## Important implementation conventions

### Frontend

- Use functional React components and hooks.
- Prefer existing contexts, hooks, service helpers, and theme constants before adding new abstractions.
- Keep feature-specific components inside the relevant feature directory.
- Use React Context for cross-cutting state; do not introduce Redux without a clear requirement.
- Preserve nested routing and the existing protected-route structure.
- Use existing toast/modal patterns for user feedback.
- Keep API paths and request shapes consistent with the backend routes.

### Backend

- Keep routing, controllers, models, middleware, and utilities separated.
- Reuse existing authentication, permission, token, cookie, encryption, and image helpers.
- Preserve Mongoose references and soft-delete behavior.
- Protected endpoints should use `verifyAccess`; permission requirements should be explicit.
- Surface errors through the repository's existing response/logging patterns. Do not silently swallow failures.
- Avoid changing security-sensitive behavior without checking both frontend and backend consumers.

## Validation expectations

Before finishing a change:

1. Inspect related routes, controllers, models, frontend services, and consumers.
2. Run the smallest relevant existing validation command.
3. For frontend changes, prefer `npm run lint` and/or `npm run build` from `Frontend`.
4. There is currently no meaningful automated test suite; do not assume `npm test` provides coverage.
5. Do not modify unrelated pre-existing worktree changes.

## Known caveats

- The README and current source tree are not perfectly synchronized.
- The root server script points to `Backend/index.js`, which does not appear to be the active backend entry point.
- Environment files and key/certificate files are intentionally ignored.
- Some naming and formatting are inconsistent; follow local conventions in the file being changed.
- The application is explicitly described as unstable and under active development.

## Safe workflow for an AI assistant

1. Read this file and the relevant source files.
2. Search for existing implementations before adding helpers or patterns.
3. Trace the complete frontend-to-route-to-controller-to-model flow for behavior changes.
4. Make the smallest complete change that satisfies the request.
5. Validate the changed behavior with existing scripts.
6. Report changed files, validation performed, and any unresolved caveats.
