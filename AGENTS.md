# Repository Guidelines

## Project Structure & Module Organization

PropertyFlow AI has two independently installed and deployed applications:

- `frontend/`: Next.js App Router with React, TypeScript, and Tailwind CSS. Pages live in `app/`, shared API configuration in `lib/api.ts`, and static assets in `public/`.
- `backend/`: Express and TypeScript. `src/server.ts` registers routes; `src/routes/` handles HTTP validation; `src/agents/` coordinates lead processing; `src/services/` integrates Gemini, HubSpot, SMTP, and PostgreSQL.
- `backend/sql/`: database migrations, starting with `001_approvals.sql`.

The approval workflow is currently unregistered; its reviewer authentication middleware is missing. Backend compilation follows the active server dependency tree.

## Build, Test, and Development Commands

Run commands inside the relevant application directory; there is no root package script.

- `npm ci`: install dependencies from that application's lockfile.
- Backend: `npm run dev` starts Express with `tsx` watch mode, normally on port 4000; `npx tsc --noEmit` checks the active backend.
- Frontend: `npm run dev` starts Next.js, normally on port 3000; `npm run build` creates a production build; `npm start` serves it.
- Frontend: `npm run lint` runs ESLint; `npx tsc --noEmit` checks types.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, semicolons, and explicit TypeScript interfaces or types for API contracts. Follow existing suffixes such as `contacts.routes.ts`, `hubspot.service.ts`, and `lead.agent.ts`. Use PascalCase for React components and camelCase for functions. Validate external input with Zod and keep provider credentials and calls in backend services.

## Testing Guidelines

No automated test framework or coverage threshold is configured. Backend `npm test` is a placeholder that fails. Run relevant type checks and frontend lint/build checks. For new automated tests, use `*.test.ts` beside the module and document the runner. Mock Gemini, HubSpot writes, and SMTP; verify failure paths without creating real contacts or sending emails.

## Commit & Pull Request Guidelines

History uses short, informal summaries such as `add cors`; no enforced commit convention is evident. Write concise, action-oriented subjects. PRs should describe behavior, validation, configuration changes, and linked issues when applicable. Include screenshots for UI changes.

## Security & Configuration

Keep `.env` files and credentials untracked. Only expose public configuration through `NEXT_PUBLIC_*`; configure deployed API URLs and CORS together. See `backend/EMAIL_SETUP.md` for SMTP. Read `frontend/AGENTS.md` and the installed Next.js guides before frontend changes.
