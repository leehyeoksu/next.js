This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backend Tests (Python)

Backend-oriented tests live in `backend/`. They call the running Next.js app over HTTP.

- Start app: `npm run dev` (default http://localhost:3000)
- Setup venv (PowerShell): `./backend/scripts/setup.ps1` or `npm run backend:setup`
- Run tests (PowerShell): `./backend/scripts/test.ps1` or `npm run backend:test`
- Optional: change base URL in the same terminal: `$env:APP_BASE_URL = "http://localhost:3000"`

Note: The test suite assumes `LLM_PROVIDER=mock` so `/api/gpt` does not call external services.

## Orchestrated Dev (Next + FastAPI + optional Celery)

Run everything with one command using `dev.config.json` and a small Node orchestrator.

- Windows-only (default): `npm run dev`
- Config: `dev.config.json`
  - Enable/disable services by toggling `enabled`
  - Adjust commands, ports, env as needed
- Celery requires a broker (e.g., Redis). Set env:
  - `CELERY_BROKER_URL=redis://localhost:6379/0`
  - `CELERY_RESULT_BACKEND=redis://localhost:6379/0`

### WSL backend (FastAPI + Celery) with Windows Next.js

If you prefer to run FastAPI/Celery and Redis inside WSL (Ubuntu) while keeping Next.js on Windows:

1) Enable WSL2 + install Ubuntu (admin PowerShell, reboot may be required)
   - `dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart`
   - `dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart`
   - `wsl --install`
2) In Ubuntu (WSL) shell, create Linux venv and install deps
   - `bash /mnt/c/Users/User/myapp/backend/scripts/setup_wsl.sh`
3) Ensure dev.config.json matches your WSL distro name
   - Run `wsl -l -v` and set `wslDistro` (e.g., "Ubuntu")
4) Start everything from Windows
   - `npm run dev`
   - Orchestrator will launch Next on Windows, and FastAPI/Celery inside WSL using the Linux venv
5) Redis in WSL via Docker (example)
   - Install Docker Desktop with WSL integration, then in Windows: `docker run -d --name redis -p 6379:6379 redis:alpine`
   - Or install Redis inside WSL natively and expose on 6379

Scripts in `package.json` (manual runs)
- Frontend only: `npm run dev:next`
- API only: `npm run dev:api`
- Celery only: `npm run dev:celery`
