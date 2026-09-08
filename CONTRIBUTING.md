# Contributing

Thank you for contributing to the Inventory Management System.

## Development setup

1. Install Node.js 20 or newer, npm, and MongoDB.
2. Install dependencies:

   ```bash
   npm install
   npm install --prefix Backend
   npm install --prefix Frontend
   ```

3. Configure `Backend/.env` and `Frontend/.env` using the examples in [README.md](./README.md).
4. Create a local administrator account before testing protected features:

   ```bash
   cd Backend
   node tempAdmin.js admin@example.com "local-development-password"
   ```

5. Run the application:

   ```bash
   npm run dev
   ```

## Making changes

- Keep frontend changes inside `Frontend/src` and backend changes inside `Backend/src`.
- Preserve existing authentication, permission checks, soft-delete behavior, and transaction boundaries.
- Reuse existing components, themes, utilities, and API helpers before creating new ones.
- Do not commit secrets, certificates, generated `dist` files, or `node_modules`.
- Keep user-facing text clear and responsive on mobile and desktop.

## Validation

Run the smallest relevant checks before opening a pull request:

```bash
cd Frontend && npm run build
git diff --check
```

For backend changes, also run syntax checks on changed files:

```bash
node --check Backend/path/to/changed-file.js
```

If a change depends on MongoDB, document the required local test data and verify both success and error paths.

## Pull requests

Pull requests should include:

- A concise description of the user-facing change.
- The affected frontend/backend areas.
- Validation commands and their results.
- Screenshots or a short recording for visual changes.
- Notes about migrations, environment variables, or security impact.

Keep commits focused and avoid unrelated formatting changes.

## Human and AI assistance

This project is approximately **90% human-authored and 10% AI-assisted**. AI tools may help with exploration, drafting, or repetitive implementation, but human contributors must review generated changes, test them, and remain accountable for correctness, security, and maintainability.
