# Quick deployment guide

Follow these steps to host locally or on a Windows server.

1) Fill backend/.env
- Copy backend/.env.example to backend/.env and set:
  - NODE_ENV=production
  - PORT=5000
  - MONGODB_URI=your Atlas URI
  - ALLOWED_ORIGINS=https://your-domain
  - JWT_SECRET=long-random-secret

2) One-command start (PowerShell)
- From project root:
  - ./start-prod.ps1
  - Optional: ./start-prod.ps1 -Port 8080

3) PM2 (optional – background service)
- Install pm2 globally:
  - npm i -g pm2
- Start:
  - pm2 start backend/ecosystem.config.js --env production
  - pm2 save
  - pm2 startup

4) Reverse proxy (recommended)
- Put Nginx/IIS in front to terminate HTTPS and forward / to http://127.0.0.1:PORT
- Ensure backend/.env ALLOWED_ORIGINS matches your public https URL exactly.

5) Verify
- Open http://localhost:PORT and /api/health

Notes
- Backend serves frontend/dist automatically in production.
- Static assets are cached; index.html is no-store for safe SPA updates.
- HSTS is enabled in production via helmet.
